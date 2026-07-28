import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

// Stripe laden met de publishable key (veilig — mag in de frontend)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// In productie altijd exact dit domein voor de Stripe return_url — ongeacht
// via welke afwijkende variant (bv. zonder www) iemand toevallig checkout
// heeft gestart. Lokaal/preview blijft window.location.origin gebruikt zodat
// dev/test-omgevingen naar zichzelf terugkeren i.p.v. naar de live site.
const RETURN_ORIGIN = import.meta.env.PROD ? 'https://www.easypici.nl' : window.location.origin;

// ─── Betaalformulier (binnen de Elements provider) ────────────────────────────
function PaymentForm({
  total,
  clientSecret,
}: {
  total: number;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [addition, setAddition] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  // Nooit vooraf aangevinkt. termsError is los van de generieke error-tekst
  // zodat de checkbox alleen aria-invalid krijgt als ZIJN validatie faalde,
  // niet bij een latere Stripe-foutmelding.
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Vóór alles anders: zonder akkoord geen shipping-sync en geen
    // confirmPayment. Blokkeert de betaling hard, niet alleen visueel.
    if (!agreedToTerms) {
      setTermsError(true);
      setError('Je moet akkoord gaan met de Algemene voorwaarden voordat je kan afrekenen.');
      return;
    }
    setTermsError(false);

    setLoading(true);
    setError('');

    const fullName = `${firstName} ${lastName}`.trim();
    const line1 = `${street} ${houseNumber}${addition ? ' ' + addition : ''}`.trim();

    // De Payment Intent is al aangemaakt zodra deze modal opende (vóórdat de
    // klant zijn gegevens heeft ingevuld) — een metadata-update vereist de
    // secret key en kan dus alleen server-side, dus syncen we het adres apart
    // vóórdat de betaling wordt bevestigd. Dit blokkeert de betaling bij een
    // fout, zodat een bestelling nooit zonder afleveradres kan slagen.
    const paymentIntentId = clientSecret.split('_secret_')[0];
    try {
      const res = await fetch('https://api.easypici.nl/api/save-shipping-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId, email, firstName, lastName, street, houseNumber, addition, postalCode, city, country: 'NL',
        }),
      });
      if (!res.ok) throw new Error('save-shipping-details failed');
    } catch {
      setError('Kon je gegevens niet opslaan. Controleer je internetverbinding en probeer opnieuw.');
      setLoading(false);
      return;
    }

    // Stripe bevestigt de betaling en stuurt de klant (bij een redirect-
    // methode zoals iDEAL) door naar de bank. Na de bank redirect komt de
    // klant terug op de return_url — Stripe hangt hier zelf nog
    // payment_intent/redirect_status etc. aan vast.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${RETURN_ORIGIN}/success`,
        payment_method_data: {
          billing_details: {
            email,
            name: fullName,
            address: { line1, postal_code: postalCode, city, country: 'NL' },
          },
        },
      },
    });

    // Als we hier komen is er een fout (succesvolle betaling redirectt direct)
    if (stripeError) {
      setError(stripeError.message || 'Er ging iets mis. Probeer opnieuw.');
    }

    setLoading(false);
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Contactgegevens */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contactgegevens</h3>
        <div>
          <label className={labelClass}>E-mailadres</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="naam@voorbeeld.nl"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Voornaam</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Voornaam"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Achternaam</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Achternaam"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Afleveradres — verplicht, gaat mee met de Payment Intent zodat de
          bestelling nooit zonder afleveradres kan worden afgerond. */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Afleveradres</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Straat</label>
            <input
              type="text"
              required
              value={street}
              onChange={e => setStreet(e.target.value)}
              placeholder="Straatnaam"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Huisnummer</label>
            <input
              type="text"
              required
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              placeholder="12"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Toevoeging <span className="normal-case font-normal text-slate-400">(optioneel)</span></label>
          <input
            type="text"
            value={addition}
            onChange={e => setAddition(e.target.value)}
            placeholder="A, bis, etc."
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Postcode</label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
              placeholder="1234 AB"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Plaats</label>
            <input
              type="text"
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Voorburg"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Land</label>
          <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 text-sm">
            Nederland
          </div>
        </div>
      </div>

      {/* Betaling */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Betaling</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Na het klikken op de betaalknop word je veilig doorgestuurd naar Stripe om je betaling af te ronden.
        </p>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">iDEAL</span>
          <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">Wero</span>
        </div>
        {/* fields: 'never' voorkomt dat Stripe's element hier ALSNOG eigen
            naam/e-mail/adresvelden toont — die zijn al hierboven verzameld
            (Contactgegevens + Afleveradres) en worden apart meegegeven via
            payment_method_data. */}
        <div className="border border-slate-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
          <PaymentElement
            options={{
              layout: 'tabs',
              fields: {
                billingDetails: {
                  name: 'never',
                  email: 'never',
                  address: 'never',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Akkoordverklaring — verplicht, staat nooit vooraf aan; direct boven
          de betaalknop. htmlFor-koppeling + aria-invalid/aria-describedby
          zodat de validatie ook voor screenreaders duidelijk is. Links in
          een nieuw tabblad zodat ingevulde gegevens hier niet verloren gaan. */}
      <div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreedToTerms}
            onChange={e => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) { setTermsError(false); setError(''); }
            }}
            aria-invalid={termsError}
            aria-describedby={termsError ? 'agree-terms-error' : undefined}
            className="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-300 text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          />
          <label htmlFor="agree-terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
            Ik ga akkoord met de{' '}
            <a href="/voorwaarden" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-brand-600 font-semibold hover:underline">
              Algemene voorwaarden
            </a>{' '}
            en bevestig dat ik de{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-brand-600 font-semibold hover:underline">
              Privacyverklaring
            </a>{' '}
            en het beleid voor{' '}
            <a href="/garantie-retouren" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-brand-600 font-semibold hover:underline">
              Garantie &amp; Retouren
            </a>{' '}
            heb gelezen.
          </label>
        </div>
        {termsError && (
          <p id="agree-terms-error" role="alert" className="text-red-500 text-xs mt-2 pl-7">
            Je moet akkoord gaan met de voorwaarden voordat je kan afrekenen.
          </p>
        )}
      </div>

      {/* Foutmelding */}
      {error && !termsError && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Betalen knop — tekst maakt expliciet duidelijk dat dit tot een
          betalingsverplichting leidt, met het werkelijke totaalbedrag. */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-base hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verbinden met Stripe...
          </>
        ) : (
          <>
            <ArrowRight size={18} />
            Bestellen en betalen – € {total.toLocaleString('nl-NL')}
          </>
        )}
      </button>

      {/* Trust — "3 jaar garantie" linkt door naar de garantie/retour-pagina;
          target="_blank" zodat de klant het checkout-formulier niet kwijtraakt. */}
      <div className="flex items-center justify-center gap-5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1"><ShieldCheck size={11} /> Beveiligd door Stripe</span>
        <a
          href="/garantie-retouren"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-slate-600 transition-colors"
        >
          <CheckCircle2 size={11} /> 3 jaar garantie
        </a>
      </div>
    </form>
  );
}

