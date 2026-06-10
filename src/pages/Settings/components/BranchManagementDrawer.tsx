import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Check, MapPin, Building, Home } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../../components/ui/Button';
import { Input, TextArea, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip } from '../../../components/ui/Chip';
import { SectionHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import type { Company } from './CompanyModule';
import type { Branch } from '../../../utils/settingsData';

interface BranchManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  branches: Branch[];
  onSave: (branch: Omit<Branch, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

const emptyBranch = (companyId: string): Omit<Branch, 'id'> => ({
  companyId,
  name: '',
  address: '',
  is_head_office: false,
});

export const BranchManagementDrawer: React.FC<BranchManagementDrawerProps> = ({
  isOpen,
  onClose,
  company,
  branches,
  onSave,
  onDelete,
}) => {
  const { brand } = useTheme();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<Omit<Branch, 'id'>>(emptyBranch(company?.id || ''));
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [error, setError] = useState('');

  // Reset view when drawer opens/closes or company changes
  useEffect(() => {
    if (isOpen && company) {
      setView('list');
      setEditingBranch(null);
      setForm(emptyBranch(company.id));
      setError('');
    }
  }, [isOpen, company]);

  const handleAddClick = () => {
    setEditingBranch(null);
    setForm(emptyBranch(company?.id || ''));
    setError('');
    setView('form');
  };

  const handleEditClick = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      companyId: branch.companyId,
      name: branch.name,
      address: branch.address,
      is_head_office: branch.is_head_office,
    });
    setError('');
    setView('form');
  };

  const handleSaveClick = () => {
    if (!form.name.trim()) {
      setError('Branch Name is required.');
      return;
    }
    if (!form.address.trim()) {
      setError('Address is required.');
      return;
    }
    if (!form.companyId) {
      setError('Company is required.');
      return;
    }

    onSave({
      ...form,
      id: editingBranch?.id,
    });
    setView('list');
  };

  const handleDeleteClick = (branch: Branch) => {
    setDeleteModal({
      isOpen: true,
      id: branch.id,
      name: branch.name,
    });
  };

  const confirmDelete = () => {
    onDelete(deleteModal.id);
    setDeleteModal({ isOpen: false, id: '', name: '' });
  };

  return (
    <>
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
                    {view === 'list' ? `Branches — ${company.name}` : editingBranch ? 'Edit Branch' : 'Add Branch'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow p-5 overflow-y-auto space-y-5 custom-scrollbar">
                {view === 'list' ? (
                  <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold text-slate-400 tracking-wide">
                        {branches.length} {branches.length === 1 ? 'branch' : 'branches'} registered
                      </p>
                      <Button
                        variant="primary"
                        size="xs"
                        icon={Plus}
                        onClick={handleAddClick}
                        style={{ backgroundColor: brand.primary }}
                      >
                        Add Branch
                      </Button>
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
                              className="p-4 border rounded-xl bg-white flex flex-col gap-2 transition-all group"
                              style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-700">{b.name}</span>
                                    {b.is_head_office && (
                                      <ActiveChip label="Head Office" size="xs" />
                                    )}
                                  </div>
                                  <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span>{b.address}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    icon={Pencil}
                                    className="!px-1.5"
                                    onClick={() => handleEditClick(b)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    icon={Trash2}
                                    className="!px-1.5 !text-red-500"
                                    onClick={() => handleDeleteClick(b)}
                                  />
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  // Form view
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <SectionHeader title="Branch Details" icon={Building} />
                      <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                        <Input
                          label="Company"
                          variant="compact"
                          value={company?.name || 'Acme Corporation'}
                          readOnly
                        />

                        <Input
                          label="Branch Name *"
                          variant="compact"
                          placeholder="e.g. Lahore Head Office"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <TextArea
                          label="Address *"
                          placeholder="Street, floor, building..."
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="!rounded-lg text-[11px] py-1.5 px-3 h-16"
                        />

                        <div className="flex items-center pt-2">
                          <Toggle
                            checked={form.is_head_office}
                            onChange={(val) => setForm({ ...form, is_head_office: val })}
                            label="Is Head Office"
                          />
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {view === 'form' && (
                <div className="p-4 border-t border-[#E2E8F0] flex items-center gap-2 bg-slate-50/50 flex-shrink-0">
                  <Button
                    onClick={() => setView('list')}
                    variant="white"
                    size="md"
                    fullWidth
                    className="text-slate-600 font-bold border-slate-200 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveClick}
                    variant="primary"
                    size="md"
                    fullWidth
                    icon={Check}
                    style={{ backgroundColor: brand.primary }}
                  >
                    {editingBranch ? 'Update Branch' : 'Save Branch'}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
        title="Delete Branch?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this branch will be permanently removed from the company."
      />
    </>
  );
};
