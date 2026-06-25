import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Building, Home } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ScrollArea } from '../../components/ui/FormControls';
import { ActiveChip } from '../../components/ui/Chip';
import Card from '../../components/ui/Card';
import type { Company } from '../../utils/settingsData';
import type { Branch } from '../../utils/settingsData';

interface BranchManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  branches: Branch[];
}

export const BranchManagementDrawer: React.FC<BranchManagementDrawerProps> = ({
  isOpen,
  onClose,
  company,
  branches,
}) => {
  const { brand } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && company && (
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
            className="fixed right-0 top-0 bottom-0 z-[1000] w-full sm:w-[480px] bg-white border-l flex flex-col overflow-hidden"
            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" style={{ color: brand.primary }} />
                <h2 className="text-sm font-black text-slate-800">
                  Branches — {company.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer outline-none focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-grow p-5 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-slate-400 tracking-wide">
                    {branches.length} {branches.length === 1 ? 'branch' : 'branches'} registered
                  </p>
                </div>

                {/* Branch List */}
                <ScrollArea maxHeight="calc(100vh - 180px)">
                  <div className="space-y-3 pr-1">
                    {branches.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl border-slate-200">
                        <Building className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs text-slate-400">No branches registered for this company.</p>
                      </div>
                    ) : (
                      branches.map((b) => (
                        <Card
                          key={b.id}
                          className="p-4 border rounded-xl bg-white flex flex-col gap-2 transition-all"
                          style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-700">{b.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{b.code}</span>
                                {b.is_head_office && (
                                  <ActiveChip label="Head Office" size="xs" />
                                )}
                              </div>
                              <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <span>{b.address}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
