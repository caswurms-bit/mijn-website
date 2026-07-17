import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Send } from 'lucide-react';

const BUDGETS = ['Onder € 1.000', '€ 1.000 – € 1.500', '€ 1.500 – € 2.000', '€ 2.000 – € 3.000', 'Meer dan € 3.000'];

export default function CustomBuildModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(() => localStorage.getItem('pici_name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('pici_email') || '');
  const [budget, setBudget] = useState('');
  const [wishes, setWishes] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!budget) {
      setError('Selecteer eerst een budget.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('https://api.easypici.nl/api/request-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, budget, wishes }),
      });
      if (!res.ok) throw new Error();
      localStorage.setItem('pici_name', name);
      localStorage.setItem('pici_email', email);
      setDone(true);
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw of mail ons direct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Custom build aanvragen</h2>
            <p className="text-sm text-slate-400 mt-0.5">We bouwen jouw pc precies zoals jij het wilt</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={30} className="text-green-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Aanvraag verzonden!</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  We hebben je wensen ontvangen en sturen je een bevestiging per mail. We nemen zo snel mogelijk contact met je op om je custom build te bespreken.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Sluiten
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                {/* Naam + email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Naam</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jouw naam"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">E-mailadres</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jouw@email.nl"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Wat is je budget?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BUDGETS.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left ${
                          budget === b
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wensen */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Specifieke wensen <span className="text-slate-300 normal-case font-normal">(optioneel)</span>
                  </label>
                  <textarea
                    value={wishes}
                    onChange={e => setWishes(e.target.value)}
                    rows={3}
                    placeholder="Bijv. stille koeling, veel opslag, specifieke kleur, gebruik voor streaming…"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Versturen...</>
                  ) : (
                    <><Send size={16} /> Aanvraag versturen</>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
