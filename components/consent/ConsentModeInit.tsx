import Script from 'next/script'
import { CONSENT_KEY, CONSENT_VERSION } from '@/lib/consent'

/**
 * Sets Google Consent Mode v2 defaults BEFORE any Google tag (AdSense / GA) loads.
 *
 * - New visitors: everything ad/analytics related = "denied" until they choose.
 * - Returning visitors who already consented: their stored choice is applied
 *   immediately, so there's no flicker and ads can load right away.
 *
 * Place this in the <head> via the root layout, ABOVE any AdSense/GA script.
 * When you later add the AdSense <Script>, Consent Mode will gate it automatically.
 */
export default function ConsentModeInit() {
  const inline = `
    (function () {
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      window.gtag = window.gtag || gtag;

      var consent = null;
      try {
        var raw = localStorage.getItem(${JSON.stringify(CONSENT_KEY)});
        if (raw) {
          var p = JSON.parse(raw);
          if (p && p.version === ${CONSENT_VERSION}) consent = p;
        }
      } catch (e) {}

      var ad = consent && consent.advertising ? 'granted' : 'denied';
      var an = consent && consent.analytics ? 'granted' : 'denied';

      gtag('consent', 'default', {
        ad_storage: ad,
        ad_user_data: ad,
        ad_personalization: ad,
        analytics_storage: an,
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500
      });
    })();
  `.trim()

  return (
    <Script id="consent-mode-default" strategy="beforeInteractive">
      {inline}
    </Script>
  )
}
