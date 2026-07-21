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
    <div className="flex justify-center pt-5 sm:pt-6">
      <div className="relative inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
        {MODEL_TABS.map((tab) => {
          const isActive = selectedModel === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(tab.key); }}
              className="relative px-4 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap"
            >
              {tab.key === 'performance' && (
                <span className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-bold text-brand-600 whitespace-nowrap">
                  ⭐ Meest gekozen
                </span>
              )}
              <span className="absolute inset-0 rounded-full overflow-hidden">
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 bg-brand-600"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </span>
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
