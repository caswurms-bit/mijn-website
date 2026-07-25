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
}: {
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    // Stripe bevestigt de betaling en stuurt de klant (bij een redirect-
    // methode zoals iDEAL) door naar de bank. Na de bank redirect komt de
    // klant terug op de return_url — Stripe hangt hier zelf nog
    // payment_intent/redirect_status etc. aan vast.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${RETURN_ORIGIN}/success`,
        payment_method_data: {
          billing_details: { email, name },
        },
      },
    });

    // Als we hier komen is er een fout (succesvolle betaling redirectt direct)
    if (stripeError) {
      setError(stripeError.message || 'Er ging iets mis. Probeer opnieuw.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Contactgegevens */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contactgegevens</h3>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            E-mailadres
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="naam@voorbeeld.nl"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Volledige naam
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Voor- en achternaam"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
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
        {/* fields: 'never' voorkomt dat Stripe's element hier ALSNOG een
            eigen naam/e-mail-veld toont — die zijn al hierboven verzameld
            en worden apart meegegeven via payment_method_data. */}
        <div className="border border-slate-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
          <PaymentElement
            options={{
              layout: 'tabs',
              fields: {
                billingDetails: {
                  name: 'never',
                  email: 'never',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Foutmelding */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Betalen knop */}
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
            Betaal € {total.toLocaleString('nl-NL')}
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
          className="relative z-10 w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row max-h-[90vh]"
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

          {/* Rechts: betaalformulier (wit) */}
          <div className="flex-1 p-8 overflow-y-auto">
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
                <PaymentForm total={total} />
              </Elements>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
