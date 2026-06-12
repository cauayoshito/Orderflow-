"use client";

import { useEffect, useState } from "react";
import type { Client } from "@stomp/stompjs";

export interface OrderStatusState {
  status: string | null;
  updatedAt: Date | null;
  connected: boolean;
}

// SockJS needs an http(s) URL; convert ws(s):// if NEXT_PUBLIC_WS_URL uses it.
function toHttpUrl(url: string): string {
  return url.replace(/^ws:\/\//i, "http://").replace(/^wss:\/\//i, "https://");
}

function resolveWsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
  return `${base}/ws`;
}

/**
 * Subscribes to live status updates for an order over STOMP/SockJS.
 * Auto-reconnects with a 3s backoff and cleans up on unmount.
 */
export function useOrderStatus(orderId: number): OrderStatusState {
  const [status, setStatus] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !orderId) return;

    let active = true;
    let client: Client | undefined;

    (async () => {
      // sockjs-client expects a `global` reference in the browser.
      (window as unknown as { global?: unknown }).global ??= window;
      const SockJS = (await import("sockjs-client")).default;
      const { Client: StompClient } = await import("@stomp/stompjs");

      const httpUrl = toHttpUrl(resolveWsUrl());

      client = new StompClient({
        webSocketFactory: () => new SockJS(httpUrl),
        reconnectDelay: 3000, // auto-reconnect backoff
        onConnect: () => {
          if (!active) return;
          setConnected(true);
          client?.subscribe(`/topic/orders/${orderId}`, (message) => {
            try {
              const body = JSON.parse(message.body);
              if (body.status) setStatus(body.status);
              setUpdatedAt(body.updatedAt ? new Date(body.updatedAt) : new Date());
            } catch {
              /* ignore malformed message */
            }
          });
          // Ask for the current status right after subscribing.
          client?.publish({ destination: `/app/orders/track/${orderId}` });
        },
        onWebSocketClose: () => {
          if (active) setConnected(false);
        },
        onStompError: () => {
          if (active) setConnected(false);
        },
      });

      client.activate();
    })();

    return () => {
      active = false;
      setConnected(false);
      client?.deactivate();
    };
  }, [orderId]);

  return { status, updatedAt, connected };
}
