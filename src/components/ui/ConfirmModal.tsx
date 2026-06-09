import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Card from './Card';

type Variant = 'danger' | 'warning' | 'default';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}

const variantIcons: Record<Variant, React.ElementType> = {
  danger: AlertTriangle,
  warning: AlertCircle,
  default: Info,
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}) => {
  const { brand } = useTheme();
  const Icon = variantIcons[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          {/* Backdrop closer */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="bg-white rounded-3xl w-full max-w-[420px] p-6 relative border border-[#E2E8F0] font-sans"
            style={{ boxShadow: 'none' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 pr-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
                style={{
                  backgroundColor: brand.primary + '12',
                  borderColor: brand.primary + '25',
                  color: brand.primary,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Message */}
            <Card
              className="mt-4 !bg-slate-50/40 text-[12px] text-slate-600 leading-relaxed font-medium !p-4 !rounded-2xl shadow-none"
              style={{ borderColor: '#E2E8F0' }}
            >
              {message}
            </Card>

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-[#E2E8F0] rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-none"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-6 py-2 text-white border border-[#E2E8F0] rounded-full text-xs font-bold transition-all cursor-pointer hover:brightness-110 shadow-none"
                style={{
                  background: `linear-gradient(to right, ${brand.primary}, ${brand.dark})`,
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