// ─── Hoofd CheckoutModal ──────────────────────────────────────────────────────
export default function CheckoutModal({
  cart,
  onClose,
}: {
  cart: any[];
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState('');
  const [fetchError, setFetchError] = useState('');
  const total = cart.reduce((sum, item) => sum + item.priceNum, 0);

  // Haal clientSecret op van de backend zodra de modal opent
  useEffect(() => {
    fetch('https://api.easypici.nl/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    })
      .then(r => r.json())
      .then(data => {
        // TIJDELIJKE DEBUGLOGGING — verwijderen na bevestiging dat scrollen
        // stabiel werkt. Bevestigt of dit de ~1s-timing is waarop de modal
        // van spinner naar volledig formulier wisselt.
        console.log('[DEBUG-SCROLL] PaymentIntent geladen, formulier mount nu', { time: performance.now() });
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setFetchError('Kon betaling niet starten. Controleer of de server draait.');
      })
      .catch(() => setFetchError('Geen verbinding met de server (api.easypici.nl).'));
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="checkout-modal-height relative z-10 w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
        >
          {/* Links: besteloverzicht (donker) */}
          <div className="bg-slate-900 text-white p-8 sm:w-80 shrink-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-black tracking-tight">Easy PiCi</span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Jouw bestelling</p>
              <div className="space-y-4 mt-3">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-3">
                    <img
                      src={item.image[item.selectedColor] ?? item.image.black}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 opacity-90"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight truncate">{item.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.target}</p>
                    </div>
                    <p className="text-brand-400 font-black text-sm shrink-0">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaal */}
            <div className="mt-8 pt-6 border-t border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-sm">Verzending</span>
                <span className="text-green-400 text-sm font-semibold">Gratis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Totaal</span>
                <span className="text-2xl font-black text-white">€ {total.toLocaleString('nl-NL')}</span>
              </div>
            </div>
          </div>

          {/* Rechts: betaalformulier (wit) — min-h-0 is essentieel: een flex-
              item heeft standaard min-height:auto, waardoor het (in de
              flex-col mobiele layout) altijd op zijn volledige inhoud
              uitrekt i.p.v. binnen de resterende ruimte te blijven en zelf
              te scrollen — overflow-y-auto had daardoor in de praktijk geen
              effect meer zodra het formulier (met het adresblok erbij)
              hoger werd dan het scherm. overscroll-contain voorkomt dat een
              scroll die hier de rand raakt doorlekt naar de achtergrond;
              WebkitOverflowScrolling geeft vloeiend touch-scrollen op
              (oudere) iOS.

              data-lenis-prevent is de daadwerkelijke fix voor het "scrollt
              even, blokkeert dan"-probleem: Lenis luistert GLOBAAL op window
              naar wheel/touch-events. Zolang lenis.stop() actief is (de
              hele tijd dat deze modal open staat, zie App.tsx), roept Lenis
              op ÉLK wheel/touch-event preventDefault() aan — ook binnen deze
              container — TENZIJ een voorouder dit attribuut heeft; dat
              checkt Lenis vóór de isStopped-afhandeling (zie
              node_modules/lenis/dist/lenis.mjs, composedPath-check vóór de
              isStopped-check). Zonder dit attribuut kón hier dus nooit echt
              gescrold worden; het leek pas "na ~1s" te blokkeren omdat er
              vóór het laden van de Payment Intent nog nauwelijks content
              (dus niets om te scrollen) stond. touch-pan-y laat op CSS-niveau
              alvast verticaal pannen toe, onafhankelijk van JS-handlers. */}
          <div
            data-lenis-prevent
            className="flex-1 min-h-0 p-8 overflow-y-auto overscroll-contain touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <h2 className="text-xl font-black text-slate-900 mb-6">Afrekenen</h2>

            {fetchError ? (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{fetchError}</div>
            ) : !clientSecret ? (
              /* Laden */
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                      colorBackground: '#ffffff',
                      colorText: '#1e293b',
                      colorDanger: '#ef4444',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '12px',
                      spacingUnit: '4px',
                    },
                  },
                  locale: 'nl',
                }}
              >
                <PaymentForm total={total} clientSecret={clientSecret} />
              </Elements>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
