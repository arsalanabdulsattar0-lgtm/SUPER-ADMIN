import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, Check, Receipt } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { seedTaxes, PROVINCES, TAX_TYPES } from '../../../utils/settingsData';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { SectionCard } from '../../../components/ui/SectionCard';
import { generateNextCode, incrementNextCode, getCodeSettingsForBranch } from '../../../utils/codeSettingsHelper';

export interface TaxSetup {
  id: string;
  taxCode: string;
  taxType: string;
  taxRate: number;
  province: string;
  active: boolean;
  glAccount?: string;
}

interface TaxSetupModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const emptyTax = (): Omit<TaxSetup, 'id'> => ({
  taxCode: '', taxType: 'GST', taxRate: 0, province: 'Punjab', active: true, glAccount: '',
});

export const TaxSetupModule: React.FC<TaxSetupModuleProps> = ({ brand }) => {
  const [taxes, setTaxes] = useState<TaxSetup[]>(seedTaxes);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tempType, setTempType] = useState('all');
  const [tempProvince, setTempProvince] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TaxSetup | null>(null);
  const [form, setForm] = useState<Omit<TaxSetup, 'id'>>(emptyTax());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  const filtered = taxes.filter(t => {
    const matchSearch = t.taxCode.toLowerCase().includes(search.toLowerCase()) || 
      t.taxType.toLowerCase().includes(search.toLowerCase()) ||
      (t.glAccount && t.glAccount.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'all' || t.taxType === filterType;
    const matchProvince = filterProvince === 'all' || t.province === filterProvince;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? t.active : !t.active);
    return matchSearch && matchType && matchProvince && matchStatus;
  });

  const activeCo = sessionStorage.getItem('active_company');
  const activeBr = sessionStorage.getItem('active_branch');
  const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
  const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';

  const codeSetting = getCodeSettingsForBranch(currentCoId, currentBrId).tax || { mode: 'manual' };

  const openAdd = () => {
    setEditing(null);
    const generatedCode = generateNextCode('tax', currentCoId, currentBrId);
    setForm({
      ...emptyTax(),
      taxCode: generatedCode
    });
    setShowForm(true);
  };

  const openEdit = (t: TaxSetup) => {
    setEditing(t);
    setForm({
      taxCode: t.taxCode,
      taxType: t.taxType,
      taxRate: t.taxRate,
      province: t.province,
      active: t.active,
      glAccount: t.glAccount || ''
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.taxCode.trim()) return;
    if (editing) {
      setTaxes(prev => prev.map(t => t.id === editing.id ? { ...editing, ...form } : t));
    } else {
      setTaxes(prev => [...prev, { id: `t${Date.now()}`, ...form }]);
      if (codeSetting.mode === 'auto' && form.taxCode) {
        incrementNextCode('tax', currentCoId, currentBrId);
      }
    }
    setShowForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    setTaxes(prev => prev.filter(t => t.id !== deleteModal.id));
  };

  const handleReset = () => {
    setFilterType('all');
    setFilterProvince('all');
    setFilterStatus('all');
    setTempType('all');
    setTempProvince('all');
    setTempStatus('all');
    setShowFilter(false);
  };

  return (
    <div className="h-[calc(100vh-190px)] min-h-[550px] max-h-[850px] flex flex-col overflow-hidden">
      <SectionCard
        title="Tax Setup Settings"
        icon={<Receipt className="w-3.5 h-3.5 text-white" />}
        brand={brand}
        scrollable
        bodyClassName="space-y-4"
      >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search By Code Or Type..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempType(filterType);
              setTempProvince(filterProvince);
              setTempStatus(filterStatus);
              setShowFilter(true);
            }}
          >
            Filter
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={openAdd} style={{ backgroundColor: brand.primary }}>Add Tax</Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl overflow-hidden p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
        <ScrollArea height="290px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                 {['Tax Code', 'Tax Type', 'Tax Rate (%)', 'Province', 'GL Account', 'Status', 'Actions'].map((h) => (
                  <TableHeader
                    key={h}
                    label={h}
                    width={h === 'Actions' ? 'w-20' : ''}
                    padding={h === 'Actions' ? 'px-2' : 'px-4'}
                    borderLeft={false}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-slate-400">No tax records found.</td>
                </tr>
              ) : filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                >
                  <td className="px-4 py-3 text-[12px] font-normal text-slate-600">{t.taxCode}</td>
                  <td className="px-4 py-3 text-[12px] font-normal text-slate-600">{t.taxType}</td>
                  <td className="px-4 py-3 text-[12px] font-normal text-slate-600">{t.taxRate}%</td>
                  <td className="px-4 py-3 text-[12px] font-normal text-slate-600">{t.province}</td>
                  <td className="px-4 py-3 font-mono text-[12px] font-normal text-slate-600">{t.glAccount || '-'}</td>
                  <td className="px-4 py-3">
                    {t.active
                      ? <ActiveChip label="Active" size="md" />
                      : <InactiveChip label="Inactive" size="md" />}
                  </td>
                  <td className="px-2 py-3 w-20">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" icon={Pencil} title="Edit" className="!px-1" onClick={() => openEdit(t)} />
                      <Button variant="ghost" size="xs" icon={Trash2} title="Delete" className="!px-1 !text-red-500" onClick={() => handleDelete(t.id, t.taxCode)} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Tax Setup' : 'Add Tax Setup'}
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="md" icon={Check} onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {editing ? 'Update Tax' : 'Save Tax'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tax Code *"
            variant="compact"
            placeholder="e.g. GST-17"
            value={form.taxCode}
            onChange={e => setForm({ ...form, taxCode: e.target.value })}
            readOnly={codeSetting.mode === 'auto'}
          />
          <Select
            label="Tax Type"
            variant="compact"
            value={form.taxType}
            onChange={e => setForm({ ...form, taxType: e.target.value })}
            options={TAX_TYPES.map(t => ({ value: t, label: t }))}
          />
          <Input
            label="Tax Rate (%)"
            variant="compact"
            type="number"
            placeholder="0"
            value={form.taxRate === 0 ? '' : String(form.taxRate)}
            onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
          />
          <Select
            label="Province"
            variant="compact"
            value={form.province}
            onChange={e => setForm({ ...form, province: e.target.value })}
            options={PROVINCES.map(p => ({ value: p, label: p }))}
          />
          <Input
            label="GL Account"
            variant="compact"
            placeholder="e.g. 215001"
            value={form.glAccount || ''}
            onChange={e => setForm({ ...form, glAccount: e.target.value })}
          />
          <div className="flex items-center gap-3 pt-6">
            <Toggle
              checked={form.active}
              onChange={val => setForm({ ...form, active: val })}
              label="Active"
            />
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => {
          setFilterType(tempType);
          setFilterProvince(tempProvince);
          setFilterStatus(tempStatus);
          setShowFilter(false);
        }}
        title="Filter Taxes"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Tax Type</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {['all', ...TAX_TYPES].map(opt => (
              <button
                key={opt}
                onClick={() => setTempType(opt)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none focus:outline-none ${tempType === opt ? 'bg-white shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'}`}
                style={{ color: tempType === opt ? brand.primary : undefined }}
              >
                {opt === 'all' ? 'All' : opt}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Province</label>
          <Select
            variant="compact"
            value={tempProvince}
            onChange={e => setTempProvince(e.target.value)}
            options={[{ value: 'all', label: 'All Provinces' }, ...PROVINCES.map(p => ({ value: p, label: p }))]}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTempStatus(opt.key)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none focus:outline-none ${tempStatus === opt.key ? 'bg-white shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'}`}
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
        title="Delete Tax Configuration?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this tax configuration will be permanently removed from the settings."
      />
      </SectionCard>
    </div>
  );
};
