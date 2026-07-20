import { useState, useRef } from 'react';
import HeroScrollAnimation from './components/HeroScrollAnimation';
import CheckoutModal from './components/CheckoutModal';
import RequestBuildModal from './components/RequestBuildModal';
import CustomBuildModal from './components/CustomBuildModal';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import TrustpilotWidget from './components/TrustpilotWidget';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
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

// --- DATA ---
const BUILDS = [
  {
    id: 'starter',
    name: 'Easy PiCi Starter',
    price: '€ 1.299',
    priceNum: 1299,
    target: '1080p High / 1440p Ready',
    shortDesc: 'Serieus gamen zonder te veel te betalen. Sterk op 1080p, klaar voor gebruik.',
    description: 'De Starter is voor wie gewoon wil gamen zonder gedoe. RTX 5060, snelle Ryzen processor en een NVMe SSD zodat alles direct snel opstart. De pc komt volledig klaar aan: drivers geïnstalleerd, Windows bijgewerkt, alles ingesteld. Aansluiten, aanzetten en gamen.',
    specs: [
      'CPU: Ryzen 7 5700X',
      'GPU: RTX 5060',
      'RAM: 16 GB DDR4',
      'Opslag: 1 TB NVMe SSD',
      'Koeling: 240mm AIO',
      'Voeding: 650W 80+ Bronze',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Volledig geïnstalleerd geleverd — aansluiten en direct gamen.',
    stockStatus: 'in-stock',
    deliveryText: 'Verzending binnen 2 werkdagen',
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20zwart/product%20foto%20zwart%20.png',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/product%20foto%20wit.png',
    },
  },
  {
    id: 'performance',
    name: 'Easy PiCi Performance',
    price: '€ 1.499',
    priceNum: 1499,
    target: '1440p High Gaming',
    badge: 'Meest gekozen',
    shortDesc: 'Beste prijs/prestatie van onze lineup. 1440p gaming, 32 GB geheugen, jarenlang mee.',
    description: 'Dit is de build die ik zelf zou kiezen. RTX 5060 Ti en 32 GB geheugen — daarmee speel je zware games soepel op 1440p en heb je genoeg ruimte voor multitasking en streaming. Stabiel, stil, en gebouwd om jarenlang mee te gaan. Ook deze pc komt volledig klaar aan, geen installatiegedoe.',
    specs: [
      'CPU: Ryzen 7 5700X',
      'GPU: RTX 5060 Ti',
      'RAM: 32 GB DDR4',
      'Opslag: 1 TB NVMe SSD',
      'Koeling: 240mm AIO',
      'Voeding: 650W 80+ Bronze',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Meest gekozen — de beste prijs/prestatie van onze lineup.',
    stockStatus: 'in-stock',
    deliveryText: 'Verzending binnen 2 werkdagen',
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20zwart/product%20foto%20zwart%20.png',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/product%20foto%20wit.png',
    },
  },
  {
    id: 'pro',
    name: 'Easy PiCi Pro',
    price: '€ 1.699',
    priceNum: 1699,
    target: 'Ultra Gaming Performance',
    shortDesc: 'Voor wie echt op ultra wil spelen. RTX 5070, strak afgebouwd en klaar voor hoge refresh rates.',
    description: 'De Pro is voor gamers die écht alles uit hun monitor willen halen. Met een RTX 5070 en 32 GB geheugen speel je zware games op ultra instellingen zonder concessies. De 240mm AIO waterkoeling is bewust gekozen — niet alleen voor de temperaturen, maar ook voor het eindresultaat van de build. Het kost iets meer, maar je ziet en voelt het verschil.',
    specs: [
      'CPU: Ryzen 7 5700X',
      'GPU: RTX 5070',
      'RAM: 32 GB DDR4',
      'Opslag: 1 TB NVMe SSD',
      'Koeling: 240mm AIO',
      'Voeding: 750W 80+ Gold',
    ],
    warranty: '3 jaar hardwaregarantie op de complete pc.',
    note: 'Op aanvraag gebouwd — zelfde kwaliteit en zorgvuldigheid als alle andere builds.',
    stockStatus: 'on-request',
    deliveryText: 'Wachttijd: 7 werkdagen',
    image: {
      black: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20zwart/product%20foto%20zwart%20.png',
      white: 'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/PC%20tier%201-3%20wit/product%20foto%20wit.png',
    },
  },
  {
    id: 'elite',
    name: 'Easy PiCi Elite',
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

const FEATURES = [
  { icon: Zap, title: 'Aansluiten en gamen', text: 'Drivers, updates en instellingen zijn al gedaan. Geen installatiegedoe, gewoon direct gamen.' },
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
          href="#builds"
          className="px-4 py-3 sm:px-8 sm:py-4 bg-brand-600 text-white rounded-full text-sm sm:text-lg font-bold hover:bg-brand-700 transition-colors shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
        >
          Bekijk Builds <ArrowRight size={16} className="sm:w-5 sm:h-5" />
        </a>
        <a
          href="#story"
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
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-white/10 overflow-hidden">
          <img
            src="https://lnzbfjukwcfzojuiqxgm.supabase.co/storage/v1/object/public/logo/IMG_0541.jpg"
            alt="Easy PiCi Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">Easy PiCi</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 font-semibold text-white">
        <div className="flex items-center gap-3 sm:gap-8 text-[11px] sm:text-base uppercase sm:normal-case tracking-wider sm:tracking-normal">
          <a href="#builds" className="hidden sm:block hover:text-brand-400 transition-colors whitespace-nowrap">Onze Pc's</a>
          <a href="#story" className="hover:text-brand-400 transition-colors whitespace-nowrap">Ons Verhaal</a>
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
          href="#builds"
          className="px-4 py-2 sm:px-6 sm:py-2.5 bg-brand-600 text-white text-xs sm:text-base rounded-full hover:bg-brand-700 transition-colors shadow-[0_4px_16px_rgba(37,99,235,0.35)] whitespace-nowrap"
        >
          Shop Nu
        </a>
      </div>
    </div>
  </nav>
);

const FeaturesSection = () => (
  <section className="py-12 sm:py-20 px-6 bg-white relative z-30">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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
  const [touched, setTouched] = useState(false);
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

  const handleTouchStart = () => setTouched(true);
  const handleTouchEnd = () => setTimeout(() => setTouched(false), 350);

  return (
    <motion.div
      key={build.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      onClick={() => onOpenBuild(build)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`group cursor-pointer bg-white rounded-2xl sm:rounded-3xl overflow-hidden border transition-[transform,border-color,box-shadow] duration-300 flex flex-col
        ${touched
          ? 'border-brand-200 shadow-[0_20px_60px_rgba(37,99,235,0.14),0_0_0_1px_rgba(37,99,235,0.1)] -translate-y-1'
          : 'border-slate-100 hover:border-brand-200 hover:shadow-[0_20px_60px_rgba(37,99,235,0.14),0_0_0_1px_rgba(37,99,235,0.1)] hover:-translate-y-1'
        }`}
    >
      <div className={`h-32 sm:h-48 overflow-hidden relative ${isProductPhoto ? 'bg-white' : ''}`}>
        {!isProductPhoto && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 sm:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/0 to-transparent z-10 hidden sm:block" />
          </>
        )}
        <img
          src={build.image[color] ?? build.image.black}
          alt={build.name}
          className={
            isProductPhoto
              ? 'w-full h-full object-contain p-4 sm:p-6'
              : 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          }
        />
        {build.badge && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 text-[10px] sm:text-xs font-bold text-white bg-brand-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            ⭐ {build.badge}
          </span>
        )}
        <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20 text-[10px] sm:text-xs font-bold text-white bg-brand-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
          {build.target}
        </span>
      </div>
      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <h3 className="text-sm sm:text-xl font-black text-slate-900 mb-1 sm:mb-2">{build.name}</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 flex-1 leading-relaxed line-clamp-2">
          {build.shortDesc}
        </p>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-2xl font-black text-brand-600">{build.price}</span>
          </div>

          {/* Levertijd badge */}
          <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
              build.stockStatus === 'in-stock' ? 'bg-green-500' :
              build.stockStatus === 'on-request' ? 'bg-amber-400' : 'bg-slate-300'
            }`} />
            {build.deliveryText}
          </p>

          {/* CTA knop — afhankelijk van stockStatus */}
          {build.stockStatus === 'in-stock' && (
            <motion.button
              onClick={handleAdd}
              animate={added ? { backgroundColor: '#16a34a' } : { backgroundColor: '' }}
              transition={{ duration: 0.2 }}
              className="w-full py-2 sm:py-3 bg-brand-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-base font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-1 sm:gap-2">
                    <CheckCircle2 size={14} className="sm:w-[18px] sm:h-[18px]" />
                    Toegevoegd!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-1 sm:gap-2">
                    <ShoppingBag size={14} className="sm:w-[18px] sm:h-[18px]" />
                    Bestel direct
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {build.stockStatus === 'on-request' && (
            <button
              onClick={(e) => { e.stopPropagation(); onRequestBuild(build); }}
              className="w-full py-2 sm:py-3 bg-amber-500 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-base font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <Mail size={14} className="sm:w-[18px] sm:h-[18px]" />
              Build aanvragen
            </button>
          )}

          {build.stockStatus === 'unavailable' && (
            <button
              disabled
              className="w-full py-2 sm:py-3 bg-slate-100 text-slate-400 rounded-lg sm:rounded-xl text-[10px] sm:text-base font-bold cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
            >
              Niet beschikbaar
            </button>
          )}

          <div className="hidden sm:flex items-center justify-center text-slate-500 text-sm font-medium group-hover:text-slate-900 transition-colors">
            Bekijk details
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BuildsSection = ({
  color,
  onColorChange,
  onOpenBuild,
  onAddToCart,
  onRequestBuild,
}: {
  color: 'black' | 'white';
  onColorChange: (c: 'black' | 'white') => void;
  onOpenBuild: (b: any) => void;
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
        >Klik op een build voor alle specs en details.</motion.p>
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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {BUILDS.map((build, idx) => (
          <BuildCard key={build.id} build={build} idx={idx} color={color} onOpenBuild={onOpenBuild} onAddToCart={onAddToCart} onRequestBuild={onRequestBuild} />
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
          Ik merkte dat je als gamer eigenlijk twee slechte keuzes had: betalen voor een overpriced merk-pc, of zelf bouwen en hopen dat het goed gaat. Dat kon anders.
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
            De meeste pc's die je online koopt zijn óf overpriced voor wat erin zit, óf slordig gebouwd. Je betaalt voor merknamen en marketing. Van binnen: willekeurige onderdelen en kabels door elkaar. Niet wat je verwacht voor dat geld.
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
            <span className="leading-tight">Hoe ik dat anders doe</span>
          </h3>
          <p className="text-xs sm:text-lg text-slate-300 leading-relaxed">
            Ik bouw elke pc alsof hij voor mezelf is. Eerlijke onderdelen, nette kabels, en alles getest voor verzending. Ja, sommige builds hebben RGB en waterkoeling — dat kost iets meer, maar het eindresultaat is mooier en beter afgewerkt. En je hoeft niks zelf te installeren.
          </p>
        </motion.div>
      </div>

      {/* Wat je mag verwachten blok */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10"
      >
        <h3 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6">
          Wat je van elke Easy PiCi mag verwachten:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            'Je pc komt volledig klaar aan. Drivers, updates, instellingen — alles gedaan. Aansluiten, aanzetten en gamen.',
            'Elke build wordt getest op temperatuur, stabiliteit en fps voordat hij de deur uit gaat.',
            'RGB en waterkoeling zijn bewuste keuzes — voor looks én bouwkwaliteit, niet alleen voor de specs.',
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
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src="https://lnzbfjukwcfzojuiqxgm.supabase.co/storage/v1/object/public/logo/IMG_0541.jpg"
            alt="Easy PiCi Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-white font-bold">Easy PiCi</span>
      </div>
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

const BuildModal = ({
  build,
  color,
  onClose,
  onAddToCart,
  onRequestBuild,
}: {
  build: any;
  color: 'black' | 'white';
  onClose: () => void;
  onAddToCart: (b: any) => void;
  onRequestBuild: (b: any) => void;
}) => {
  const [added, setAdded] = useState(false);
  // Zolang deze modal gemount is, mag de achtergrondpagina niet scrollen
  // (iOS Safari negeert overflow:hidden op de body, vandaar de fixed-lock).
  useBodyScrollLock(Boolean(build));

  const handleAdd = () => {
    if (added) return;
    onAddToCart(build);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  if (!build) return null;
  // Zelfde onderscheid als in BuildCard: nieuwe productfoto's met witte/zwarte
  // achtergrond (starter/performance/pro) vs. de oude sfeervolle foto (elite).
  const isProductPhoto = Boolean(build.image.white);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-none sm:rounded-3xl overflow-hidden w-full sm:max-w-[90vw] h-screen sm:h-auto sm:max-h-[90vh] shadow-2xl z-10 flex flex-col sm:flex-row"
        >
          {/* Image — links op desktop, boven op mobiel */}
          <div className={`h-80 sm:h-auto sm:w-[45%] sm:shrink-0 overflow-hidden relative ${isProductPhoto ? 'bg-white' : ''}`}>
            <img
              src={build.image[color] ?? build.image.black}
              alt={build.name}
              className={isProductPhoto ? 'w-full h-full object-contain p-6 sm:p-10' : 'w-full h-full object-cover'}
            />
            {!isProductPhoto && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-transparent" />
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-3 sm:right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <X size={16} />
            </button>
            <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-brand-600 px-2.5 py-1 rounded-full sm:hidden">
              {build.target}
            </span>
          </div>
          {/* Content — rechts op desktop, scroll */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-6 sm:p-7">
              <div className="flex items-start justify-between mb-4 sm:mb-3">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900">{build.name}</h2>
                  <p className="text-slate-500 text-sm hidden sm:block">{build.target}</p>
                </div>
                <span className="text-xl sm:text-3xl font-black text-brand-600 ml-3 shrink-0">{build.price}</span>
              </div>
              <p className="text-slate-600 mb-5 sm:mb-4 leading-relaxed text-base">{build.description}</p>
              <div className="mb-5 sm:mb-4">
                <h3 className="font-bold text-slate-900 mb-3 sm:mb-2 text-sm sm:text-base">Specificaties</h3>
                <ul className="space-y-2 sm:space-y-1.5">
                  {build.specs.map((spec: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                      <CheckCircle2 size={13} className="text-brand-500 shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 sm:p-3 text-sm text-slate-600 space-y-1.5 sm:space-y-1">
                <p>🛡️ {build.warranty}</p>
                <p>📦 {build.note}</p>
              </div>

              {/* Levertijd in modal */}
              <div className="mt-4 sm:mt-3 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                  build.stockStatus === 'in-stock' ? 'bg-green-500' :
                  build.stockStatus === 'on-request' ? 'bg-amber-400' : 'bg-slate-300'
                }`} />
                <span className="text-sm text-slate-500">{build.deliveryText}</span>
              </div>
            </div>

            {/* Sticky knop */}
            <div className="shrink-0 p-5 sm:p-7 sm:pt-4 border-t border-slate-100 space-y-3">
              {build.stockStatus === 'in-stock' && (
                <motion.button
                  onClick={handleAdd}
                  animate={added ? { backgroundColor: '#16a34a' } : { backgroundColor: '' }}
                  transition={{ duration: 0.2 }}
                  className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? (
                      <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-2">
                        <CheckCircle2 size={18} /> Toegevoegd!
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-2">
                        <ShoppingBag size={18} /> Bestel direct
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
              {build.stockStatus === 'on-request' && (
                <button
                  onClick={() => { onClose(); onRequestBuild(build); }}
                  className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={18} /> Build aanvragen
                </button>
              )}
              {build.stockStatus === 'unavailable' && (
                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                  Niet beschikbaar
                </button>
              )}
              {build.stockStatus !== 'unavailable' && (
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {['Volledig geïnstalleerd', 'Getest op performance', 'Geen gedoe met drivers'].map((t) => (
                    <div key={t} className="flex items-start gap-1 text-[10px] sm:text-xs text-slate-500 leading-tight">
                      <CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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
          href="#builds"
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
              <img src={item.image.black} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
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
  const [selectedBuild, setSelectedBuild] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [requestBuild, setRequestBuild] = useState<any>(null);
  const [customBuildOpen, setCustomBuildOpen] = useState(false);
  // Globale kleurkeuze (zwart/wit) voor de builds-sectie, gedeeld tussen
  // BuildsSection (de toggle + alle kaarten) en BuildModal.
  const [buildColor, setBuildColor] = useState<'black' | 'white'>('black');

  // Stripe stuurt de klant terug met ?success=true in de URL
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get('success') === 'true';

  // Toon de succespagina als Stripe terugkeert met success=true
  if (isSuccess) return <SuccessPage />;

  // Losse content-pagina's op basis van het pathname
  const { pathname } = window.location;
  if (pathname === '/voorwaarden') return <TermsPage />;
  if (pathname === '/privacy') return <PrivacyPage />;

  const addToCart = (build: any) => setCart((prev) => [...prev, build]);
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar cartCount={cart.length} onOpenCart={() => setCartOpen(true)} />
      <HeroSection />
      <FeaturesSection />
      <StorySection />
      <BuildsSection color={buildColor} onColorChange={setBuildColor} onOpenBuild={setSelectedBuild} onAddToCart={addToCart} onRequestBuild={setRequestBuild} />
      <CustomRequestSection onOpen={() => setCustomBuildOpen(true)} />
      <TrustpilotSection />
      <Footer />
      <AnimatePresence>
        {selectedBuild && (
          <BuildModal build={selectedBuild} color={buildColor} onClose={() => setSelectedBuild(null)} onAddToCart={addToCart} onRequestBuild={(b) => { setSelectedBuild(null); setRequestBuild(b); }} />
        )}
      </AnimatePresence>
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
        <CheckoutModal cart={cart} onClose={() => setCheckoutOpen(false)} />
      )}
      {requestBuild && (
        <RequestBuildModal buildName={requestBuild.name} onClose={() => setRequestBuild(null)} />
      )}
      {customBuildOpen && (
        <CustomBuildModal onClose={() => setCustomBuildOpen(false)} />
      )}
    </div>
  );
}
