import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Mail, ShoppingBag } from 'lucide-react';
import CubeModelSelector, { type CubeModel, getSpecValue, isCubeModel } from '../components/CubeModelSelector';

function getModelFromUrl(): CubeModel {
  const params = new URLSearchParams(window.location.search);
  const model = params.get('model');
  return isCubeModel(model) ? model : 'performance';
}

interface CubeSeriesPageProps {
  builds: any[];
  onAddToCart: (build: any) => void;
  onRequestBuild: (build: any) => void;
}

export default function CubeSeriesPage({ builds, onAddToCart, onRequestBuild }: CubeSeriesPageProps) {
  const [selectedModel, setSelectedModel] = useState<CubeModel>(getModelFromUrl);
  const [color, setColor] = useState<'black' | 'white'>('black');
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
  const cpu = getSpecValue(build.specs, 'CPU:');
  const gpu = getSpecValue(build.specs, 'GPU:');
  const ram = getSpecValue(build.specs, 'RAM:');
  const opslag = getSpecValue(build.specs, 'Opslag:');

  const handleAdd = () => {
    if (added) return;
    onAddToCart(build);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-28">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-10 sm:mb-16"
        >
          <ArrowLeft size={16} />
          Terug naar home
        </a>

        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">Cube Series</h1>
          <p className="text-base sm:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
            Eén premium behuizing, drie prestatieniveaus.
          </p>
        </div>

        <div className="mb-14 sm:mb-20">
          <CubeModelSelector selectedModel={selectedModel} onSelect={selectModel} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedModel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center"
          >
            {/* Foto — blijft hetzelfde ongeacht het gekozen niveau, groot en zonder kader */}
            <div>
              <div className="h-80 sm:h-[30rem] relative">
                <img
                  src={build.image[color] ?? build.image.black}
                  alt="Easy PiCi Cube Series"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
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
            </div>

            {/* Info — ademt rond de foto, geen aparte omkaderde blokken meer */}
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                build.id === 'performance' ? 'text-brand-600' : 'text-slate-400'
              }`}>
                {build.tier}
              </span>
              <div className="flex items-start justify-between gap-3 mt-1.5 mb-4 sm:mb-5">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{build.name}</h2>
                <span className="text-2xl sm:text-4xl font-black text-brand-600 shrink-0">{build.price}</span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6 sm:mb-8">{build.description}</p>

              <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">
                <span className="font-semibold text-slate-900">{cpu}</span>
                <span className="text-slate-300 mx-2">·</span>
                <span className="font-semibold text-slate-900">{gpu}</span>
                <span className="text-slate-300 mx-2">·</span>
                <span className="font-semibold text-slate-900">{ram}</span>
                <span className="text-slate-300 mx-2">·</span>
                <span className="font-semibold text-slate-900">{opslag}</span>
              </p>

              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mb-6 sm:mb-8">
                <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                  build.stockStatus === 'in-stock' ? 'bg-green-500' :
                  build.stockStatus === 'on-request' ? 'bg-amber-400' : 'bg-slate-300'
                }`} />
                {build.deliveryText}
              </p>

              {build.stockStatus === 'in-stock' && (
                <motion.button
                  onClick={handleAdd}
                  animate={added ? { backgroundColor: '#16a34a' } : { backgroundColor: '' }}
                  transition={{ duration: 0.2 }}
                  className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 overflow-hidden"
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
                  onClick={() => onRequestBuild(build)}
                  className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={18} /> Build aanvragen
                </button>
              )}
              {build.stockStatus === 'unavailable' && (
                <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold cursor-not-allowed">
                  Niet beschikbaar
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
