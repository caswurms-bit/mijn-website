import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getSpecValue } from '../components/CubeModelSelector';
import AddToCartButton from '../components/AddToCartButton';

const TRUST_ITEMS = [
  'Direct klaar voor gebruik',
  'Windows & drivers geïnstalleerd',
  'Professioneel gebouwd en getest',
  '2 jaar garantie',
];

interface EliteSeriesPageProps {
  build: any;
  onAddToCart: (build: any) => void;
}

// Zelfde structuur/opbouw als de Cube Series-productpagina (hero, prijs, CTA,
// specs, USP's), maar met een donker, ruimer en zwaarder aangezet register —
// de Elite is de flagship build en mag dat uitstralen zonder dat de layout
// zelf verandert.
export default function EliteSeriesPage({ build, onAddToCart }: EliteSeriesPageProps) {
  const [added, setAdded] = useState(false);

  const specRows = [
    ['Processor', getSpecValue(build.specs, 'CPU:')],
    ['Videokaart', getSpecValue(build.specs, 'GPU:')],
    ['Werkgeheugen', getSpecValue(build.specs, 'RAM:')],
    ['Opslag', getSpecValue(build.specs, 'Opslag:')],
    ['Koeling', getSpecValue(build.specs, 'Koeling:')],
    ['Voeding', getSpecValue(build.specs, 'Voeding:')],
    ['Besturingssysteem', 'Windows 11'],
  ];

  const handleAdd = () => {
    if (added) return;
    // Elite heeft geen kleurkeuze (build.image bevat alleen 'black'), maar
    // krijgt toch een expliciete selectedColor mee zodat elk winkelwagen-
    // item altijd hetzelfde, voorspelbare veld heeft.
    onAddToCart({ ...build, selectedColor: 'black' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Gelaagde, kleur-getinte glow — subtiel premium accent, geen drukke
          textuur. will-change-transform dwingt een eigen GPU-laag af zodat
          de browser de dure blur-3xl-filter niet bij elk scroll-frame
          opnieuw hoeft te berekenen (anders hapert scrollen op deze pagina,
          in tegenstelling tot Cube Series die geen blur-elementen heeft). */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] rounded-full bg-brand-600/10 blur-3xl will-change-transform" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-brand-500/10 blur-3xl will-change-transform" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-400 transition-colors mb-12 sm:mb-16"
        >
          <ArrowLeft size={16} />
          Terug naar home
        </a>

        {/* Hero — extra witruimte en krachtigere typografie t.o.v. Cube Series */}
        <div className="text-center mb-14 sm:mb-20">
          <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-brand-400 mb-4 sm:mb-5">
            Flagship
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 sm:mb-6">Elite Series</h1>
          <p className="text-base sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Onze krachtigste build. Voor wie geen compromissen wil.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start"
        >
          {/* Links — liggende (1344×768, 7:4) productfoto, met zachte gloed
              erachter. Container volgt de foto's eigen aspect-ratio i.p.v.
              een vaste staande hoogte — anders zou deze brede foto klein en
              met veel lege ruimte erboven/eronder in een te hoge box komen
              te staan. Sticky op desktop, puur CSS zodat het meebewegen
              strak en direct aanvoelt i.p.v. vertraagd. */}
          <div className="md:sticky md:top-28">
            <div className="aspect-[7/4] relative">
              <div className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full bg-brand-600/20 blur-3xl will-change-transform" />
              <img
                src={build.detailImage ?? build.image.black}
                alt="Easy PiCi Elite Series"
                className="w-full h-full object-contain relative rounded-2xl sm:rounded-3xl"
              />
            </div>
          </div>

          {/* Rechts — naam, prijs, USP, omschrijving, specs, vertrouwen, CTA */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">{build.tier}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-2">{build.name}</h2>
            <span className="block text-3xl sm:text-4xl font-black text-white mb-5 sm:mb-6">{build.price}</span>

            {/* Belangrijkste USP, prominent direct onder de prijs */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={20} className="text-brand-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-black text-white">Direct klaar voor gebruik</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-2">
                Windows, drivers en updates zijn al geïnstalleerd. Geen installatie, geen instellingen, geen uitzoekwerk.
              </p>
              <p className="text-sm sm:text-base font-bold text-brand-400">
                Uitpakken. Aansluiten. Gamen.
              </p>
            </div>

            <p className="text-slate-400 leading-relaxed mb-10 sm:mb-12 text-base sm:text-lg">{build.description}</p>

            {/* Specificaties — rustige lijst, geen losse omkaderde blokken */}
            <div className="mb-10 sm:mb-12">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 sm:mb-6">Specificaties</h3>
              <div className="space-y-3.5">
                {specRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/10 pb-3.5 text-sm sm:text-base">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* USP's — compacte vertrouwenselementen, geen fanfare */}
            <div className="mb-10 sm:mb-12 space-y-3">
              {[...TRUST_ITEMS, build.deliveryText].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-brand-400 shrink-0" />
                  <span className="text-sm sm:text-base text-slate-300">{item}</span>
                </div>
              ))}
            </div>

            {/* In winkelwagen, tenzij het product niet leverbaar is */}
            <AddToCartButton stockStatus={build.stockStatus} added={added} onClick={handleAdd} />

            {/* Transparantie over productfoto's — subtiel, geen aandacht trekken */}
            <div className="mt-8 sm:mt-10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Goed om te weten</p>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Afbeeldingen dienen ter illustratie. Om de beste prijs en snelle levering te garanderen, kunnen merken en uiterlijke details van sommige onderdelen afwijken. De vermelde specificaties en prestaties blijven altijd gelijk of beter.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
