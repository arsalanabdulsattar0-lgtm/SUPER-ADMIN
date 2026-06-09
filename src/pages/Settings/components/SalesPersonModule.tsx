import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, Check, Eye, User, ShieldCheck, Hash } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ComboBox } from '../../../components/ui/ComboBox';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader, SectionHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { seedSalespeople } from '../../../utils/settingsData';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { SalesTargetsModal } from './SalesTargetsModal';

export interface SalesPerson {
  id: string;
  name: string;
  targetAmount: number;
  targetQuantity: number;
  commissionPercent: number;
  commissionAmount: number;
  active: boolean;
  createdDate: string;
  contact: string;
  address1: string;
  address2: string;
  city: string;
  telephone1: string;
  telephone2: string;
  fax: string;
  email: string;
  commission?: number;
  MTarget?: number;
  JanT?: number;
  FebT?: number;
  MarchT?: number;
  AprilT?: number;
  MayT?: number;
  JuneT?: number;
  JulyT?: number;
  AugT?: number;
  SeptT?: number;
  OctT?: number;
  NovT?: number;
  DecT?: number;
  SPUserName?: string;
  MtargetQty?: number;
}

interface SalesPersonModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const emptySP = (): Omit<SalesPerson, 'id'> & { spId: string } => ({
  name: '',
  targetAmount: 0,
  targetQuantity: 0,
  commissionPercent: 0,
  commissionAmount: 0,
  active: true,
  createdDate: new Date().toISOString().split('T')[0],
  contact: '',
  address1: '',
  address2: '',
  city: '',
  telephone1: '',
  telephone2: '',
  fax: '',
  email: '',
  commission: 0,
  MTarget: 0,
  JanT: 0,
  FebT: 0,
  MarchT: 0,
  AprilT: 0,
  MayT: 0,
  JuneT: 0,
  JulyT: 0,
  AugT: 0,
  SeptT: 0,
  OctT: 0,
  NovT: 0,
  DecT: 0,
  SPUserName: '',
  MtargetQty: 0,
  spId: '',
});

