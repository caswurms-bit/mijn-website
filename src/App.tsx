import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import HeroScrollAnimation from './components/HeroScrollAnimation';
import CubeSeriesPage from './pages/CubeSeriesPage';
import EliteSeriesPage from './pages/EliteSeriesPage';
import CubeModelSelector, { type CubeModel } from './components/CubeModelSelector';
import TrustpilotWidget from './components/TrustpilotWidget';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Settings,
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  CheckCircle2,
  ShoppingBag,
  Trash2,
  CreditCard,
  Mail
} from 'lucide-react';

// Lazy geladen: geen van deze componenten is nodig voor de eerste render van
// de homepage (modals achter een klik, of losse content-pagina's) — zo
// blijven ze buiten de hoofdbundle. CheckoutModal trekt zo ook @stripe/*
// pas binnen op het moment dat iemand daadwerkelijk gaat afrekenen, i.p.v.
// dat Stripe's script al meekomt bij het laden van de homepage.
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const RequestBuildModal = lazy(() => import('./components/RequestBuildModal'));
const CustomBuildModal = lazy(() => import('./components/CustomBuildModal'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// --- DATA ---
const BUILDS = [
  {
    id: 'starter',
    name: 'Easy PiCi Starter',
    tier: 'Starter',
    price: '€ 1.299',
    priceNum: 1299,
    target: '1080p High / 1440p Ready',
    shortDesc: 'Perfect voor 1080p gaming.',
    description: 'RTX 5060 en een Intel Core i5-14400F voor soepel 1080p gamen. Volledig klaar aan huis — drivers en Windows al ingesteld.',
    specs: [
      'CPU: Intel Core i5-14400F',
      'GPU: RTX 5060',
      'RAM: 16 GB DDR4',
      'Opslag: 1 TB NVMe SSD',
      'Koeling: 240mm AIO',
      'Voeding: 650W 80+ Bronze',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Volledig geïnstalleerd geleverd — aansluiten en direct gamen.',
    stockStatus: 'in-stock',
    deliveryText: 'Verzending binnen 3 werkdagen',
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20zwart/product%20foto%20zwart%20.png',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/product%20foto%20wit.png',
    },
  },
  {
    id: 'performance',
    name: 'Easy PiCi Performance',
    tier: 'Performance',
    price: '€ 1.499',
    priceNum: 1499,
    target: '1440p High Gaming',
    badge: 'Meest gekozen',
    shortDesc: 'De beste prijs/prestatie.',
    description: 'RTX 5060 Ti en 32 GB geheugen voor moeiteloos 1440p gamen, multitasken en streamen. Onze meest gekozen build.',
    specs: [
      'CPU: Intel Core i5-14400F',
      'GPU: RTX 5060 Ti',
      'RAM: 32 GB DDR4',
      'Opslag: 1 TB NVMe SSD',
      'Koeling: 240mm AIO',
      'Voeding: 650W 80+ Bronze',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Meest gekozen — de beste prijs/prestatie van onze lineup.',
    stockStatus: 'in-stock',
    deliveryText: 'Verzending binnen 3 werkdagen',
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20zwart/product%20foto%20zwart%20.png',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/product%20foto%20wit.png',
    },
  },
  {
    id: 'pro',
    name: 'Easy PiCi Pro',
    tier: 'Pro',
    price: '€ 1.699',
    priceNum: 1699,
    target: 'Ultra Gaming Performance',
    shortDesc: 'Maximale prestaties voor fanatieke gamers.',
    description: 'RTX 5070 en 32 GB geheugen voor ultra instellingen zonder concessies. Voor wie alles uit zijn monitor wil halen.',
    specs: [
      'CPU: Intel Core i5-14400F',
      'GPU: RTX 5070',
      'RAM: 32 GB DDR4',
      'Opslag: 1 TB NVMe SSD',
      'Koeling: 240mm AIO',
      'Voeding: 750W 80+ Gold',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Op aanvraag gebouwd — zelfde kwaliteit en zorgvuldigheid als alle andere builds.',
    stockStatus: 'on-request',
    deliveryText: 'Verzending binnen 3 werkdagen',
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20zwart/product%20foto%20zwart%20.png',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/product%20foto%20wit.png',
    },
  },
  {
    id: 'elite',
    name: 'Easy PiCi Elite',
    tier: 'Elite',
    price: '€ 2.500',
    priceNum: 2500,
    target: 'High-End Gaming & Creatie',
    shortDesc: 'Onze krachtigste build. Voor wie geen compromissen wil en het maximale wil uit zijn setup.',
    description: 'De Elite is voor wie het maximale wil — en dat ook weet. Ryzen 9, RTX 5070 Ti, DDR5 en 2 TB opslag. Dit systeem is gebouwd voor zware games, streaming, video-editing en alles tegelijk. De 360mm AIO en het volledige glasdesign zijn bewust gekozen: dit is een pc om trots op te zijn, niet alleen om te presteren.',
    specs: [
      'CPU: Ryzen 9 9700X',
      'GPU: RTX 5070 Ti',
      'RAM: 32 GB DDR5',
      'Opslag: 2 TB NVMe SSD',
      'Koeling: 360mm AIO',
      'Voeding: 850W 80+ Gold',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Onze flagship build — voor wie het maximale wil, zonder concessies.',
    stockStatus: 'on-request',
    deliveryText: 'Wachttijd: 7 werkdagen',
    image: {
      black: 'https://lnzbfjukwcfzojuiqxgm.supabase.co/storage/v1/object/public/foto\'s%20computers/Whisk_0bc1c8f467c4a64aa6e4090fe75e32e9dr-ezgif.com-png-to-webp-converter.webp',
    },
  },
];

// "Direct klaar voor gebruik" is de belangrijkste belofte en krijgt een eigen
// prominente plek in FeaturesSection — deze 3 zijn de secundaire, ondersteunende
// redenen en blijven in de kleinere tegel-grid.
const FEATURES = [
  { icon: ShieldCheck, title: 'Eerlijke onderdelen', text: 'Elk onderdeel is gekozen op prestaties per euro — niet op marketing of een mooie doos.' },
  { icon: Wrench, title: 'Getest voor verzending', text: 'Elke pc wordt getest op temperatuur, stabiliteit en fps. Je weet exact wat je krijgt.' },
  { icon: Settings, title: 'Strak afgebouwd', text: 'Nette kabels, goede airflow en een kast om trots op te zijn. Ook van binnen klopt het.' },
];

// --- COMPONENTS ---

const HeroSection = () => (
  <HeroScrollAnimation>
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden px-4 pt-28 pb-16 sm:pt-36 sm:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
          Custom PC's.<br />
          <span className="text-brand-400">Gebouwd om te winnen.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          Handgebouwde gaming pc's. Eerlijke prijs. Geen onzin.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative z-10 flex flex-row gap-2 sm:gap-4 justify-center"
      >
        <a
          href="/#builds"
          className="px-4 py-3 sm:px-8 sm:py-4 bg-brand-600 text-white rounded-full text-sm sm:text-lg font-bold hover:bg-brand-700 transition-colors shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
        >
          Bekijk Builds <ArrowRight size={16} className="sm:w-5 sm:h-5" />
        </a>
        <a
          href="/#story"
          className="px-4 py-3 sm:px-8 sm:py-4 bg-white/10 text-white rounded-full text-sm sm:text-lg font-bold hover:bg-white/20 transition-colors whitespace-nowrap"
        >
          Ons Verhaal
        </a>
      </motion.div>
    </div>
  </HeroScrollAnimation>
);

const Navbar = ({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-white/10 overflow-hidden">
          <img
            src="https://lnzbfjukwcfzojuiqxgm.supabase.co/storage/v1/object/public/logo/IMG_0541.jpg"
            alt="Easy PiCi Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">Easy PiCi</span>
      </a>
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 font-semibold text-white">
        <div className="flex items-center gap-3 sm:gap-8 text-[11px] sm:text-base uppercase sm:normal-case tracking-wider sm:tracking-normal">
          <a href="/#builds" className="hidden sm:block hover:text-brand-400 transition-colors whitespace-nowrap">Onze Pc's</a>
          <a href="/#story" className="hover:text-brand-400 transition-colors whitespace-nowrap">Ons Verhaal</a>
        </div>
        <button
          onClick={onOpenCart}
          className="relative p-1.5 sm:p-2 text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <ShoppingBag size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-5 sm:h-5 bg-brand-500 text-white text-[7px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
        <a
          href="/#builds"
          className="px-4 py-2 sm:px-6 sm:py-2.5 bg-brand-600 text-white text-xs sm:text-base rounded-full hover:bg-brand-700 transition-colors shadow-[0_4px_16px_rgba(37,99,235,0.35)] whitespace-nowrap"
        >
          Shop Nu
        </a>
      </div>
    </div>
  </nav>
);

const FeaturesSection = () => (
  <section className="py-16 sm:py-24 px-6 bg-white relative z-30">
    <div className="max-w-7xl mx-auto">
      {/* Belangrijkste belofte — niet als technisch lijstje, maar als
          duidelijke, prominente uitspraak boven de ondersteunende redenen. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-12 sm:mb-20"
      >
        <div className="inline-flex items-center gap-2 text-brand-600 font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
          <Zap size={16} />
          Direct klaar voor gebruik
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">
          Wij doen het saaie werk.
        </h2>
        <p className="text-base sm:text-xl text-slate-500 leading-relaxed">
          Windows, drivers en updates zijn al geïnstalleerd. Jij hoeft alleen nog maar te gamen.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 hover:border-brand-100 hover:bg-brand-50/50 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-[border-color,background-color,box-shadow] duration-300"
          >
            <feat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-600 mb-4 sm:mb-6" />
            <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1 sm:mb-3">{feat.title}</h3>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">{feat.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const BuildCard = ({
  build,
  idx,
  color,
  onOpenBuild,
  onAddToCart,
  onRequestBuild,
}: {
  build: any;
  idx: number;
  color: 'black' | 'white';
  onOpenBuild: (b: any) => void;
  onAddToCart: (b: any) => void;
  onRequestBuild: (b: any) => void;
}) => {
  const [added, setAdded] = useState(false);
  // Nieuwe "los product op witte/zwarte achtergrond"-foto's (starter/performance/pro)
  // vs. de oude sfeervolle build-foto's (elite) — bepaalt of we object-contain +
  // witte achtergrond gebruiken i.p.v. object-cover + donkere gradient-overlay.
  const isProductPhoto = Boolean(build.image.white);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) return;
    onAddToCart(build);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      key={build.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      onClick={() => onOpenBuild(build)}
      className="group cursor-pointer flex flex-col rounded-2xl sm:rounded-3xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-shadow duration-300 p-5 sm:p-8"
    >
      <div className={`h-64 sm:h-96 overflow-hidden relative rounded-2xl sm:rounded-3xl ${isProductPhoto ? 'bg-white' : ''}`}>
        {!isProductPhoto && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 sm:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/0 to-transparent z-10 hidden sm:block" />
          </>
        )}
        <img
          src={build.image[color] ?? build.image.black}
          alt={build.name}
          loading="lazy"
          className={
            isProductPhoto
              ? 'w-full h-full object-contain p-6 sm:p-10'
              : 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          }
        />
        {build.badge && (
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-[10px] sm:text-xs font-bold text-white bg-brand-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            ⭐ {build.badge}
          </span>
        )}
        <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 text-[10px] sm:text-xs font-bold text-white bg-brand-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
          {build.target}
        </span>
      </div>
      <div className="pt-5 sm:pt-7 flex flex-col flex-1">
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
          build.id === 'performance' ? 'text-brand-600' : 'text-slate-400'
        }`}>
          {build.tier}
        </span>
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 mb-1.5 sm:mb-2 tracking-tight">{build.name}</h3>
        <p className="text-sm text-slate-500 mb-4 sm:mb-6 flex-1 leading-relaxed line-clamp-2">
          {build.shortDesc}
        </p>
        <div className="mt-auto space-y-3">
          <span className="block text-xl sm:text-2xl font-black text-brand-600">{build.price}</span>

          {/* CTA knop — afhankelijk van stockStatus */}
          {build.stockStatus === 'in-stock' && (
            <motion.button
              onClick={handleAdd}
              animate={added ? { backgroundColor: '#16a34a' } : { backgroundColor: '' }}
              transition={{ duration: 0.2 }}
              className="w-full py-3 bg-brand-600 text-white rounded-xl text-sm sm:text-base font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Toegevoegd!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Bestel direct
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {build.stockStatus === 'on-request' && (
            <button
              onClick={(e) => { e.stopPropagation(); onRequestBuild(build); }}
              className="w-full py-3 bg-brand-600 text-white rounded-xl text-sm sm:text-base font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Bestel direct
            </button>
          )}

          {build.stockStatus === 'unavailable' && (
            <button
              disabled
              className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-sm sm:text-base font-bold cursor-not-allowed flex items-center justify-center gap-2"
            >
              Niet beschikbaar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Eén overzichtstegel voor de hele Cube Series (Starter/Performance/Pro delen
// dezelfde behuizing). Bevat dezelfde premium segmented control als de
// Cube Series-productpagina. Bewust minimaal: alleen foto, selector, prijs,
// korte omschrijving en CTA — volledige specs/voorraad/levertijd horen op de
// productpagina, niet hier. Geen kaart-chrome (rand/schaduw): de foto en
// generieuze witruimte dragen de sectie, niet een omkaderde box.
const CubeSeriesOverviewCard = ({ color }: { color: 'black' | 'white' }) => {
  const [selectedModel, setSelectedModel] = useState<CubeModel>('performance');
  const starter = BUILDS.find((b) => b.id === 'starter')!;
  const build = BUILDS.find((b) => b.id === selectedModel)!;

  const goToSelectedModel = () => {
    window.location.href = `/cube-series?model=${selectedModel}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={goToSelectedModel}
      className="group cursor-pointer flex flex-col items-center text-center rounded-2xl sm:rounded-3xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-shadow duration-300 p-5 sm:p-8"
    >
      {/* Foto — blijft hetzelfde ongeacht het gekozen niveau. Groter dan Elite's
          foto, want Cube Series is de hoofdserie en mag dat visueel uitstralen. */}
      <div className="w-full h-72 sm:h-[28rem] relative mb-6 sm:mb-8">
        <img
          src={starter.image[color] ?? starter.image.black}
          alt="Easy PiCi Cube Series"
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-5 sm:mb-7">Cube Series</h3>

      {/* Segmented control mag niet de kaart-navigatie triggeren — stopt
          propagation al intern per knop (zie CubeModelSelector). */}
      <CubeModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} layoutId="cube-model-pill-home" />

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedModel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-6 sm:mt-8"
        >
          <span className="block text-2xl sm:text-3xl font-black text-brand-600">{build.price}</span>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {build.shortDesc}
          </p>
        </motion.div>
      </AnimatePresence>

      <a
        href={`/cube-series?model=${selectedModel}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-base sm:text-lg font-bold text-brand-600 hover:text-brand-700 group-hover:gap-3 transition-all duration-200"
      >
        Bekijk Cube {build.tier} <ArrowRight size={18} className="sm:w-5 sm:h-5" />
      </a>
    </motion.div>
  );
};

const BuildsSection = ({
  color,
  onColorChange,
  onAddToCart,
  onRequestBuild,
}: {
  color: 'black' | 'white';
  onColorChange: (c: 'black' | 'white') => void;
  onAddToCart: (b: any) => void;
  onRequestBuild: (b: any) => void;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const headingY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
  <section ref={sectionRef} id="builds" className="py-16 sm:py-24 px-4 sm:px-6 bg-white relative z-20">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8 sm:mb-10">
        <motion.h2 style={{ y: headingY }} className="text-3xl sm:text-5xl font-black text-slate-900 mb-3 sm:mb-4">Onze Builds</motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-base sm:text-xl text-slate-500"
        >Kies de serie die bij je past.</motion.p>
      </div>
      <div className="flex items-center justify-center gap-2 mb-8 sm:mb-12">
        <button
          onClick={() => onColorChange('black')}
          className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-sm sm:text-base font-bold transition-colors ${
            color === 'black' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Zwart
        </button>
        <button
          onClick={() => onColorChange('white')}
          className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-sm sm:text-base font-bold transition-colors border ${
            color === 'white' ? 'bg-white text-slate-900 border-slate-900' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
          }`}
        >
          Wit
        </button>
      </div>
      {/* Twee hoofdproducten: Cube Series (eigen productpagina) en Elite Series.
          Ruime gap i.p.v. een strakke kaartgrid — de secties staan zonder
          rand/schaduw, dus witruimte is hier de enige scheidingslijn. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 sm:gap-20 lg:gap-24">
        <CubeSeriesOverviewCard color={color} />
        {BUILDS.filter((build) => build.id === 'elite').map((build, idx) => (
          <BuildCard key={build.id} build={build} idx={idx} color={color} onOpenBuild={() => { window.location.href = '/elite-series'; }} onAddToCart={onAddToCart} onRequestBuild={onRequestBuild} />
        ))}
      </div>
    </div>
  </section>
  );
};

const StorySection = () => (
  <section id="story" className="py-16 sm:py-24 px-6 bg-slate-900 text-white">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">Waarom Easy PiCi bestaat</h2>
        <p className="text-lg sm:text-xl text-brand-400 font-medium mb-8 sm:mb-12">
          Als gamer heb je meestal twee opties: te veel betalen voor een naam, of zelf bouwen en hopen dat het goed komt. Wij kozen voor een derde weg.
        </p>
      </motion.div>
      <div className="grid grid-cols-2 gap-4 sm:gap-12 mb-10 sm:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs sm:text-sm">1</span>
            <span className="leading-tight">Wat er mis is met de rest</span>
          </h3>
          <p className="text-xs sm:text-lg text-slate-300 leading-relaxed">
            Je betaalt vaak voor een naam en marketing, niet voor kwaliteit. Willekeurige onderdelen, matige afwerking — je weet nooit precies wat je krijgt.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs sm:text-sm">2</span>
            <span className="leading-tight">Hoe wij het anders doen</span>
          </h3>
          <p className="text-xs sm:text-lg text-slate-300 leading-relaxed">
            Wij bouwen elke pc met dezelfde zorg als voor onszelf. Eerlijke onderdelen, vakkundige afwerking, volledig getest voordat hij de deur uitgaat.
          </p>
        </motion.div>
      </div>

      {/* Belangrijkste USP — eigen prominente plek, zelfde stijl als de USP-box
          op de productpagina's, zodat de belofte overal even zwaar weegt. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Zap size={20} className="text-brand-400 shrink-0" />
          <h3 className="text-lg sm:text-2xl font-black text-white">Direct klaar voor gebruik</h3>
        </div>
        <p className="text-sm sm:text-lg text-slate-300 leading-relaxed mb-3 sm:mb-4 max-w-2xl">
          Je hoeft niets zelf uit te zoeken of te installeren. Windows, drivers en de belangrijkste instellingen staan al goed.
        </p>
        <p className="text-base sm:text-xl font-bold text-brand-400">
          Uitpakken. Aansluiten. Gamen.
        </p>
      </motion.div>

      {/* Wat je mag verwachten blok */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10"
      >
        <h3 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6">
          Wat je van iedere Easy PiCi mag verwachten:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            'Onderdelen gekozen op prestatie, niet op naam.',
            'Getest op temperatuur, stabiliteit en fps voor verzending.',
            'Verzending binnen 3 werkdagen, netjes verpakt.',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-brand-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

const TrustpilotSection = () => (
  <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto">
      <TrustpilotWidget />
    </div>
  </section>
);

const CustomRequestSection = ({ onOpen }: { onOpen: () => void }) => (
  <section className="py-16 sm:py-24 px-6 bg-white">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 sm:mb-6">
          Iets speciaals in gedachten?
        </h2>
        <p className="text-base sm:text-xl text-slate-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Heb je een specifiek budget, een bepaald spel of een eigen wens? We bouwen ook volledig op maat. Stuur ons een berichtje en we denken met je mee.
        </p>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full text-lg font-bold hover:bg-slate-800 transition-colors shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        >
          <Mail size={20} />
          Vraag een custom build aan
        </button>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-10 sm:py-14 px-6 bg-slate-950 border-t border-slate-900">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <a href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src="https://lnzbfjukwcfzojuiqxgm.supabase.co/storage/v1/object/public/logo/IMG_0541.jpg"
            alt="Easy PiCi Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-white font-bold">Easy PiCi</span>
      </a>
      <p className="text-slate-500 text-sm text-center">
        © {new Date().getFullYear()} Easy PiCi · Handgebouwde gaming pc's · Voorburg, NL
      </p>
      <div className="flex items-center gap-4 sm:gap-6">
        <a
          href="/voorwaarden"
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Voorwaarden
        </a>
        <a
          href="/privacy"
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Privacy
        </a>
        <a
          href="mailto:info@easypici.nl"
          className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          <Mail size={14} />
          info@easypici.nl
        </a>
      </div>
    </div>
  </footer>
);

const CartModal = ({
  cart,
  onClose,
  onRemove,
  onCheckout,
}: {
  cart: any[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) => {
  const total = cart.reduce((sum, item) => sum + item.priceNum, 0);
  const [ordered] = useState(false);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%', opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 1 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative sm:hidden bg-white rounded-t-3xl w-full max-h-[90vh] shadow-2xl z-10 flex flex-col"
        >
          <CartPanelContent cart={cart} onClose={onClose} onRemove={onRemove} ordered={ordered} total={total} onCheckout={onCheckout} />
        </motion.div>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative hidden sm:flex flex-col bg-white h-full w-full max-w-md shadow-2xl z-10"
        >
          <CartPanelContent cart={cart} onClose={onClose} onRemove={onRemove} ordered={ordered} total={total} onCheckout={onCheckout} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CartPanelContent = ({
  cart, onClose, onRemove, ordered, total, onCheckout,
}: {
  cart: any[];
  onClose: () => void;
  onRemove: (id: string) => void;
  ordered: boolean;
  total: number;
  onCheckout: () => void;
}) => {

  return (
  <>
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
      <div>
        <h2 className="text-xl font-black text-slate-900">Winkelwagen</h2>
        {cart.length > 0 && !ordered && (
          <p className="text-xs text-slate-400 mt-0.5">{cart.length} {cart.length === 1 ? 'product' : 'producten'}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
      >
        <X size={16} />
      </button>
    </div>

    {ordered ? (
      /* Success state */
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Aanvraag ontvangen!</h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
          We nemen zo snel mogelijk contact met je op om de bestelling te bevestigen.
        </p>
        <button
          onClick={onClose}
          className="mt-8 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          Sluiten
        </button>
      </div>
    ) : cart.length === 0 ? (
      /* Empty state */
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5">
          <ShoppingBag size={28} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Je winkelwagen is leeg</h3>
        <p className="text-slate-400 text-sm mb-7">Voeg een build toe om te beginnen.</p>
        <a
          href="/#builds"
          onClick={onClose}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-semibold text-sm hover:bg-brand-700 transition-colors"
        >
          Bekijk builds
        </a>
      </div>
    ) : (
      <>
        {/* Scrollable product list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {cart.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <img src={item.image.black} alt={item.name} loading="lazy" className="w-16 h-16 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-tight">{item.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{item.target}</p>
                <p className="text-brand-600 font-black text-sm mt-1">{item.price}</p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-400 rounded-xl transition-colors shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 pt-4 pb-6">
          {/* Totaal */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-slate-500">Totaal</p>
              <p className="text-xs text-slate-400 mt-0.5">Verzending: gratis</p>
            </div>
            <span className="text-2xl font-black text-brand-600">€ {total.toLocaleString('nl-NL')}</span>
          </div>

          {/* CTA knoppen */}
          <button
            onClick={onCheckout}
            className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 mb-3"
          >
            <CreditCard size={18} />
            Afrekenen met iDEAL
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:info@easypici.nl?subject=Bestelling: ${cart.map((i) => i.name).join(', ')}`;
            }}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Mail size={16} />
            Bestellen via mail
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck size={11} /> Veilig</span>
            <span className="flex items-center gap-1"><Zap size={11} /> Snel geregeld</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} /> 3 jaar garantie</span>
          </div>
        </div>
      </>
    )}
  </>
  );
};

// --- SUCCES PAGINA ---
const SuccessPage = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
    >
      {/* Groene top-balk */}
      <div className="bg-green-500 px-8 py-6 text-white text-center">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-black">Bedankt voor je bestelling!</h1>
        <p className="text-green-100 text-sm mt-1">Je betaling is succesvol ontvangen.</p>
      </div>

      {/* Content */}
      <div className="px-8 py-8 space-y-6">
        {/* Wat nu? */}
        <div>
          <h2 className="text-base font-black text-slate-900 mb-3">Wat gebeurt er nu?</h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Je ontvangt een bevestigingsmail met een overzicht van je bestelling en een factuur.' },
              { step: '2', text: 'We beginnen direct met het samenstellen en bouwen van jouw pc.' },
              { step: '3', text: 'Elke build wordt zorgvuldig getest op temperatuur, stabiliteit en prestaties.' },
              { step: '4', text: 'Zodra je pc klaar is, sturen we hem veilig verpakt op. Levertijd: 2–7 werkdagen.' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info blok */}
        <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-500 leading-relaxed">
          Heb je een vraag over je bestelling? Stuur een mail naar{' '}
          <a href="mailto:info@easypici.nl" className="text-brand-600 font-semibold hover:underline">info@easypici.nl</a>{' '}
          en we helpen je zo snel mogelijk.
        </div>

        {/* Knoppen */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            className="flex-1 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Terug naar home
          </a>
          <a
            href="/#builds"
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Bekijk onze builds
          </a>
        </div>
      </div>
    </motion.div>
  </div>
);

// --- APP ---
export default function App() {
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [requestBuild, setRequestBuild] = useState<any>(null);
  const [customBuildOpen, setCustomBuildOpen] = useState(false);
  // Globale kleurkeuze (zwart/wit) voor de builds-sectie.
  const [buildColor, setBuildColor] = useState<'black' | 'white'>('black');

  // Links als "/#builds" of "/#story" (bv. vanaf een productpagina) laden de
  // homepage opnieuw met een hash in de URL — de browser scrollt dan zelf
  // naar het element met dat id, maar alleen als dat element al bestaat op
  // het moment dat de browser die scroll probeert uit te voeren. Bij een
  // React-app is dat niet gegarandeerd, dus regelen we het hier zelf zodra
  // de homepage klaar is met renderen.
  useEffect(() => {
    if (window.location.pathname !== '/' || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Stripe stuurt de klant terug met ?success=true in de URL
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get('success') === 'true';

  // Toon de succespagina als Stripe terugkeert met success=true
  if (isSuccess) return <SuccessPage />;

  // Losse content-pagina's op basis van het pathname — lazy, dus met Suspense.
  const { pathname } = window.location;
  if (pathname === '/voorwaarden') return <Suspense fallback={null}><TermsPage /></Suspense>;
  if (pathname === '/privacy') return <Suspense fallback={null}><PrivacyPage /></Suspense>;

  const addToCart = (build: any) => setCart((prev) => [...prev, build]);
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

  // Cube Series heeft een eigen productpagina met segmented control
  // (?model=starter|performance|pro), maar deelt cart/checkout/aanvraag
  // met de rest van de site — vandaar dezelfde Navbar/Footer/modals shell.
  if (pathname === '/cube-series') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
        <CubeSeriesPage builds={BUILDS} onAddToCart={addToCart} onRequestBuild={setRequestBuild} />
        <Footer />
        <AnimatePresence>
          {cartOpen && (
            <CartModal
              cart={cart}
              onClose={() => setCartOpen(false)}
              onRemove={removeFromCart}
              onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
            />
          )}
        </AnimatePresence>
        {checkoutOpen && (
          <Suspense fallback={null}>
            <CheckoutModal cart={cart} onClose={() => setCheckoutOpen(false)} />
          </Suspense>
        )}
        {requestBuild && (
          <Suspense fallback={null}>
            <RequestBuildModal buildName={requestBuild.name} onClose={() => setRequestBuild(null)} />
          </Suspense>
        )}
      </div>
    );
  }

  // Elite Series heeft, net als Cube Series, een eigen productpagina i.p.v.
  // een modal — zelfde shell (Navbar/Footer/modals), zodat cart/checkout/
  // aanvraag overal hetzelfde blijven werken.
  if (pathname === '/elite-series') {
    const elite = BUILDS.find((b) => b.id === 'elite')!;
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
        <EliteSeriesPage build={elite} onAddToCart={addToCart} onRequestBuild={setRequestBuild} />
        <Footer />
        <AnimatePresence>
          {cartOpen && (
            <CartModal
              cart={cart}
              onClose={() => setCartOpen(false)}
              onRemove={removeFromCart}
              onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
            />
          )}
        </AnimatePresence>
        {checkoutOpen && (
          <Suspense fallback={null}>
            <CheckoutModal cart={cart} onClose={() => setCheckoutOpen(false)} />
          </Suspense>
        )}
        {requestBuild && (
          <Suspense fallback={null}>
            <RequestBuildModal buildName={requestBuild.name} onClose={() => setRequestBuild(null)} />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
      <HeroSection />
      <FeaturesSection />
      <StorySection />
      <BuildsSection color={buildColor} onColorChange={setBuildColor} onAddToCart={addToCart} onRequestBuild={setRequestBuild} />
      <CustomRequestSection onOpen={() => setCustomBuildOpen(true)} />
      <TrustpilotSection />
      <Footer />
      <AnimatePresence>
        {cartOpen && (
          <CartModal
            cart={cart}
            onClose={() => setCartOpen(false)}
            onRemove={removeFromCart}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
          />
        )}
      </AnimatePresence>
      {checkoutOpen && (
        <Suspense fallback={null}>
          <CheckoutModal cart={cart} onClose={() => setCheckoutOpen(false)} />
        </Suspense>
      )}
      {requestBuild && (
        <Suspense fallback={null}>
          <RequestBuildModal buildName={requestBuild.name} onClose={() => setRequestBuild(null)} />
        </Suspense>
      )}
      {customBuildOpen && (
        <Suspense fallback={null}>
          <CustomBuildModal onClose={() => setCustomBuildOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
