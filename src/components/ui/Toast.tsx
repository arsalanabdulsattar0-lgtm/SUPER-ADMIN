import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  messages: string[];
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  title = "Required Fields Missing",
  messages,
  duration = 5000
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-6 right-6 z-[99999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto w-80 bg-white border-l-4 border-red-500 rounded-r-xl shadow-2xl p-4 border border-slate-100 flex gap-3"
          >
            <div className="shrink-0 text-red-500 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 tracking-wide uppercase">{title}</h4>
              <ul className="mt-1.5 space-y-1 list-disc pl-4">
                {messages.map((msg, i) => (
                  <li key={i} className="text-[11px] font-normal text-slate-600 leading-relaxed">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors h-5 w-5 flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
