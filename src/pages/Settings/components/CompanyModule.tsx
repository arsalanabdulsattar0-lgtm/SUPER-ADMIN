import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2, Check,
  Building2, Phone, MapPin, Globe, ChevronLeft, ChevronRight, Home,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, TextArea, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader, SectionHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { seedCompanies, BUSINESS_TYPES, seedBranches } from '../../../utils/settingsData';
import type { Branch } from '../../../utils/settingsData';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { BranchManagementDrawer } from './BranchManagementDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  ntn: string;
  stn: string;
  cnic: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  pral_token: string;
  city: string;
  zip_code: string;
  business_type: string;
  address3: string;
  is_active: boolean;
}

interface CompanyModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const emptyCompany = (): Omit<Company, 'id'> => ({
  name: '',
  ntn: '',
  stn: '',
  cnic: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  pral_token: '',
  city: '',
  zip_code: '',
  business_type: BUSINESS_TYPES[0],
  address3: '',
  is_active: true,
});

const PAGE_SIZE = 8;

// ─── Main Component ───────────────────────────────────────────────────────────

export const CompanyModule: React.FC<CompanyModuleProps> = ({ brand }) => {
  const [companies, setCompanies] = useState<Company[]>(seedCompanies);
  const [branches, setBranches] = useState<Branch[]>(seedBranches);
  const [activeBranchCompany, setActiveBranchCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');
  const [tempType, setTempType] = useState('all');
  const [sortKey, setSortKey] = useState<keyof Company>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<Omit<Company, 'id'>>(emptyCompany());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  // ── Derived data ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return companies
      .filter(c => {
        const q = search.toLowerCase();
        const matchSearch =
          c.name.toLowerCase().includes(q) ||
          c.ntn.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q);
        const matchStatus =
          filterStatus === 'all' || (filterStatus === 'active' ? c.is_active : !c.is_active);
        const matchType = filterType === 'all' || c.business_type === filterType;
        return matchSearch && matchStatus && matchType;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [companies, search, filterStatus, filterType, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalActive = companies.filter(c => c.is_active).length;
  const totalInactive = companies.filter(c => !c.is_active).length;

  // ── Sort handler ──────────────────────────────────────────────────────────

  const handleSort = (key: keyof Company) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // ── CRUD helpers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditing(null);
    setForm(emptyCompany());
    setShowForm(true);
  };

  const openEdit = (c: Company) => {
    setEditing(c);
    setForm({
      name: c.name,
      ntn: c.ntn,
      stn: c.stn,
      cnic: c.cnic,
      email: c.email,
      phone: c.phone,
      mobile: c.mobile,
      website: c.website,
      pral_token: c.pral_token,
      city: c.city,
      zip_code: c.zip_code,
      business_type: c.business_type,
      address3: c.address3,
      is_active: c.is_active,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setCompanies(prev =>
        prev.map(c => (c.id === editing.id ? { ...editing, ...form } : c))
      );
    } else {
      setCompanies(prev => [...prev, { id: `co${Date.now()}`, ...form }]);
    }
    setShowForm(false);
  };

  const handleToggleActive = (id: string) =>
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, is_active: !c.is_active } : c)));

  const handleDelete = (id: string, name: string) =>
    setDeleteModal({ isOpen: true, id, name });

  const confirmDelete = () => {
    setCompanies(prev => prev.filter(c => c.id !== deleteModal.id));
  };

  const handleReset = () => {
    setFilterStatus('all');
    setFilterType('all');
    setTempStatus('all');
    setTempType('all');
    setShowFilter(false);
  };

  const getBranchCount = (companyId: string) => {
    return branches.filter(b => b.companyId === companyId).length;
  };

  const handleSaveBranch = (formBranch: Omit<Branch, 'id'> & { id?: string }) => {
    if (formBranch.id) {
      setBranches(prev =>
        prev.map(b => {
          if (b.id === formBranch.id) {
            return { ...b, ...formBranch } as Branch;
          }
          if (formBranch.is_head_office && b.companyId === formBranch.companyId && b.id !== formBranch.id) {
            return { ...b, is_head_office: false };
          }
          return b;
        })
      );
    } else {
      const newId = `br-${Date.now()}`;
      setBranches(prev => {
        const updated = formBranch.is_head_office
          ? prev.map(b => (b.companyId === formBranch.companyId ? { ...b, is_head_office: false } : b))
          : prev;
        return [...updated, { ...formBranch, id: newId }];
      });
    }
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches(prev => prev.filter(b => b.id !== branchId));
  };

  // ── Stats cards data ──────────────────────────────────────────────────────

  const stats = [
    {
      label: 'Total Companies',
      value: companies.length,
      sub: 'All registered companies',
      icon: Building2,
      color: brand.primary,
      bg: brand.soft,
    },
    {
      label: 'Active Companies',
      value: totalActive,
      sub: 'Currently active',
      icon: CheckCircle,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Inactive Companies',
      value: totalInactive,
      sub: 'Deactivated records',
      icon: AlertCircle,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-4 border transition-all group cursor-default"
            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-black tracking-wide">{stat.label}</p>
                <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>
                  {stat.value}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: stat.bg }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search By Name, NTN, Email..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempStatus(filterStatus);
              setTempType(filterType);
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
            Add Company
          </Button>
        </div>
      </div>

      {/* Table Card */}
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
            <h3 className="text-[11px] font-black tracking-wide">Company List</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} records
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="233px" className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[860px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    { label: 'Company Name', key: 'name' as keyof Company, w: 'min-w-[150px]' },
                    { label: 'NTN', key: 'ntn' as keyof Company, w: 'min-w-[100px]' },
                    { label: 'Email', key: 'email' as keyof Company, w: 'min-w-[140px]' },
                    { label: 'Phone', key: 'phone' as keyof Company, w: 'min-w-[110px]' },
                    { label: 'City', key: 'city' as keyof Company, w: 'min-w-[90px]' },
                    { label: 'Business Type', key: 'business_type' as keyof Company, w: 'min-w-[110px]' },
                    { label: 'Branch Count', key: undefined, w: 'min-w-[100px]' },
                    { label: 'Status', key: undefined, w: 'min-w-[80px]' },
                    { label: 'Actions', key: undefined, w: 'w-24' },
                  ].map((h) => (
                    <TableHeader
                      key={h.label}
                      label={h.label}
                      sortKey={h.key}
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={h.key ? () => handleSort(h.key!) : undefined}
                      width={h.w}
                      padding={h.label === 'Actions' ? 'px-2' : 'px-4'}
                      borderLeft={false}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-[12px] text-slate-400">
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                    >
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {c.name}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {c.ntn || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {c.email || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {c.phone || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {c.city || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {c.business_type || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                        {getBranchCount(c.id)}
                      </td>
                      <td className="px-4 py-2.5">
                        {c.is_active
                          ? <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(c.id)} />
                          : <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(c.id)} />
                        }
                      </td>
                      <td className="px-2 py-2.5 w-24">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Home}
                            title="Branches"
                            className="!px-1"
                            onClick={() => setActiveBranchCompany(c)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Pencil}
                            title="Edit"
                            className="!px-1"
                            onClick={() => openEdit(c)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Trash2}
                            title="Delete"
                            className="!px-1 !text-red-500"
                            onClick={() => handleDelete(c.id, c.name)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: '#E2E8F0', background: brand.surface + '60' }}
          >
            <p className="text-[11px] font-medium text-slate-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white"
                size="xs"
                icon={ChevronLeft}
                className="w-8 h-8 px-0"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'}
                  size="xs"
                  className="w-8 h-8 px-0 border-none"
                  style={currentPage === p ? { backgroundColor: brand.primary } : undefined}
                >
                  {p}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white"
                size="xs"
                icon={ChevronRight}
                className="w-8 h-8 px-0"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Company' : 'Add Company'}
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
              {editing ? 'Update Company' : 'Save Company'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">

          {/* Section 1: Company Information */}
          <div className="space-y-1.5">
            <SectionHeader title="Company Information" icon={Building2} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Company Name *"
                  variant="compact"
                  placeholder="e.g. Acme Corporation"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <Select
                  label="Business Type"
                  variant="compact"
                  value={form.business_type}
                  onChange={e => setForm({ ...form, business_type: e.target.value })}
                  options={BUSINESS_TYPES.map(t => ({ value: t, label: t }))}
                />
                <Input
                  label="NTN"
                  variant="compact"
                  placeholder="e.g. 1234567-8"
                  value={form.ntn}
                  onChange={e => setForm({ ...form, ntn: e.target.value })}
                />
                <Input
                  label="STN"
                  variant="compact"
                  placeholder="e.g. 03-00-1234-567-89"
                  value={form.stn}
                  onChange={e => setForm({ ...form, stn: e.target.value })}
                />
                <Input
                  label="CNIC"
                  variant="compact"
                  placeholder="e.g. 35202-1234567-1"
                  value={form.cnic}
                  onChange={e => setForm({ ...form, cnic: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-1.5">
            <SectionHeader title="Contact Information" icon={Phone} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  variant="compact"
                  type="email"
                  placeholder="e.g. info@acme.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  variant="compact"
                  placeholder="e.g. 042-35711111"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  label="Mobile"
                  variant="compact"
                  placeholder="e.g. 0300-1234567"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                />
                <Input
                  label="Website"
                  variant="compact"
                  placeholder="e.g. https://www.acme.com"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section 3: Location Information */}
          <div className="space-y-1.5">
            <SectionHeader title="Location Information" icon={MapPin} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  variant="compact"
                  placeholder="e.g. Lahore"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="Zip Code"
                  variant="compact"
                  placeholder="e.g. 54000"
                  value={form.zip_code}
                  onChange={e => setForm({ ...form, zip_code: e.target.value })}
                />
                <div className="col-span-2">
                  <TextArea
                    label="Address"
                    value={form.address3}
                    onChange={e => setForm({ ...form, address3: e.target.value })}
                    placeholder="Street, floor, building..."
                    className="!rounded-lg text-[11px] py-1.5 px-3 h-14"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Section 4: Integration Information */}
          <div className="space-y-1.5">
            <SectionHeader title="Integration Information" icon={Globe} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="PRAL Token"
                  variant="compact"
                  placeholder="e.g. pral_live_abc123..."
                  value={form.pral_token}
                  onChange={e => setForm({ ...form, pral_token: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section 5: Status Information */}
          <div className="space-y-1.5">
            <SectionHeader title="Status Information" icon={Building2} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="flex items-center gap-3">
                <Toggle
                  checked={form.is_active}
                  onChange={val => setForm({ ...form, is_active: val })}
                  label="Active"
                />
              </div>
            </Card>
          </div>

        </div>
      </Modal>

      {/* ── Filter Drawer ──────────────────────────────────────────────────── */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => {
          setFilterStatus(tempStatus);
          setFilterType(tempType);
          setCurrentPage(1);
          setShowFilter(false);
        }}
        title="Filter Companies"
      >
        {/* Status filter */}
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
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${
                  tempStatus === opt.key
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

        {/* Business Type filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Business Type</label>
          <Select
            variant="compact"
            value={tempType}
            onChange={e => setTempType(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              ...BUSINESS_TYPES.map(t => ({ value: t, label: t })),
            ]}
          />
        </div>
      </FilterDrawer>

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Company?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this company will be permanently removed from the list."
      />

      {/* Branch Management Drawer */}
      <BranchManagementDrawer
        isOpen={activeBranchCompany !== null}
        onClose={() => setActiveBranchCompany(null)}
        company={activeBranchCompany}
        branches={branches.filter(b => b.companyId === activeBranchCompany?.id)}
        onSave={handleSaveBranch}
        onDelete={handleDeleteBranch}
      />
    </div>
  );
};
