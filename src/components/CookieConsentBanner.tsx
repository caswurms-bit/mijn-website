import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'pici_cookie_consent';

type ConsentChoice = 'granted' | 'denied';

// Consent Mode v2 staat in index.html standaard op 'denied' — dit is de
// enige plek die 'm ooit op 'granted' zet, en alleen na een expliciete
// keuze van de bezoeker.
function grantConsent() {
  window.gtag?.('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
}

function getStoredConsent(): ConsentChoice | null {
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  return stored === 'granted' || stored === 'denied' ? stored : null;
}

export default function CookieConsentBanner() {
  // Lazy initializer i.p.v. een effect: leest localStorage synchroon vóór de
  // eerste render, zodat de banner nooit even flitst als er al een keuze is.
  // null = nog geen keuze gemaakt (banner tonen).
  const [choice, setChoice] = useState<ConsentChoice | null>(() => getStoredConsent());

  // Een eerder gegeven 'granted'-keuze moet bij elk nieuw bezoek opnieuw aan
  // gtag doorgegeven worden — de default in index.html staat immers bij elke
  // paginalading weer op 'denied' totdat dit gebeurt.
  useEffect(() => {
    if (choice === 'granted') grantConsent();
  }, [choice]);

  const handleChoice = (next: ConsentChoice) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, next);
    setChoice(next);
    // Bij 'denied' hoeft er verder niets aangeroepen te worden — de
    // bestaande 'denied'-status uit index.html blijft dan gewoon van kracht.
  };

  return (
    <AnimatePresence>
      {choice === null && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="fixed bottom-0 inset-x-0 z-[80] p-4 sm:p-6"
        >
          <div className="max-w-3xl mx-auto bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl sm:rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              We gebruiken cookies om onze website te verbeteren en advertenties te meten. Lees meer in ons{' '}
              <a href="/privacy" className="text-brand-400 font-semibold hover:underline">privacybeleid</a>.
            </p>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => handleChoice('denied')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 active:bg-white/25 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                Weigeren
              </button>
              <button
                onClick={() => handleChoice('granted')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-600 text-white rounded-full text-sm font-bold hover:bg-brand-700 active:bg-brand-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
              >
                Accepteren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
