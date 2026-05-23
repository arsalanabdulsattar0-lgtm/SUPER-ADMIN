// Customer Management Screen – mirrors the Create Invoice UI design system
// ------------------------------------------------------------
// This page replaces the previous client list with a full‑featured
// customer CRUD UI. All components (Input, TextArea, ComboBox, Button)
// come from the existing design system located in `src/components/ui/`.
// The layout uses the same card styling, spacing and typography as the
// invoice editor to satisfy the strict design consistency requirement.
// ------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Check, X, Mail, Phone, LayoutGrid, List } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, TextArea, ComboBox } from '../../components/ui/FormControls';
import { useTheme } from '../../context/ThemeContext';

// ---------------------------------------------------------------------------
// Types – reflect the backend model supplied by the user
// ---------------------------------------------------------------------------
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  is_walkin: boolean;
  is_filer: boolean;
  credit_limit: number;
  opening_balance: number;
  opening_date: string; // ISO date
  payment_term_days: number;
  discount_percent: number;
  // address block
  address: string;
  city: string;
  province: string;
  country: string;
  // tax block
  ntn: string;
  stn: string;
  cnic: string;
  wht_type: string;
}

// ---------------------------------------------------------------------------
// Tiny toggle component – styled to match the invoice UI (uses Input under the hood)
// ---------------------------------------------------------------------------
const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}> = ({ checked, onChange, label }) => {
  const { brand } = useTheme();
  const toggleClasses = `relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none`;
  const track = checked
    ? `bg-${brand.primary.replace('#', '')} w-10 h-6`
    : `bg-gray-300 w-10 h-6`;
  const thumb = checked
    ? `translate-x-4`
    : `translate-x-0`;
  return (
    <label className="inline-flex items-center space-x-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <span
        className={toggleClasses}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{ backgroundColor: checked ? brand.primary : undefined }}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ${thumb}`}
        />
      </span>
    </label>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const CustomerManagement: React.FC = () => {
  const { brand } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('customers_view_mode');
      return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('customers_view_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  // -----------------------------------------------------------------------
  // Load / persist data – mirrors the client list implementation (localStorage)
  // -----------------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      if (stored) {
        setCustomers(JSON.parse(stored));
      } else {
        // Seed 30 sample customers
        const sample: Customer[] = Array.from({ length: 30 }, (_, i) => ({
          id: crypto.randomUUID(),
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          phone: `555-010${i.toString().padStart(2, '0')}`,
          mobile: `555-020${i.toString().padStart(2, '0')}`,
          website: `www.customer${i + 1}.com`,
          is_walkin: false,
          is_filer: false,
          credit_limit: 5000,
          opening_balance: 0,
          opening_date: new Date().toISOString().split('T')[0],
          payment_term_days: 30,
          discount_percent: 0,
          address: `Street ${i + 1}`,
          city: 'City',
          province: 'Province',
          country: 'Country',
          ntn: '',
          stn: '',
          cnic: '',
          wht_type: '',
        }));
        setCustomers(sample);
        persist(sample);
      }
    } catch { /* ignore */ }
  }, []);

  const persist = (list: Customer[]) => {
    try {
      localStorage.setItem('customer_list', JSON.stringify(list));
    } catch { /* ignore */ }
  };

  // -----------------------------------------------------------------------
  // Helpers – CRUD
  // -----------------------------------------------------------------------
  const openCreate = () => {
    setEditing({
      id: crypto.randomUUID(),
      name: '',
      email: '',
      phone: '',
      mobile: '',
      website: '',
      is_walkin: false,
      is_filer: false,
      credit_limit: 0,
      opening_balance: 0,
      opening_date: new Date().toISOString().split('T')[0],
      payment_term_days: 0,
      discount_percent: 0,
      address: '',
      city: '',
      province: '',
      country: '',
      ntn: '',
      stn: '',
      cnic: '',
      wht_type: '',
    });
    setShowModal(true);
  };

  const openEdit = (cust: Customer) => {
    setEditing({ ...cust });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditing(null);
    setShowModal(false);
  };

  const handleSave = () => {
    if (!editing) return;
    // Basic validation – name and email required
    if (!editing.name.trim() || !editing.email.trim()) {
      alert('Name and Email are required');
      return;
    }
    const existingIndex = customers.findIndex((c) => c.id === editing.id);
    let newList: Customer[];
    if (existingIndex >= 0) {
      newList = [...customers];
      newList[existingIndex] = editing;
    } else {
      newList = [...customers, editing];
    }
    setCustomers(newList);
    persist(newList);
    closeModal();
  };

  // -----------------------------------------------------------------------
  // UI – Header & Search
  // -----------------------------------------------------------------------
  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 lg:px-8 lg:py-8 font-sans" style={{ backgroundColor: brand.surface }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: brand.dark }}>Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your customer database and relationships.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full sm:w-64 bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" size="md" icon={Plus} onClick={openCreate}>Add Customer</Button>

          {/* View Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border shadow-sm flex-shrink-0" style={{ borderColor: brand.dark + '15' }}>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
              style={viewMode === 'grid' ? { backgroundColor: brand.primary } : undefined}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
              style={viewMode === 'list' ? { backgroundColor: brand.primary } : undefined}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer List / Cards rendering */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.02, boxShadow: `0 4px 12px ${brand.primary}20` }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              onClick={() => openEdit(c)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                <Button variant="ghost" size="xs" icon={X} onClick={(e) => { e.stopPropagation(); const newList = customers.filter((x) => x.id !== c.id); setCustomers(newList); persist(newList); }} />
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{c.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{c.phone}</div>
                {c.ntn && <div className="flex items-center gap-2"><Check className="w-4 h-4" />NTN: {c.ntn}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              onClick={() => openEdit(c)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="font-bold text-slate-600 uppercase">{c.name.slice(0, 2)}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{c.name}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                    {c.ntn && <span>NTN: {c.ntn}</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="xs" icon={X} onClick={(e) => { e.stopPropagation(); const newList = customers.filter((x) => x.id !== c.id); setCustomers(newList); persist(newList); }} />
            </motion.div>
          ))}
        </div>
      )}


      {/* ------------------------------------------------------------------- */}
      {/* Modal – Inline create / edit – uses same card+spacing layout */}
      {/* ------------------------------------------------------------------- */}
      <AnimatePresence>
        {showModal && editing && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b" style={{ borderColor: brand.dark + '10' }}>
                <h2 className="text-xl font-bold" style={{ color: brand.dark }}>{editing.id ? 'Edit Customer' : 'Add Customer'}</h2>
                <Button variant="ghost" size="xs" icon={X} onClick={closeModal} />
              </div>
              {/* Modal Body – cards */}
              <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: '80vh' }}>
                {/* BASIC INFO */}
                <SectionHeader title="BASIC INFO" />
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                    <Input label="Email" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                    <Input label="Phone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                    <Input label="Mobile" value={editing.mobile} onChange={(e) => setEditing({ ...editing, mobile: e.target.value })} />
                    <Input label="Website" value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
                  </div>
                </div>
                {/* BUSINESS SETTINGS */}
                <SectionHeader title="BUSINESS SETTINGS" />
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle checked={editing.is_walkin} onChange={(v) => setEditing({ ...editing, is_walkin: v })} label="Walk‑in customer" />
                    <Toggle checked={editing.is_filer} onChange={(v) => setEditing({ ...editing, is_filer: v })} label="Filer" />
                    <Input label="Credit limit" type="number" value={editing.credit_limit?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, credit_limit: parseFloat(e.target.value) || 0 })} />
                    <Input label="Payment terms (days)" type="number" value={editing.payment_term_days?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, payment_term_days: parseInt(e.target.value) || 0 })} />
                    <Input label="Discount %" type="number" value={editing.discount_percent?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, discount_percent: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                {/* FINANCIAL INFO */}
                <SectionHeader title="FINANCIAL INFO" />
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Opening balance" type="number" value={editing.opening_balance?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, opening_balance: parseFloat(e.target.value) || 0 })} />
                    <Input label="Opening date" type="date" value={editing.opening_date} onChange={(e) => setEditing({ ...editing, opening_date: e.target.value })} />
                  </div>
                </div>
                {/* ADDRESS SECTION */}
                <SectionHeader title="ADDRESS" />
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextArea label="Address" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
                    <Input label="City" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
                    <Input label="Province" value={editing.province} onChange={(e) => setEditing({ ...editing, province: e.target.value })} />
                    <Input label="Country" value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
                  </div>
                </div>
                {/* TAX INFORMATION */}
                <SectionHeader title="TAX INFORMATION" />
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="NTN" value={editing.ntn} onChange={(e) => setEditing({ ...editing, ntn: e.target.value })} />
                    <Input label="STN" value={editing.stn} onChange={(e) => setEditing({ ...editing, stn: e.target.value })} />
                    <Input label="CNIC" value={editing.cnic} onChange={(e) => setEditing({ ...editing, cnic: e.target.value })} />
                    <Input label="WHT Type" value={editing.wht_type} onChange={(e) => setEditing({ ...editing, wht_type: e.target.value })} />
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="flex justify-end px-6 py-4 border-t" style={{ borderColor: brand.dark + '10' }}>
                <Button variant="secondary" size="sm" onClick={closeModal} className="mr-2">Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Section header component mirroring Invoice view
const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { brand } = useTheme();
  return (
    <div className="px-6 py-3" style={{ backgroundColor: brand.soft }}>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
  );
};

export default CustomerManagement;
