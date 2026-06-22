"use client";

import Script from "next/script";

/**
 * Injects Google Analytics 4 and Meta (Facebook) Pixel when their IDs are
 * configured via env vars. Both are no-ops when the IDs are absent, so the app
 * runs cleanly in development without any tracking.
 *
 *   NEXT_PUBLIC_GA_ID         e.g. "G-XXXXXXX"
 *   NEXT_PUBLIC_META_PIXEL_ID e.g. "123456789012345"
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Fire a conversion event to whichever trackers are loaded. Safe everywhere. */
export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (typeof w.gtag === "function") {
    w.gtag("event", event, params);
  }
  if (typeof w.fbq === "function") {
    // Map our generic events to the closest standard Meta event.
    const standard = event === "Lead" ? "Lead" : event === "Purchase" ? "Purchase" : "CustomEvent";
    if (standard === "CustomEvent") w.fbq("trackCustom", event, params);
    else w.fbq("track", standard, params);
  }
}

export function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
