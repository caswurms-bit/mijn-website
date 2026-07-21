import { motion } from 'framer-motion';

export const CUBE_MODELS = ['starter', 'performance', 'pro'] as const;
export type CubeModel = (typeof CUBE_MODELS)[number];

export const MODEL_TABS: { key: CubeModel; label: string }[] = [
  { key: 'starter', label: 'Starter' },
  { key: 'performance', label: 'Performance' },
  { key: 'pro', label: 'Pro' },
];

export function isCubeModel(value: string | null): value is CubeModel {
  return (CUBE_MODELS as readonly string[]).includes(value ?? '');
}

export function getSpecValue(specs: string[], prefix: string) {
  const match = specs.find((s) => s.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : '—';
}

// Premium segmented control (geen dropdown, geen drag-slider): de blauwe
// achtergrond is één gedeeld element (layoutId) dat vloeiend meeschuift
// naar de actieve knop. Gebruikt op zowel de Cube Series-productpagina als
// de homepage-kaart, zodat beide exact dezelfde stijl/animatie delen.
//
// De "Meest gekozen"-aanduiding zit in de knop zelf (een gereserveerde
// tweede regel, onzichtbaar voor Starter/Pro) i.p.v. als losse, zwevende
// badge erboven — zo blijven alle knoppen even hoog/breed en voelt de
// aanduiding als onderdeel van de knop, niet als een los label.
export default function CubeModelSelector({
  selectedModel,
  onSelect,
  layoutId = 'cube-model-pill',
}: {
  selectedModel: CubeModel;
  onSelect: (model: CubeModel) => void;
  layoutId?: string;
}) {
  return (
    <div className="flex justify-center">
      <div className="relative inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
        {MODEL_TABS.map((tab) => {
          const isActive = selectedModel === tab.key;
          const isRecommended = tab.key === 'performance';
          return (
            <button
              key={tab.key}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(tab.key); }}
              className="relative flex flex-col items-center px-4 sm:px-7 py-2 sm:py-2.5 rounded-full whitespace-nowrap"
            >
              <span className="absolute inset-0 rounded-full overflow-hidden">
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 bg-brand-600"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.55 }}
                  />
                )}
              </span>
              <span className={`relative z-10 text-xs sm:text-sm font-bold transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {tab.label}
              </span>
              <span
                className={`relative z-10 text-[8px] sm:hidden leading-tight mt-0.5 transition-colors duration-200 ${
                  isRecommended ? (isActive ? 'text-white/80' : 'text-brand-600') : 'invisible'
                }`}
              >
                ★
              </span>
              <span
                className={`relative z-10 hidden sm:block text-[9px] font-semibold tracking-wide leading-tight mt-1 transition-colors duration-200 ${
                  isRecommended ? (isActive ? 'text-white/80' : 'text-brand-600') : 'invisible'
                }`}
              >
                Meest gekozen
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
