import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import CubeModelSelector, { type CubeModel, isCubeModel } from '../components/CubeModelSelector';
import AddToCartButton from '../components/AddToCartButton';
import {
  PRODUCT_SPECS,
  OS_TEXT,
  WARRANTY_TEXT,
  GPU_TECH_NOTE,
  TRANSPARENCY_NOTE,
  VERTICAL_MOUNT_SURCHARGE,
  VERTICAL_MOUNT_NOTE,
  formatGpu,
  formatRam,
  formatPsu,
  getKeySpecLines,
} from '../data/productSpecs';

function getModelFromUrl(): CubeModel {
  const params = new URLSearchParams(window.location.search);
  const model = params.get('model');
  return isCubeModel(model) ? model : 'performance';
}

const TRUST_ITEMS = [
  'Direct klaar voor gebruik',
  'Windows & drivers geïnstalleerd',
  'Professioneel gebouwd en getest',
  WARRANTY_TEXT,
];

interface CubeSeriesPageProps {
  builds: any[];
  onAddToCart: (build: any) => void;
}

export default function CubeSeriesPage({ builds, onAddToCart }: CubeSeriesPageProps) {
  const [selectedModel, setSelectedModel] = useState<CubeModel>(getModelFromUrl);
  const [color, setColor] = useState<'black' | 'white'>('black');
  const [mount, setMount] = useState<'horizontal' | 'vertical'>('horizontal');
  const [added, setAdded] = useState(false);

  // Sync met de browser back/forward-knoppen — geen page reload, alleen state bijwerken.
  useEffect(() => {
    const handlePopState = () => setSelectedModel(getModelFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectModel = (model: CubeModel) => {
    if (model === selectedModel) return;
    setSelectedModel(model);
    setAdded(false);
    const url = new URL(window.location.href);
    url.searchParams.set('model', model);
    window.history.pushState({}, '', url);
  };

  const build = builds.find((b) => b.id === selectedModel) ?? builds[0];
  const spec = PRODUCT_SPECS[build.id];
  const keySpecLines = getKeySpecLines(spec);
  const specRows = [
    ['Processor', spec.cpu],
    ['Videokaart', formatGpu(spec)],
    ['Werkgeheugen', formatRam(spec)],
    ['Opslag', spec.storage],
    ['Koeling', spec.cooling],
    ['Voeding', formatPsu(spec)],
    ['Besturingssysteem', OS_TEXT],
  ];

  const mountSurcharge = mount === 'vertical' ? VERTICAL_MOUNT_SURCHARGE : 0;
  const totalPriceNum = build.priceNum + mountSurcharge;

  const handleAdd = () => {
    if (added) return;
    // De geselecteerde kleur meegeven aan het winkelwagen-item — anders
    // toont de winkelwagen altijd de zwarte foto, ongeacht welke uitvoering
    // daadwerkelijk gekozen was. mountType/mountSurcharge en de aangepaste
    // prijs gaan mee zodat winkelwagen, checkout, Stripe-metadata en e-mails
    // allemaal dezelfde, al berekende waarde gebruiken.
    onAddToCart({
      ...build,
      selectedColor: color,
      mountType: mount,
      mountSurcharge,
      priceNum: totalPriceNum,
      price: `€ ${totalPriceNum.toLocaleString('nl-NL')}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-10 sm:mb-14"
        >
          <ArrowLeft size={16} />
          Terug naar home
        </a>

        {/* Cube Series + modelkeuze + kleur — boven de 2-koloms sectie,
            zodat de configuratie eerst gemaakt wordt voordat je 'm ziet. */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">Cube Series</h1>
          <p className="text-base sm:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
            Eén premium behuizing, drie prestatieniveaus.
          </p>
        </div>

        <CubeModelSelector selectedModel={selectedModel} onSelect={selectModel} />

        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5 mb-12 sm:mb-16">
          <button
            onClick={() => setColor('black')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              color === 'black' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Zwart
          </button>
          <button
            onClick={() => setColor('white')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors border ${
              color === 'white' ? 'bg-white text-slate-900 border-slate-900' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
            }`}
          >
            Wit
          </button>
        </div>

        {/* Echte desktop-layout: foto links, informatie rechts, binnen de
            volledige breedte i.p.v. één smalle gecentreerde kolom. Op
            mobiel blijft dit gewoon onder elkaar staan. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedModel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start"
          >
            {/* Links — grote foto, blijft hetzelfde ongeacht het gekozen niveau.
                Sticky op desktop zodat 'm in beeld blijft terwijl je door de
                info rechts scrollt. */}
            <div className="md:sticky md:top-28">
              <div className="h-[22rem] md:h-[30rem] lg:h-[34rem] relative">
                <img
                  src={build.image[color] ?? build.image.black}
                  alt="Easy PiCi Cube Series"
                  className="w-full h-full object-contain rounded-2xl sm:rounded-3xl"
                />
              </div>
            </div>

            {/* Rechts — naam, prijs, USP, omschrijving, specs, vertrouwen, CTA */}
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                build.id === 'performance' ? 'text-brand-600' : 'text-slate-400'
              }`}>
                {build.tier}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-2">{build.name}</h2>
              <span className="block text-3xl sm:text-4xl font-black text-brand-600 mb-5 sm:mb-6">€ {totalPriceNum.toLocaleString('nl-NL')}</span>

              {/* Belangrijkste USP, prominent direct onder de prijs */}
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={20} className="text-brand-600 shrink-0" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Direct klaar voor gebruik</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-2">
                  Windows, drivers en updates zijn al geïnstalleerd. Geen installatie, geen instellingen, geen uitzoekwerk.
                </p>
                <p className="text-sm sm:text-base font-bold text-brand-600">
                  Uitpakken. Aansluiten. Gamen.
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed mb-8 sm:mb-10">{build.description}</p>

              {/* Belangrijkste specificaties — scanbaar overzicht van de
                  belangrijkste eigenschappen, vóór de uitgebreide lijst. */}
              <div className="mb-8 sm:mb-10 bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 sm:mb-5">Belangrijkste specificaties</h3>
                <div className="space-y-2.5">
                  {keySpecLines.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 text-sm sm:text-base">
                      <span className="text-slate-500 shrink-0">{label}</span>
                      <span className="font-semibold text-slate-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mt-4 pt-4 border-t border-slate-200">
                  {GPU_TECH_NOTE}
                </p>
              </div>

              {/* Videokaartmontage — standaard horizontaal, optioneel verticaal
                  tegen meerprijs. Beïnvloedt de prijs die met de winkelwagen
                  meegaat. */}
              <div className="mb-8 sm:mb-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4">Montage videokaart</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setMount('horizontal')}
                    className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-colors text-left ${
                      mount === 'horizontal' ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Standaard horizontaal
                    <span className="block font-normal text-[11px] mt-0.5 opacity-80">Inbegrepen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMount('vertical')}
                    className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-colors text-left ${
                      mount === 'vertical' ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Verticale montage
                    <span className="block font-normal text-[11px] mt-0.5 opacity-80">+ €{VERTICAL_MOUNT_SURCHARGE}</span>
                  </button>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mt-3">{VERTICAL_MOUNT_NOTE}</p>
              </div>

              {/* Specificaties — rustige lijst, geen losse omkaderde blokken */}
              <div className="mb-8 sm:mb-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 sm:mb-5">Alle specificaties</h3>
                <div className="space-y-3">
                  {specRows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm sm:text-base">
                      <span className="text-slate-500 shrink-0">{label}</span>
                      <span className="font-semibold text-slate-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* USP's — compacte vertrouwenselementen, geen fanfare */}
              <div className="mb-8 sm:mb-10 space-y-2.5">
                {[...TRUST_ITEMS, build.deliveryText].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-brand-600 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-600">{item}</span>
                  </div>
                ))}
              </div>

              {/* In winkelwagen, tenzij het product niet leverbaar is */}
              <AddToCartButton stockStatus={build.stockStatus} added={added} onClick={handleAdd} />

              {/* Transparantie over productfoto's en onderdelen — subtiel, geen aandacht trekken */}
              <div className="mt-6 sm:mt-8 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Goed om te weten</p>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  Afbeeldingen dienen ter illustratie. Om de beste prijs en snelle levering te garanderen, kunnen merken en uiterlijke details van sommige onderdelen afwijken. De vermelde specificaties en prestaties blijven altijd gelijk of beter.
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  {TRANSPARENCY_NOTE}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
