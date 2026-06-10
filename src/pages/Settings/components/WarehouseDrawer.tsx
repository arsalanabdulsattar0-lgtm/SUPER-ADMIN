import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Database, MapPin, Building, Home } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../../components/ui/Button';
import { Input, Select, TextArea, Toggle } from '../../../components/ui/FormControls';
import { SectionHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { seedCompanies, seedBranches } from '../../../utils/settingsData';
import type { Warehouse } from './WarehouseModule';

interface WarehouseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
  onSave: (warehouse: Omit<Warehouse, 'id'> & { id?: string }) => void;
}

const emptyWarehouse = (): Omit<Warehouse, 'id'> => ({
  name: '',
  code: '',
  companyId: seedCompanies[0]?.id || '',
  branchId: seedBranches.filter(b => b.companyId === seedCompanies[0]?.id)[0]?.id || '',
  city: '',
  address: '',
  isDefault: false,
  isActive: true,
});

export const WarehouseDrawer: React.FC<WarehouseDrawerProps> = ({
  isOpen,
  onClose,
  warehouse,
  onSave,
}) => {
  const { brand } = useTheme();

  const [form, setForm] = useState<Omit<Warehouse, 'id'>>(emptyWarehouse());
  const [error, setError] = useState('');

  // Get branches filtered by selected company in form
  const availableBranches = seedBranches.filter(b => b.companyId === form.companyId);

  // Sync form state when drawer opens or warehouse changes
  useEffect(() => {
    if (isOpen) {
      if (warehouse) {
        setForm({
          name: warehouse.name,
          code: warehouse.code,
          companyId: warehouse.companyId,
          branchId: warehouse.branchId,
          city: warehouse.city,
          address: warehouse.address,
          isDefault: warehouse.isDefault,
          isActive: warehouse.isActive,
        });
      } else {
        setForm(emptyWarehouse());
      }
      setError('');
    }
  }, [isOpen, warehouse]);


  const handleSaveClick = () => {
    if (!form.name.trim()) {
      setError('Warehouse Name is required.');
      return;
    }
    if (!form.code.trim()) {
      setError('Warehouse Code is required.');
      return;
    }
    if (!form.companyId) {
      setError('Company selection is required.');
      return;
    }
    if (!form.branchId) {
      setError('Branch selection is required.');
      return;
    }
    if (!form.city.trim()) {
      setError('City is required.');
      return;
    }
    if (!form.address.trim()) {
      setError('Address is required.');
      return;
    }

    onSave({
      ...form,
      id: warehouse?.id,
    });
    onClose();
  };

  return (
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
            className="fixed right-0 top-0 bottom-0 z-[1000] w-full sm:w-[480px] bg-white border-l flex flex-col overflow-hidden"
            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" style={{ color: brand.primary }} />
                <h2 className="text-sm font-black text-slate-800">
                  {warehouse ? 'Edit Warehouse' : 'Add Warehouse'}
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
              {error && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                  {error}
                </div>
              )}

              {/* Warehouse Basic Info */}
              <div className="space-y-1.5">
                <SectionHeader title="Warehouse Details" icon={Database} />
                <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                  <Input
                    label="Warehouse Name *"
                    variant="compact"
                    placeholder="e.g. Lahore Main Warehouse"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    label="Warehouse Code *"
                    variant="compact"
                    placeholder="e.g. LHR-WH-01"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </Card>
              </div>

              {/* Company & Branch Assignment */}
              <div className="space-y-1.5">
                <SectionHeader title="Assignment" icon={Building} />
                <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                  <Input
                    label="Company"
                    variant="compact"
                    value="Acme Corporation"
                    readOnly
                  />
                  <Select
                    label="Branch *"
                    variant="compact"
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    options={availableBranches.map(b => ({ value: b.id, label: b.name }))}
                  />
                </Card>
              </div>

              {/* Location Info */}
              <div className="space-y-1.5">
                <SectionHeader title="Location" icon={MapPin} />
                <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                  <Input
                    label="City *"
                    variant="compact"
                    placeholder="e.g. Lahore"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <TextArea
                    label="Address *"
                    placeholder="Street, industrial zone, city area..."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="!rounded-lg text-[11px] py-1.5 px-3 h-16"
                  />
                </Card>
              </div>

              {/* Preferences */}
              <div className="space-y-1.5">
                <SectionHeader title="Preferences & Status" icon={Home} />
                <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                  <div className="flex flex-col gap-3">
                    <Toggle
                      checked={form.isDefault}
                      onChange={(val) => setForm({ ...form, isDefault: val })}
                      label="Is Default Warehouse"
                    />
                    <Toggle
                      checked={form.isActive}
                      onChange={(val) => setForm({ ...form, isActive: val })}
                      label="Active"
                    />
                  </div>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E2E8F0] flex items-center gap-2 bg-slate-50/50 flex-shrink-0">
              <Button onClick={onClose} variant="white" size="md" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                variant="primary"
                size="md"
                icon={Check}
                className="flex-1"
                style={{ backgroundColor: brand.primary }}
              >
                {warehouse ? 'Update Warehouse' : 'Save Warehouse'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
