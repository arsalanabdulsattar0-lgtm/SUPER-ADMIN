import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2,
  Database, ChevronLeft, ChevronRight,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { seedBranches } from '../../../utils/settingsData';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { WarehouseDrawer } from './WarehouseDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  companyId: string;
  branchId: string;
  city: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
}

interface WarehouseModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

// ─── Defaults & Seed Data ─────────────────────────────────────────────────────

const seedWarehouses: Warehouse[] = [
  {
    id: 'wh1',
    name: 'Lahore Main Warehouse',
    code: 'LHR-WH-01',
    companyId: 'co1',
    branchId: 'br-1',
    city: 'Lahore',
    address: '12-B Industrial Area, Gulberg, Lahore',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'wh2',
    name: 'Karachi Port Storage',
    code: 'KHI-WH-02',
    companyId: 'co1',
    branchId: 'br-2',
    city: 'Karachi',
    address: 'Plot 45, Sector 15, Korangi Industrial Area, Karachi',
    isDefault: false,
    isActive: true,
  },
  {
    id: 'wh3',
    name: 'Clifton Depot',
    code: 'KHI-WH-03',
    companyId: 'co2',
    branchId: 'br-3',
    city: 'Karachi',
    address: 'Sea Breeze Heights, Clifton, Karachi',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'wh4',
    name: 'Faisalabad Textile Hub',
    code: 'FSD-WH-01',
    companyId: 'co4',
    branchId: 'br-4',
    city: 'Faisalabad',
    address: 'Sargodha Road, Faisalabad',
    isDefault: true,
    isActive: false,
  },
];

const PAGE_SIZE = 8;

// ─── Main Component ───────────────────────────────────────────────────────────

export const WarehouseModule: React.FC<WarehouseModuleProps> = ({ brand }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(seedWarehouses);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');
  const [tempCompany, setTempCompany] = useState('all');
  const [sortKey, setSortKey] = useState<keyof Warehouse>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  // ── Helper lookups ────────────────────────────────────────────────────────

  const getBranchName = (branchId: string) => {
    const branch = seedBranches.find(b => b.id === branchId);
    return branch ? branch.name : '-';
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return warehouses
      .filter(w => w.companyId === 'co1')
      .filter(w => {
        const q = search.toLowerCase();
        const branchName = getBranchName(w.branchId).toLowerCase();
        const matchSearch =
          w.name.toLowerCase().includes(q) ||
          w.code.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          branchName.includes(q);
        const matchStatus =
          filterStatus === 'all' || (filterStatus === 'active' ? w.isActive : !w.isActive);
        const matchCompany = filterCompany === 'all' || w.companyId === filterCompany;
        return matchSearch && matchStatus && matchCompany;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [warehouses, search, filterStatus, filterCompany, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalActive = warehouses.filter(w => w.companyId === 'co1' && w.isActive).length;
  const totalInactive = warehouses.filter(w => w.companyId === 'co1' && !w.isActive).length;

  // ── Sort handler ──────────────────────────────────────────────────────────

  const handleSort = (key: keyof Warehouse) => {
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
    setEditingWarehouse(null);
    setShowForm(true);
  };

  const openEdit = (w: Warehouse) => {
    setEditingWarehouse(w);
    setShowForm(true);
  };

  const handleSave = (formWarehouse: Omit<Warehouse, 'id'> & { id?: string }) => {
    if (formWarehouse.id) {
      setWarehouses(prev =>
        prev.map(w => {
          if (w.id === formWarehouse.id) {
            return { ...w, ...formWarehouse } as Warehouse;
          }
          // If the edited warehouse is marked default, unset default on other warehouses in same company
          if (formWarehouse.isDefault && w.companyId === formWarehouse.companyId && w.id !== formWarehouse.id) {
            return { ...w, isDefault: false };
          }
          return w;
        })
      );
    } else {
      const newId = `wh-${Date.now()}`;
      setWarehouses(prev => {
        const updated = formWarehouse.isDefault
          ? prev.map(w => (w.companyId === formWarehouse.companyId ? { ...w, isDefault: false } : w))
          : prev;
        return [...updated, { ...formWarehouse, id: newId }];
      });
    }
  };

  const handleToggleActive = (id: string) =>
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, isActive: !w.isActive } : w)));

  const handleDelete = (id: string, name: string) =>
    setDeleteModal({ isOpen: true, id, name });

  const confirmDelete = () => {
    setWarehouses(prev => prev.filter(w => w.id !== deleteModal.id));
  };

  const handleReset = () => {
    setFilterStatus('all');
    setFilterCompany('all');
    setTempStatus('all');
    setTempCompany('all');
    setShowFilter(false);
  };

  // ── Stats cards data ──────────────────────────────────────────────────────

  const stats = [
    {
      label: 'Total Warehouses',
      value: warehouses.filter(w => w.companyId === 'co1').length,
      sub: 'All storage locations',
      icon: Database,
      color: brand.primary,
      bg: brand.soft,
    },
    {
      label: 'Active Warehouses',
      value: totalActive,
      sub: 'Currently active',
      icon: CheckCircle,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Inactive Warehouses',
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
            placeholder="Search by name, code, branch, city..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempStatus(filterStatus);
              setTempCompany(filterCompany);
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
            Add Warehouse
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
            <h3 className="text-[11px] font-black tracking-wide">Warehouse List</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} records
            </span>
          </div>
        </div>

        {/* Scrollable table with sticky headers */}
        <ScrollArea maxHeight="233px" className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                {[
                  { label: 'Warehouse Name', key: 'name' as keyof Warehouse, w: 'min-w-[180px]' },
                  { label: 'Code', key: 'code' as keyof Warehouse, w: 'min-w-[120px]' },
                  { label: 'Branch', key: undefined, w: 'min-w-[160px]' },
                  { label: 'City', key: 'city' as keyof Warehouse, w: 'min-w-[110px]' },
                  { label: 'Status', key: undefined, w: 'min-w-[90px]' },
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
                  <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-slate-400">
                    No warehouses found.
                  </td>
                </tr>
              ) : (
                paginated.map((w, i) => (
                  <motion.tr
                    key={w.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>{w.name}</span>
                        {w.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600 font-mono">
                      {w.code}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                      {getBranchName(w.branchId)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">
                      {w.city}
                    </td>
                    <td className="px-4 py-2.5">
                      {w.isActive ? (
                        <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(w.id)} />
                      ) : (
                        <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(w.id)} />
                      )}
                    </td>
                    <td className="px-2 py-2.5 w-24">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Pencil}
                          title="Edit"
                          className="!px-1 text-slate-500 hover:text-slate-800"
                          onClick={() => openEdit(w)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          title="Delete"
                          className="!px-1 !text-red-500"
                          onClick={() => handleDelete(w.id, w.name)}
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

      {/* ── Add / Edit Side Drawer ─────────────────────────────────────────── */}
      <WarehouseDrawer
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        warehouse={editingWarehouse}
        onSave={handleSave}
      />

      {/* ── Filter Drawer ──────────────────────────────────────────────────── */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => {
          setFilterStatus(tempStatus);
          setFilterCompany(tempCompany);
          setCurrentPage(1);
          setShowFilter(false);
        }}
        title="Filter Warehouses"
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

      </FilterDrawer>

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Warehouse?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this warehouse will be permanently removed from the list."
      />
    </div>
  );
};
