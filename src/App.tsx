import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import HeroScrollAnimation from './components/HeroScrollAnimation';
import CubeSeriesPage from './pages/CubeSeriesPage';
import EliteSeriesPage from './pages/EliteSeriesPage';
import CubeModelSelector, { type CubeModel } from './components/CubeModelSelector';
import TrustpilotWidget from './components/TrustpilotWidget';
import CookieConsentBanner from './components/CookieConsentBanner';
import { REVIEWS } from './data/reviews';
import { useLenis } from 'lenis/react';
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
  Mail,
  Star
} from 'lucide-react';

// Lazy geladen: geen van deze componenten is nodig voor de eerste render van
// de homepage (modals achter een klik, of losse content-pagina's) — zo
// blijven ze buiten de hoofdbundle. CheckoutModal trekt zo ook @stripe/*
// pas binnen op het moment dat iemand daadwerkelijk gaat afrekenen, i.p.v.
// dat Stripe's script al meekomt bij het laden van de homepage.
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const GarantiePage = lazy(() => import('./pages/GarantiePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

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
    warranty: '2 jaar hardwaregarantie op de complete pc.',
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
    warranty: '2 jaar hardwaregarantie op de complete pc.',
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
    warranty: '2 jaar hardwaregarantie op de complete pc.',
    note: 'Direct leverbaar — zelfde kwaliteit en zorgvuldigheid als alle andere builds.',
    stockStatus: 'in-stock',
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
    description: 'De Elite is voor wie het maximale wil — en dat ook weet. Ryzen 7, RTX 5070 Ti, DDR5 en 2 TB opslag. Dit systeem is gebouwd voor zware games, streaming, video-editing en alles tegelijk. De 360mm AIO en het volledige glasdesign zijn bewust gekozen: dit is een pc om trots op te zijn, niet alleen om te presteren.',
    specs: [
      'CPU: Ryzen 7 9700X',
      'GPU: RTX 5070 Ti',
      'RAM: 32 GB DDR5',
      'Opslag: 2 TB NVMe SSD',
      'Koeling: 360mm AIO',
      'Voeding: 850W 80+ Gold',
    ],
    warranty: '2 jaar hardwaregarantie op de complete pc.',
    note: 'Onze flagship build — voor wie het maximale wil, zonder concessies.',
    stockStatus: 'in-stock',
    deliveryText: 'Verzending binnen 3 werkdagen',
    // black/white wijzen naar dezelfde foto (Elite heeft geen kleurkeuze),
    // maar white moet gezet zijn zodat BuildCard's isProductPhoto-check
    // (Boolean(build.image.white)) deze nieuwe "product foto op witte
    // achtergrond" ook echt als zodanig behandelt — anders zou de oude
    // sfeervolle-foto-styling (donkere gradient-overlay + object-cover) op
    // deze duidelijk andere foto worden toegepast.
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/elite%20foto%20vierkantde%20goede.jpg',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/elite%20foto%20vierkantde%20goede.jpg',
    },
    // Losse, liggende foto specifiek voor de Elite Series-productpagina
    // (EliteSeriesPage) — apart van de (staande) homepage-kaartfoto hierboven.
    detailImage: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/elite%20foto%20liggend.jpg',
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
            src="https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/logo%20easy%20pici.jpeg"
            alt="Easy PiCi Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">Easy PiCi</span>
      </a>
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 font-semibold text-white">
        <div className="flex items-center gap-3 sm:gap-8 text-[11px] sm:text-base uppercase sm:normal-case tracking-wider sm:tracking-normal">
          {/* Beide op hidden sm:block — samen met logo, cart-icoon en
              "Shop Nu" wordt de rij op de smalste telefoons (~360px) anders
              net te breed voor de beschikbare ruimte, wat de fixed navbar
              (en daarmee de hele pagina) horizontaal liet overflowen. */}
          <a href="/#builds" className="hidden sm:block hover:text-brand-400 transition-colors whitespace-nowrap">Onze Pc's</a>
          <a href="/#story" className="hidden sm:block hover:text-brand-400 transition-colors whitespace-nowrap">Ons Verhaal</a>
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
}: {
  build: any;
  idx: number;
  color: 'black' | 'white';
  onOpenBuild: (b: any) => void;
  onAddToCart: (b: any) => void;
}) => {
  const [added, setAdded] = useState(false);
  // "Los product op witte achtergrond"-foto's (heeft een white-variant) vs.
  // een sfeervolle build-foto zonder witte achtergrond — bepaalt of we
  // object-contain + witte achtergrond gebruiken i.p.v. object-cover +
  // donkere gradient-overlay.
  const isProductPhoto = Boolean(build.image.white);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) return;
    // De geselecteerde kleur meegeven aan het winkelwagen-item — anders
    // toont de winkelwagen altijd de zwarte foto, ongeacht welke uitvoering
    // daadwerkelijk gekozen was.
    onAddToCart({ ...build, selectedColor: color });
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
      {/* aspect-square i.p.v. een vaste (niet-vierkante) hoogte: de foto is
          zelf vierkant, en bij een niet-passende boxverhouding laat
          object-contain de foto met lege ruimte aan de zijkanten "zweven"
          — de rounded-* op de <img> zelf raakt dan nooit de zichtbare
          pixels en blijft onzichtbaar. Met een vierkante box vult de foto
          de box precies, waardoor de afgeronde hoeken wél zichtbaar zijn. */}
      <div className={`aspect-square overflow-hidden relative rounded-2xl sm:rounded-3xl ${isProductPhoto ? 'bg-white' : ''}`}>
        {!isProductPhoto && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 sm:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/0 to-transparent z-10 hidden sm:block" />
          </>
        )}
        {isProductPhoto ? (
          // Padding op een losse wrapper i.p.v. op de <img> zelf: anders zit
          // er altijd een padding-brede rand tussen de <img>'s eigen
          // doosrand (waar rounded-* op geclipt wordt) en de zichtbare foto
          // erbinnen — waardoor de afronding nooit de foto zelf raakt en
          // onzichtbaar blijft, ongeacht de boxverhouding.
          <div className="w-full h-full">
            <img
              src={build.image[color] ?? build.image.black}
              alt={build.name}
              loading="lazy"
              className="w-full h-full object-contain rounded-2xl sm:rounded-3xl"
            />
          </div>
        ) : (
          <img
            src={build.image[color] ?? build.image.black}
            alt={build.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {build.badge && (
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-[10px] sm:text-xs font-bold text-white bg-brand-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            ⭐ {build.badge}
          </span>
        )}
        <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 text-[10px] sm:text-xs font-bold text-white bg-brand-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
          {build.target}
        </span>
      </div>
      <div className="pt-5 sm:pt-7 flex flex-col flex-1 items-center text-center">
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
          build.id === 'performance' ? 'text-brand-600' : 'text-slate-400'
        }`}>
          {build.tier}
        </span>
        {/* Zelfde font-size/weight/marge als de titel op de Cube Series-tegel */}
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-5 sm:mb-7">{build.name}</h3>
        <div className="mt-auto w-full">
          {/* Prijs + korte tagline gecentreerd, zelfde styling/positionering
              als de prijs + shortDesc op de Cube Series-overzichtstegel. */}
          <div className="text-center">
            <span className="block text-2xl sm:text-3xl font-black text-brand-600">{build.price}</span>
            <p className="text-sm sm:text-base text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Onze krachtigste build.
            </p>
          </div>

          {/* CTA knop — afhankelijk van stockStatus, zelfde breedte/positie
              (max-w-xs mx-auto) als de knop op de Cube Series-tegel i.p.v.
              vrijwel de volledige kaartbreedte. */}
          <div className="mt-5 sm:mt-6 max-w-xs mx-auto">
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
                      In winkelwagen
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
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

          {/* Zelfde "Bekijk ..." link als de Cube Series-kaart, zodat beide
              homepage-kaarten dezelfde affordances bieden ondanks dat de
              hele kaart al klikbaar is. */}
          <a
            href="/elite-series"
            onClick={(e) => e.stopPropagation()}
            className="mt-5 sm:mt-6 inline-flex items-center gap-2 text-base sm:text-lg font-bold text-brand-600 hover:text-brand-700 group-hover:gap-3 transition-all duration-200"
          >
            Bekijk Elite Series <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </a>
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
const CubeSeriesOverviewCard = ({
  color,
  onAddToCart,
}: {
  color: 'black' | 'white';
  onAddToCart: (b: any) => void;
}) => {
  const [selectedModel, setSelectedModel] = useState<CubeModel>('performance');
  const [added, setAdded] = useState(false);
  const starter = BUILDS.find((b) => b.id === 'starter')!;
  const build = BUILDS.find((b) => b.id === selectedModel)!;

  const goToSelectedModel = () => {
    window.location.href = `/cube-series?model=${selectedModel}`;
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) return;
    onAddToCart({ ...build, selectedColor: color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={goToSelectedModel}
      className="group cursor-pointer flex flex-col items-center text-center rounded-2xl sm:rounded-3xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-shadow duration-300 p-5 sm:p-8"
    >
      {/* Foto — blijft hetzelfde ongeacht het gekozen niveau. aspect-square
          i.p.v. een vaste hoogte: de foto is zelf vierkant, en bij een
          niet-passende boxverhouding laat object-contain 'm met lege ruimte
          aan de zijkanten "zweven" — de rounded-* op de <img> raakt dan
          nooit de zichtbare pixels en blijft onzichtbaar. */}
      <div className="w-full aspect-square relative mb-6 sm:mb-8 p-3 sm:p-4">
        <img
          src={starter.image[color] ?? starter.image.black}
          alt="Easy PiCi Cube Series"
          loading="lazy"
          className="w-full h-full object-contain rounded-2xl sm:rounded-3xl transition-transform duration-500 group-hover:scale-[1.02]"
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
          className="mt-6 sm:mt-8 w-full"
        >
          <span className="block text-2xl sm:text-3xl font-black text-brand-600">{build.price}</span>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {build.shortDesc}
          </p>

          {/* CTA knop — afhankelijk van stockStatus, zelfde patroon als de
              Elite-kaart en de Cube Series-productpagina, zodat beide
              homepage-kaarten dezelfde mogelijkheden bieden: bekijk details
              én direct in de winkelwagen. */}
          <div className="mt-5 sm:mt-6 max-w-xs mx-auto">
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
                      In winkelwagen
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
            {build.stockStatus === 'unavailable' && (
              <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-sm sm:text-base font-bold cursor-not-allowed">
                Niet beschikbaar
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <a
        href={`/cube-series?model=${selectedModel}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-5 sm:mt-6 inline-flex items-center gap-2 text-base sm:text-lg font-bold text-brand-600 hover:text-brand-700 group-hover:gap-3 transition-all duration-200"
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
}: {
  color: 'black' | 'white';
  onColorChange: (c: 'black' | 'white') => void;
  onAddToCart: (b: any) => void;
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
        <CubeSeriesOverviewCard color={color} onAddToCart={onAddToCart} />
        {BUILDS.filter((build) => build.id === 'elite').map((build, idx) => (
          <BuildCard key={build.id} build={build} idx={idx} color={color} onOpenBuild={() => { window.location.href = '/elite-series'; }} onAddToCart={onAddToCart} />
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

// Simpele sterrenrij (los van Trustpilot's eigen groene sterren, om geen
// officiële Trustpilot-branding te suggereren bij deze handmatige reviews) —
// gebruikt door de showcase-kaarten hieronder.
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
      />
    ))}
  </div>
);

// De Trustpilot Review Collector-widget hierboven linkt alleen naar het
// profiel en toont zelf geen losse reviews (dat zit achter Trustpilot's
// betaalde abonnement) — REVIEWS is daarom een handmatig bijgehouden lijst
// (zie src/data/reviews.ts) die als losse showcase-kaarten eronder gerenderd
// wordt, zodat widget en showcase samen één sectie vormen.
const TrustpilotSection = () => (
  <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto">
      <TrustpilotWidget />

      {REVIEWS.length > 0 && (
        <div className="mt-10 sm:mt-14">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 sm:mb-8">
            Wat klanten zeggen
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {REVIEWS.map((review, idx) => (
              <motion.div
                key={`${review.name}-${review.date}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col gap-3"
              >
                <StarRating rating={review.rating ?? 5} />
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed flex-1">{review.text}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900">
                    {review.name}
                    {review.location && <span className="text-slate-400 font-normal"> · {review.location}</span>}
                  </span>
                  <span className="text-xs text-slate-400">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-10 sm:py-14 px-6 bg-slate-950 border-t border-slate-900">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <a href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src="https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/logo%20easy%20pici.jpeg"
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
      {/* flex-wrap: 5 links (waarvan één met whitespace-nowrap) passen niet op
          één regel op smalle mobiele schermen — zonder wrap duwt dat de rij
          breder dan de viewport en veroorzaakt het horizontale scroll van de
          hele pagina, want deze footer staat op elke route. */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6">
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
          href="/garantie-retouren"
          className="text-slate-400 hover:text-white transition-colors text-sm whitespace-nowrap"
        >
          Garantie & Retouren
        </a>
        <a
          href="/contact"
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Contact
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
  onRemove: (cartItemId: string) => void;
  onCheckout: () => void;
}) => {
  const total = cart.reduce((sum, item) => sum + item.priceNum, 0);

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
          <CartPanelContent cart={cart} onClose={onClose} onRemove={onRemove} total={total} onCheckout={onCheckout} />
        </motion.div>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative hidden sm:flex flex-col bg-white h-full w-full max-w-md shadow-2xl z-10"
        >
          <CartPanelContent cart={cart} onClose={onClose} onRemove={onRemove} total={total} onCheckout={onCheckout} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CartPanelContent = ({
  cart, onClose, onRemove, total, onCheckout,
}: {
  cart: any[];
  onClose: () => void;
  onRemove: (cartItemId: string) => void;
  total: number;
  onCheckout: () => void;
}) => {

  return (
  <>
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
      <div>
        <h2 className="text-xl font-black text-slate-900">Winkelwagen</h2>
        {cart.length > 0 && (
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

    {cart.length === 0 ? (
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
          {cart.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <img src={item.image[item.selectedColor] ?? item.image.black} alt={item.name} loading="lazy" className="w-16 h-16 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-tight">{item.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{item.target}</p>
                <p className="text-brand-600 font-black text-sm mt-1">{item.price}</p>
              </div>
              <button
                onClick={() => onRemove(item.cartItemId)}
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

          {/* CTA — na verwijdering van 'Bestellen via mail' is Afrekenen de
              enige route vanuit de winkelwagen. */}
          <button
            onClick={onCheckout}
            className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Afrekenen
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck size={11} /> Veilig</span>
            <span className="flex items-center gap-1"><Zap size={11} /> Snel geregeld</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} /> 2 jaar garantie</span>
          </div>
        </div>
      </>
    )}
  </>
  );
};

// --- SUCCES PAGINA ---
// Google Ads Purchase-conversiemeting. Leest uitsluitend de payment_intent-
// ID uit de URL (die Stripe zelf aan de return_url toevoegt) en haalt de
// écht bevestigde status/bedrag/valuta bij de backend op i.p.v. een waarde
// te vertrouwen die de frontend zelf ooit heeft meegegeven — App() hieronder
// bevestigt via redirect_status al dat de betaling geslaagd is vóór deze
// pagina ooit getoond wordt, maar amount_received > 0 is de daadwerkelijke,
// door Stripe bevestigde waarheid.
const SuccessPage = () => {
  useEffect(() => {
    const paymentIntentId = new URLSearchParams(window.location.search).get('payment_intent');
    if (!paymentIntentId) return;

    // Voorkomt een dubbele conversie voor dezelfde PaymentIntent — zowel bij
    // een handmatige refresh van deze pagina als bij React StrictMode's
    // dubbele effect-invocatie in dev. De sessionStorage-claim gebeurt
    // synchroon, vóór de async fetch, zodat een tweede (Strict Mode-)
    // aanroep de claim al ziet staan vóórdat er ooit een tweede fetch/
    // conversie-event kan plaatsvinden.
    const storageKey = `pici_conversion_sent_${paymentIntentId}`;
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, 'true');

    fetch(`https://api.easypici.nl/api/payment-intent/${paymentIntentId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        const { status, amount_received, currency } = data;
        if (status !== 'succeeded' || !amount_received || amount_received <= 0) return;

        window.gtag?.('event', 'conversion', {
          send_to: 'AW-18345076370/w8G5COb07tUcEJLNzqtE',
          value: amount_received / 100,
          currency: currency.toUpperCase(),
          transaction_id: paymentIntentId,
        });
      })
      .catch(() => {});
  }, []);

  return (
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
        <h1 className="text-2xl font-black">Bedankt voor je bestelling! 🎉</h1>
        <p className="text-green-100 text-sm mt-1">We hebben je bestelling succesvol ontvangen.</p>
      </div>

      {/* Content */}
      <div className="px-8 py-8 space-y-6">
        {/* Extra informatie */}
        <div className="space-y-3">
          {[
            'Je ontvangt binnenkort een bevestigingsmail.',
            'Wij gaan direct aan de slag met jouw Easy PiCi.',
            'Verwachte verzending: binnen 3 werkdagen.',
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-brand-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Info blok */}
        <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-500 leading-relaxed">
          Heb je een vraag over je bestelling? Stuur een mail naar{' '}
          <a href="mailto:info@easypici.nl" className="text-brand-600 font-semibold hover:underline">info@easypici.nl</a>{' '}
          en we helpen je zo snel mogelijk.
        </div>

        {/* Knop */}
        <a
          href="/"
          className="block w-full py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          Terug naar home
        </a>
      </div>
    </motion.div>
  </div>
  );
};

// --- APP ---
export default function App() {
  // Losse content-pagina's op basis van het pathname — lazy, dus met Suspense.
  const { pathname } = window.location;

  // Stripe stuurt de klant na de bank-redirect ALTIJD terug naar de
  // return_url (/success) — ook bij een mislukte of geannuleerde betaling.
  // Het onderscheid zit in redirect_status, die Stripe zelf toevoegt aan de
  // return_url ('succeeded' | 'failed' | 'processing'). Alleen bij
  // 'succeeded' tonen we de bedanktpagina; in alle andere gevallen (mislukt,
  // geannuleerd, of rechtstreeks bezocht zonder een echte transactie) valt
  // de rest van de routing terug op de normale homepage.
  const cameFromStripeRedirect = pathname === '/success' || new URLSearchParams(window.location.search).get('success') === 'true';
  const redirectStatus = new URLSearchParams(window.location.search).get('redirect_status');
  const isSuccess = cameFromStripeRedirect && redirectStatus === 'succeeded';

  // Winkelwagen blijft behouden over paginanavigaties heen (deze site
  // gebruikt volledige paginaladingen i.p.v. een client-side router, dus
  // React-state alleen zou bij elke navigatie resetten). Lazy initializer
  // leest 'm synchroon uit localStorage vóór de eerste render. Na een
  // geslaagde betaling is de winkelwagen afgerond en start 'm leeg — anders
  // zou een klant bij terugkeer naar de homepage dezelfde, al afgerekende
  // producten weer in de winkelwagen zien staan.
  const [cart, setCart] = useState<any[]>(() => {
    if (isSuccess) return [];
    try {
      const stored = localStorage.getItem('pici_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  // Globale kleurkeuze (zwart/wit) voor de builds-sectie.
  const [buildColor, setBuildColor] = useState<'black' | 'white'>('black');
  const lenis = useLenis();

  // Schrijft de winkelwagen bij elke wijziging terug naar localStorage, zodat
  // 'm ook na een volledige paginalading (andere route, refresh) bewaard
  // blijft.
  useEffect(() => {
    localStorage.setItem('pici_cart', JSON.stringify(cart));
  }, [cart]);

  // Vergrendelt de achtergrond-scroll zolang de checkout open staat — anders
  // scrollt de pagina er nog gewoon doorheen met muiswiel, trackpad, touch
  // óf toetsenbord. lenis.stop() pauzeert Lenis' eigen wheel/touch-afhandeling
  // (die anders los van de body blijft doorwerken), en position:fixed met een
  // top-offset blokkeert ook toetsenbord-/scrollbar-scroll — dit is tevens de
  // enige aanpak die op iOS Safari daadwerkelijk werkt (overflow:hidden alleen
  // is daar onvoldoende). De scrollbar-breedte wordt als padding-right
  // gecompenseerd zodat de pagina-inhoud niet horizontaal verspringt zodra de
  // scrollbar verdwijnt. Bij het sluiten wordt de exacte scrollpositie van
  // vóór het openen hersteld, vóórdat Lenis weer wordt gestart — Lenis synct
  // zijn eigen scrollwaarde bij start() met de actuele native scrollpositie,
  // dus de volgorde hier voorkomt dat de pagina alsnog terugspringt.
  useEffect(() => {
    if (!checkoutOpen) return;

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // TIJDELIJKE DEBUGLOGGING — verwijderen zodra bevestigd is dat scrollen
    // in de checkout-modal stabiel werkt. Als dit effect na het openen nóg
    // een keer "mount" logt (i.p.v. alleen bij open/close), betekent dat dat
    // checkoutOpen of lenis van referentie wisselt terwijl de modal al open
    // is — dat zou de body-lock (en mogelijk Lenis' state) kort resetten.
    console.log('[DEBUG-SCROLL] body-lock effect MOUNT', { time: performance.now(), lenisDefined: Boolean(lenis) });

    lenis?.stop();
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // TIJDELIJKE DEBUGLOGGING — zie hierboven.
      console.log('[DEBUG-SCROLL] body-lock effect CLEANUP (unlock)', { time: performance.now() });

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
      lenis?.start();
    };
  }, [checkoutOpen, lenis]);

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

  if (isSuccess) return <><SuccessPage /><CookieConsentBanner /></>;

  if (pathname === '/voorwaarden') return <><Suspense fallback={null}><TermsPage /></Suspense><CookieConsentBanner /></>;
  if (pathname === '/privacy') return <><Suspense fallback={null}><PrivacyPage /></Suspense><CookieConsentBanner /></>;
  if (pathname === '/garantie-retouren') return <><Suspense fallback={null}><GarantiePage /></Suspense><CookieConsentBanner /></>;
  if (pathname === '/contact') return <><Suspense fallback={null}><ContactPage /></Suspense><CookieConsentBanner /></>;

  // Elke winkelwagen-regel krijgt een eigen, unieke cartItemId (los van
  // build.id, dat de PRODUCTsoort aanduidt — "performance", "elite", etc.).
  // Zonder dit unieke id zou het verwijderen van één regel per ongeluk ALLE
  // regels van hetzelfde product verwijderen zodra iemand die build twee
  // keer toevoegt, in plaats van alleen de aangeklikte regel.
  const addToCart = (build: any) => setCart((prev) => [...prev, { ...build, cartItemId: crypto.randomUUID() }]);
  const removeFromCart = (cartItemId: string) => setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

  // Cube Series heeft een eigen productpagina met segmented control
  // (?model=starter|performance|pro), maar deelt cart/checkout met de rest
  // van de site — vandaar dezelfde Navbar/Footer/modals shell.
  if (pathname === '/cube-series') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
        <CubeSeriesPage builds={BUILDS} onAddToCart={addToCart} />
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
        <CookieConsentBanner />
      </div>
    );
  }

  // Elite Series heeft, net als Cube Series, een eigen productpagina i.p.v.
  // een modal — zelfde shell (Navbar/Footer/modals), zodat cart/checkout
  // overal hetzelfde blijven werken.
  if (pathname === '/elite-series') {
    const elite = BUILDS.find((b) => b.id === 'elite')!;
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
        <EliteSeriesPage build={elite} onAddToCart={addToCart} />
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
        <CookieConsentBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
      <HeroSection />
      <FeaturesSection />
      <StorySection />
      <BuildsSection color={buildColor} onColorChange={setBuildColor} onAddToCart={addToCart} />
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
      <CookieConsentBanner />
    </div>
  );
}
