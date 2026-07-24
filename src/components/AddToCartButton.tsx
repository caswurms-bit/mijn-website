import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

// Gedeelde hoofdknop voor Cube Series- en Elite Series-productpagina's, zodat
// breedte/hoogte/positie gegarandeerd gelijk blijven i.p.v. twee los van
// elkaar getweakte knoppen die weer uit elkaar kunnen gaan lopen.
export default function AddToCartButton({
  stockStatus,
  added,
  onClick,
}: {
  stockStatus: string;
  added: boolean;
  onClick: () => void;
}) {
  if (stockStatus === 'unavailable') {
    return (
      <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold cursor-not-allowed">
        Niet beschikbaar
      </button>
    );
  }

  if (stockStatus !== 'in-stock') return null;

  return (
    <motion.button
      onClick={onClick}
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
            <ShoppingBag size={18} /> In winkelwagen
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
