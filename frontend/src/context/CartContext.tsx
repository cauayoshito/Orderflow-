"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine, Product } from "@/lib/types";

const CART_KEY = "ofcc_cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const add = (product: Product, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.product.id === product.id);
        if (existing) {
          return prev.map((l) =>
            l.product.id === product.id
              ? { ...l, quantity: Math.min(l.quantity + quantity, product.stockQuantity) }
              : l,
          );
        }
        return [...prev, { product, quantity: Math.min(quantity, product.stockQuantity) }];
      });
    };
    const setQuantity = (productId: number, quantity: number) => {
      setLines((prev) =>
        prev
          .map((l) =>
            l.product.id === productId
              ? { ...l, quantity: Math.max(1, Math.min(quantity, l.product.stockQuantity)) }
              : l,
          )
          .filter((l) => l.quantity > 0),
      );
    };
    const remove = (productId: number) =>
      setLines((prev) => prev.filter((l) => l.product.id !== productId));
    const clear = () => setLines([]);

    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const total = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);

    return { lines, count, total, add, setQuantity, remove, clear };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
