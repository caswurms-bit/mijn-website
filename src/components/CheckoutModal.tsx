import { useEffect, useState } from 'react'
import type { FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

// Stripe laden met de publishable key (veilig — mag in de frontend)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Betaalformulier (binnen de Elements provider) ────────────────────────────
function PaymentForm({
  total,
}: {
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    // Stripe bevestigt de iDEAL betaling en stuurt de klant door naar de bank
    // Na de bank redirect komt de klant terug op de return_url
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?success=true`,
        payment_method_data: {
          billing_details: { email },
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* E-mail */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          E-mailadres
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jouw@email.nl"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Stripe Payment Element — toont iDEAL bankselectie */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Betaalmethode
        </label>
        <div className="border border-slate-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
          <PaymentElement
            options={{
              layout: 'tabs',
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
            Verbinden met bank...
          </>
        ) : (
          <>
            <ArrowRight size={18} />
            Betaal € {total.toLocaleString('nl-NL')}
          </>
        )}
      </button>

      {/* Trust */}
      <div className="flex items-center justify-center gap-5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1"><ShieldCheck size={11} /> Beveiligd door Stripe</span>
        <span className="flex items-center gap-1"><Zap size={11} /> iDEAL betaling</span>
        <span className="flex items-center gap-1"><CheckCircle2 size={11} /> 3 jaar garantie</span>
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
    fetch('http://localhost:3001/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setFetchError('Kon betaling niet starten. Controleer of de server draait.');
      })
      .catch(() => setFetchError('Geen verbinding met de server (localhost:3001).'));
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
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src={item.image}
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
