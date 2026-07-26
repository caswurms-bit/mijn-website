import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('https://api.easypici.nl/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error('Versturen mislukt');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-8 sm:mb-12"
        >
          <ArrowLeft size={16} />
          Terug naar home
        </a>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Contact
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-10 sm:mb-14">
          Heb je een vraag over een bestelling, garantie of iets anders? Stuur ons een bericht — we reageren binnen één werkdag.
        </p>

        {status === 'sent' ? (
          <div className="flex flex-col items-center text-center py-12 sm:py-16">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Bericht verstuurd!</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Bedankt voor je bericht. Je ontvangt zo een bevestiging per e-mail — wij reageren binnen één werkdag.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Naam
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Voor- en achternaam"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@voorbeeld.nl"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Onderwerp <span className="normal-case font-normal text-slate-400">(optioneel)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Waar gaat je bericht over?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Bericht
              </label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Vertel ons waar we mee kunnen helpen..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">
                Er ging iets mis bij het versturen. Probeer het opnieuw, of mail ons direct op{' '}
                <a href="mailto:info@easypici.nl" className="font-semibold hover:underline">info@easypici.nl</a>.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 text-white rounded-2xl font-bold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Versturen...' : 'Verstuur bericht'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
