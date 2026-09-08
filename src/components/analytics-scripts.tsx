import Script from "next/script";

import { GA_MEASUREMENT_ID, analyticsEnabled } from "@/lib/analytics";

/**
 * Loads GA4. Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set,
 * so local development and CI stay silent and no placeholder ID ships.
 *
 * `afterInteractive` keeps gtag off the critical path — it must not delay
 * LCP on tool pages that already ship ~566KB of JS.
 */
export default function AnalyticsScripts() {
  if (!analyticsEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