export const SalesPersonModule: React.FC<SalesPersonModuleProps> = ({ brand }) => {
  const [people, setPeople] = useState<SalesPerson[]>(seedSalespeople);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SalesPerson | null>(null);
  const [form, setForm] = useState<Omit<SalesPerson, 'id'> & { spId: string }>(emptySP());
  const [viewingTarget, setViewingTarget] = useState<SalesPerson | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  // Build options list for Salesperson ID combo box
  const spIdOptions = people.map(p => ({
    id: p.id,
    name: p.id,
    subtitle: p.name,
  }));

  const filtered = people.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' || (filterStatus === 'active' ? p.active : !p.active);
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptySP());
    setShowForm(true);
  };

  const openEdit = (p: SalesPerson) => {
    setEditing(p);
    setForm({
      name: p.name,
      targetAmount: p.targetAmount,
      targetQuantity: p.targetQuantity,
      commissionPercent: p.commissionPercent,
      commissionAmount: p.commissionAmount,
      active: p.active,
      createdDate: p.createdDate,
      contact: p.contact || '',
      address1: p.address1 || '',
      address2: p.address2 || '',
      city: p.city || '',
      telephone1: p.telephone1 || '',
      telephone2: p.telephone2 || '',
      fax: p.fax || '',
      email: p.email || '',
      commission: p.commission ?? p.commissionPercent ?? 0,
      MTarget: p.MTarget ?? p.targetAmount ?? 0,
      JanT: p.JanT ?? 0,
      FebT: p.FebT ?? 0,
      MarchT: p.MarchT ?? 0,
      AprilT: p.AprilT ?? 0,
      MayT: p.MayT ?? 0,
      JuneT: p.JuneT ?? 0,
      JulyT: p.JulyT ?? 0,
      AugT: p.AugT ?? 0,
      SeptT: p.SeptT ?? 0,
      OctT: p.OctT ?? 0,
      NovT: p.NovT ?? 0,
      DecT: p.DecT ?? 0,
      SPUserName: p.SPUserName ?? '',
      MtargetQty: p.MtargetQty ?? p.targetQuantity ?? 0,
      spId: p.id,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const finalForm = {
      ...form,
      commissionPercent: form.commission ?? form.commissionPercent,
      targetAmount: form.MTarget ?? form.targetAmount,
      targetQuantity: form.MtargetQty ?? form.targetQuantity,
      commissionAmount:
        (form.MTarget ?? form.targetAmount) *
        ((form.commission ?? form.commissionPercent) / 100),
    };
    if (editing) {
      setPeople(prev =>
        prev.map(p => (p.id === editing.id ? { ...editing, ...finalForm } : p))
      );
    } else {
      setPeople(prev => [...prev, { id: `s${Date.now()}`, ...finalForm }]);
    }
    setShowForm(false);
  };

  const handleToggleActive = (id: string) =>
    setPeople(prev => prev.map(p => (p.id === id ? { ...p, active: !p.active } : p)));

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    setPeople(prev => prev.filter(p => p.id !== deleteModal.id));
  };

  const handleReset = () => {
    setFilterStatus('all');
    setTempStatus('all');
    setShowFilter(false);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search By Name..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempStatus(filterStatus);
              setShowFilter(true);
            }}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openAdd}
            style={{ backgroundColor: brand.primary }}
          >
            Add Salesperson
          </Button>
        </div>
      </div>

      {/* Salesperson list table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        {/* Table header bar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Salesperson List</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} members
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="260px">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    { label: 'Name', w: 'min-w-[120px]' },
                    { label: 'Contact', w: 'min-w-[100px]' },
                    { label: 'Address 1', w: 'min-w-[120px]' },
                    { label: 'Telephone 1', w: 'min-w-[100px]' },
                    { label: 'Email', w: 'min-w-[130px]' },
                    { label: 'Status', w: 'min-w-[80px]' },
                    { label: 'Created Date', w: 'min-w-[90px]' },
                    { label: 'Actions', w: 'w-20' },
                  ].map((h) => (
                    <TableHeader
                      key={h.label}
                      label={h.label}
                      width={h.w}
                      padding="px-2"
                      borderLeft={false}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-[12px] text-slate-400"
                    >
                      No salespeople found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                    >
                      <td className="px-2 py-2 text-[12px] font-normal text-slate-600">
                        {p.name}
                      </td>
                      <td className="px-2 py-2 text-[12px] font-normal text-slate-600">
                        {p.contact || '-'}
                      </td>
                      <td className="px-2 py-2 text-[12px] font-normal text-slate-600">
                        {p.address1 || '-'}
                      </td>
                      <td className="px-2 py-2 text-[12px] font-normal text-slate-600">
                        {p.telephone1 || '-'}
                      </td>
                      <td className="px-2 py-2 text-[12px] font-normal text-slate-600">
                        {p.email || '-'}
                      </td>
                      <td className="px-2 py-2">
                        {p.active ? (
                          <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(p.id)} />
                        ) : (
                          <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(p.id)} />
                        )}
                      </td>
                      <td className="px-2 py-2 text-[12px] font-normal text-slate-500 whitespace-nowrap">
                        {p.createdDate}
                      </td>
                      <td className="px-2 py-3 w-20">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Eye}
                            title="View Targets"
                            className="!px-1 text-slate-500 hover:text-slate-800"
                            onClick={() => setViewingTarget(p)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Pencil}
                            title="Edit"
                            className="!px-1"
                            onClick={() => openEdit(p)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Trash2}
                            title="Delete"
                            className="!px-1 !text-red-500"
                            onClick={() => handleDelete(p.id, p.name)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </motion.div>

      {/* Modal: Add / Edit salesperson */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Salesperson' : 'Add Salesperson'}
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSave}
              style={{ backgroundColor: brand.primary }}
            >
              {editing ? 'Update Salesperson' : 'Save Salesperson'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Section 1: Basic contact information */}
          <div className="space-y-1.5">
            <SectionHeader title="Basic Contact Information" icon={User} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-2 gap-4">
                <ComboBox
                  label="Salesperson ID"
                  value={form.spId}
                  onChange={val => setForm({ ...form, spId: val })}
                  options={spIdOptions}
                  placeholder="Search Salesperson ID..."
                  variant="compact"
                  icon={Hash}
                />
                <Input
                  label="Salesperson Name *"
                  variant="compact"
                  placeholder="e.g. Ahmed Raza"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Username"
                  variant="compact"
                  placeholder="e.g. ahmed.raza"
                  value={form.SPUserName}
                  onChange={e => setForm({ ...form, SPUserName: e.target.value })}
                />
                <Input
                  label="Contact"
                  variant="compact"
                  placeholder="e.g. 0300-1234567"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                />
                <Input
                  label="Email"
                  variant="compact"
                  type="email"
                  placeholder="e.g. ahmed.raza@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Address 1"
                  variant="compact"
                  placeholder="e.g. Main Boulevard, Gulberg"
                  value={form.address1}
                  onChange={e => setForm({ ...form, address1: e.target.value })}
                />
                <Input
                  label="Address 2"
                  variant="compact"
                  placeholder="e.g. Phase 5, DHA"
                  value={form.address2}
                  onChange={e => setForm({ ...form, address2: e.target.value })}
                />
                <Input
                  label="City"
                  variant="compact"
                  placeholder="e.g. Lahore"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="Telephone 1"
                  variant="compact"
                  placeholder="e.g. 042-35711111"
                  value={form.telephone1}
                  onChange={e => setForm({ ...form, telephone1: e.target.value })}
                />
                <Input
                  label="Telephone 2"
                  variant="compact"
                  placeholder="e.g. 042-35722222"
                  value={form.telephone2}
                  onChange={e => setForm({ ...form, telephone2: e.target.value })}
                />
                <Input
                  label="Fax"
                  variant="compact"
                  placeholder="e.g. 042-35733333"
                  value={form.fax}
                  onChange={e => setForm({ ...form, fax: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section 2: Targets and commission */}
          <div className="space-y-1.5">
            <SectionHeader title="Targets And Commission" icon={ShieldCheck} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Commission (%)"
                  variant="compact"
                  type="number"
                  placeholder="0"
                  value={form.commission === 0 ? '' : String(form.commission)}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({ ...form, commission: val, commissionPercent: val });
                  }}
                />
                <Input
                  label="Monthly Target Amount (Rs.)"
                  variant="compact"
                  type="number"
                  placeholder="0"
                  value={form.MTarget === 0 ? '' : String(form.MTarget)}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({ ...form, MTarget: val, targetAmount: val });
                  }}
                />
                <Input
                  label="Monthly Target Qty"
                  variant="compact"
                  type="number"
                  placeholder="0"
                  value={form.MtargetQty === 0 ? '' : String(form.MtargetQty)}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    setForm({ ...form, MtargetQty: val, targetQuantity: val });
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Section 3: Monthly targets breakdown */}
          <div className="space-y-1.5">
            <SectionHeader title="Monthly Targets Breakdown (Rs.)" icon={SlidersHorizontal} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Jan Target', key: 'JanT' },
                  { label: 'Feb Target', key: 'FebT' },
                  { label: 'March Target', key: 'MarchT' },
                  { label: 'April Target', key: 'AprilT' },
                  { label: 'May Target', key: 'MayT' },
                  { label: 'June Target', key: 'JuneT' },
                  { label: 'July Target', key: 'JulyT' },
                  { label: 'Aug Target', key: 'AugT' },
                  { label: 'Sept Target', key: 'SeptT' },
                  { label: 'Oct Target', key: 'OctT' },
                  { label: 'Nov Target', key: 'NovT' },
                  { label: 'Dec Target', key: 'DecT' },
                ].map(m => (
                  <Input
                    key={m.key}
                    label={m.label}
                    variant="compact"
                    type="number"
                    placeholder="0"
                    value={
                      (form[m.key as keyof Omit<SalesPerson, 'id'>] as number) === 0
                        ? ''
                        : String(form[m.key as keyof Omit<SalesPerson, 'id'>])
                    }
                    onChange={e =>
                      setForm({ ...form, [m.key]: parseFloat(e.target.value) || 0 })
                    }
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Section 4: System configuration */}
          <div className="space-y-1.5">
            <SectionHeader title="System Configuration" icon={ShieldCheck} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="flex items-center justify-between">
                <div className="w-1/2">
                  <Input
                    label="Created Date"
                    variant="compact"
                    type="date"
                    value={form.createdDate}
                    onChange={e => setForm({ ...form, createdDate: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Toggle
                    checked={form.active}
                    onChange={val => setForm({ ...form, active: val })}
                    label="Active"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Modal>

      {/* Modal: View sales targets */}
      <SalesTargetsModal
        isOpen={!!viewingTarget}
        onClose={() => setViewingTarget(null)}
        salesPerson={viewingTarget}
      />

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => {
          setFilterStatus(tempStatus);
          setShowFilter(false);
        }}
        title="Filter Salespersons"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTempStatus(opt.key)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${tempStatus === opt.key
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'
                  }`}
                style={{ color: tempStatus === opt.key ? brand.primary : undefined }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </FilterDrawer>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Salesperson?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this salesperson will be permanently removed from the list."
      />
    </div>
  );
};
