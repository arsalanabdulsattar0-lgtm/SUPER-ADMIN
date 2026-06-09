import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import Card from './Card';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  warningText?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  warningText = "This action cannot be undone and all associated records will be permanently removed.",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="bg-white rounded-3xl w-full max-w-[420px] p-6 relative border border-[#E2E8F0] font-sans"
            style={{ boxShadow: 'none' }}
          >
            {/* Header with Icon and Title */}
            <div className="flex items-center gap-3 pr-8">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100 flex-shrink-0 animate-pulse">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
            </div>

            {/* Absolute Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Message Box */}
            <Card className="mt-4 !bg-slate-50/40 text-[12px] text-slate-600 leading-relaxed font-medium !p-4 !rounded-2xl shadow-none" style={{ borderColor: '#E2E8F0' }}>
              Are you sure you want to delete <strong className="text-slate-800">"{itemName}"</strong>? {warningText}
            </Card>

            {/* Action Footer Buttons */}
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-[#E2E8F0] rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border border-[#E2E8F0] rounded-full text-xs font-bold transition-all cursor-pointer shadow-none"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

