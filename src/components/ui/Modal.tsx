import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  stepper?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  size = 'md',
  children,
  footer,
  stepper,
}) => {
  const { brand } = useTheme();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl',
    '4xl': 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          {/* Backdrop click closer */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className={`bg-white rounded-3xl w-full max-h-[88vh] flex flex-col overflow-hidden relative border border-[#E2E8F0] font-sans ${sizeClasses[size]}`}
            style={{ boxShadow: 'none' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: '#E2E8F0', background: `linear-gradient(135deg, ${brand.surface}40, #ffffff)` }}
            >
              <div className="flex items-center gap-2">
                {Icon && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: brand.primary }}>
                    <Icon className="w-4 h-4" />
                  </div>
                )}
                <h2 className="text-base font-bold text-slate-800" style={{ color: brand.dark }}>
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper (optional) */}
            {stepper && (
              <div className="px-6 py-4 border-b bg-slate-50/30 flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
                {stepper}
              </div>
            )}

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-6 scrollbar-thin">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="px-6 py-4 border-t flex justify-end gap-2.5 flex-shrink-0"
                style={{ borderColor: '#E2E8F0', backgroundColor: brand.surface + '20' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
