import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, Check, List } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { SectionHeader, TableHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import type { ProductSetupType, ProductSetupValue } from './ProductSetupModule';

interface ProductSetupValuesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setupType: ProductSetupType | null;
  allSetupTypes: ProductSetupType[];
  values: ProductSetupValue[];
  onSave: (val: Omit<ProductSetupValue, 'id' | 'typeId' | 'typeName' | 'code'> & { id?: string; typeId?: string }) => void;
  onDelete: (id: string) => void;
}


export const ProductSetupValuesDrawer: React.FC<ProductSetupValuesDrawerProps> = ({
  isOpen,
  onClose,
  setupType,
  allSetupTypes,
  values,
  onSave,
  onDelete,
}) => {
  const { brand } = useTheme();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingVal, setEditingVal] = useState<ProductSetupValue | null>(null);
  const [form, setForm] = useState<{
    name: string;
    active: boolean;
    typeId: string;
  }>({
    name: '',
    active: true,
    typeId: '',
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [error, setError] = useState('');

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');

  // Reset view when drawer opens/closes or setupType changes
  useEffect(() => {
    if (isOpen && setupType) {
      setSelectedCategoryFilter(setupType.id);
      setView('list');
      setEditingVal(null);
      setForm({
        name: '',
        active: true,
        typeId: setupType.id,
      });
      setError('');
    }
  }, [isOpen, setupType]);

  const handleAddClick = () => {
    setEditingVal(null);
    setForm({
      name: '',
      active: true,
      typeId: selectedCategoryFilter || setupType?.id || '',
    });
    setError('');
    setView('form');
  };

  const handleEditClick = (val: ProductSetupValue) => {
    setEditingVal(val);
    setForm({
      name: val.name,
      active: val.active,
      typeId: val.typeId,
    });
    setError('');
    setView('form');
  };

  const handleSaveClick = () => {
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.typeId) {
      setError('Setup Type is required.');
      return;
    }

    onSave({
      name: form.name,
      active: form.active,
      typeId: form.typeId,
      id: editingVal?.id,
    });
    setView('list');
  };

  const handleDeleteClick = (val: ProductSetupValue) => {
    setDeleteModal({
      isOpen: true,
      id: val.id,
      name: val.name,
    });
  };

  const confirmDelete = () => {
    onDelete(deleteModal.id);
    setDeleteModal({ isOpen: false, id: '', name: '' });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && setupType && (
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
                  <List className="w-5 h-5" style={{ color: brand.primary }} />
                  <h2 className="text-sm font-black text-slate-800">
                    {view === 'list' ? 'Product Setup Values' : editingVal ? 'Edit Value' : 'Add Value'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow p-5 overflow-y-auto space-y-5 custom-scrollbar">
                {view === 'list' ? (
                  (() => {
                    const filteredValues = values.filter(v => v.typeId === selectedCategoryFilter);
                    return (
                      <div className="space-y-4">
                        {/* Toolbar containing Category Filter and Add Value Button */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="w-48">
                            <Select
                              variant="compact"
                              value={selectedCategoryFilter}
                              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                              options={allSetupTypes.filter(t => t.active).map((t) => ({ value: t.id, label: t.name }))}
                            />
                          </div>
                          <Button
                            variant="primary"
                            size="xs"
                            icon={Plus}
                            onClick={handleAddClick}
                            style={{ backgroundColor: brand.primary }}
                          >
                            Add Value
                          </Button>
                        </div>

                        {/* Configured Count Info Row */}
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 tracking-wide">
                            {filteredValues.length} {filteredValues.length === 1 ? 'value' : 'values'} configured
                          </p>
                        </div>

                        {/* Values Table */}
                        {filteredValues.length === 0 ? (
                          <div className="text-center py-12 border border-dashed rounded-2xl border-slate-200 mt-3">
                            <List className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">No lookup values found for this type.</p>
                          </div>
                        ) : (
                          <ScrollArea maxHeight="220px" className="w-full overflow-x-auto mt-3 pr-1">
                            <table className="w-full border-collapse">
                              <thead className="sticky top-0 z-10 bg-white">
                                <tr className="border-b border-[#E2E8F0]">
                                  {['Code', 'Name', 'Active', 'Actions'].map((h) => (
                                    <TableHeader
                                      key={h}
                                      label={h}
                                      width={h === 'Actions' ? 'w-20' : ''}
                                      padding={h === 'Actions' ? 'px-2' : 'px-3'}
                                      borderLeft={false}
                                    />
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredValues.map((v) => (
                                  <tr
                                    key={v.id}
                                    className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                                  >
                                    <td className="px-3 py-2 text-[12px] font-normal text-slate-655 font-mono">{v.code}</td>
                                    <td className="px-3 py-2 text-[12px] font-normal text-slate-600">{v.name}</td>
                                    <td className="px-3 py-2">
                                      {v.active ? (
                                        <ActiveChip label="Active" size="xs" />
                                      ) : (
                                        <InactiveChip label="Inactive" size="xs" />
                                      )}
                                    </td>
                                    <td className="px-2 py-2 w-20">
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          icon={Pencil}
                                          className="!px-1.5"
                                          onClick={() => handleEditClick(v)}
                                        />
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          icon={Trash2}
                                          className="!px-1.5 !text-red-500"
                                          onClick={() => handleDeleteClick(v)}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </ScrollArea>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  // Form view
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 text-[11px] font-bold text-red-650 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <SectionHeader title="Value Details" icon={List} />
                      <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                        <Select
                          label="Setup Type *"
                          variant="compact"
                          value={form.typeId}
                          onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                          options={allSetupTypes.filter(t => t.active).map((t) => ({ value: t.id, label: t.name }))}
                        />

                        <Input
                          label="Name *"
                          variant="compact"
                          placeholder="e.g. Electronics"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <div className="flex items-center pt-2">
                          <Toggle
                            checked={form.active}
                            onChange={(val) => setForm({ ...form, active: val })}
                            label="Active"
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
                    {editingVal ? 'Update Value' : 'Save Value'}
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
        title="Delete Setup Value?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this setup value will be permanently removed from the configuration."
      />
    </>
  );
};
