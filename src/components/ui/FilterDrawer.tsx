import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onReset?: () => void;
  onApply?: () => void;
  resetLabel?: string;
  applyLabel?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  title = "Filters",
  children,
  onReset,
  onApply,
  resetLabel = "Reset All",
  applyLabel = "Apply Filters"
}) => {
  const { brand } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[1000] w-80 bg-white border-l flex flex-col overflow-hidden"
            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" style={{ color: brand.primary }} />
                <h2 className="text-sm font-black text-slate-800">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-grow p-5 overflow-y-auto space-y-5 custom-scrollbar">
              {children}
            </div>

            {/* Drawer Footer */}
            {(onReset || onApply) && (
              <div className="p-3 border-t border-[#E2E8F0] flex justify-between items-center gap-2 bg-slate-50/50 flex-shrink-0">
                {onReset ? (
                  <Button
                    onClick={onReset}
                    variant="white"
                    size="sm"
                    className="text-slate-650 font-bold hover:bg-slate-100"
                  >
                    {resetLabel}
                  </Button>
                ) : (
                  <div />
                )}
                {onApply && (
                  <Button
                    onClick={onApply}
                    variant="primary"
                    size="sm"
                    style={{ backgroundColor: brand.primary }}
                  >
                    {applyLabel}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
