import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit2, LayoutGrid, List,
  SlidersHorizontal, ArrowUpDown, X, Eye,
  CheckCircle, Clock, ChevronLeft, ChevronRight,
  User, ShieldCheck, MapPin, Globe, CreditCard, Printer, Save
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, TextArea, ScrollArea, ComboBox, Select, Toggle } from '../../components/ui/FormControls';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import { Chip, FilerChip, NonFilerChip, ActiveChip, InactiveChip } from '../../components/ui/Chip';
import { getCodeSettingsForBranch, generateNextCode, incrementNextCode } from '../../utils/codeSettingsHelper';
import { SALES_PERSONS } from '../../utils/customerData';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { Toast } from '../../components/ui/Toast';
import { PageHeader, SectionHeader, TableHeader, CardTitle, ModalHeader } from '../../components/ui/Typography';

export interface Customer {
  id: string;
  customer_id?: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  is_walkin: boolean;
  is_filer: boolean;
  credit_limit: number;
  opening_balance: number;
  opening_date: string;
  payment_term_days: number;
  discount_percent: number;
  address: string;
  city: string;
  province: string;
  country: string;
  ntn: string;
  stn: string;
  cnic: string;
  wht_type: string;
  is_active: boolean;
  sales_person_id?: string;
  bp_type?: 'customer' | 'supplier';
}

const CustomerComponent: React.FC = () => {
  const { brand } = useTheme();

  const customerSettings = useMemo(() => {
    try {
      const stored = localStorage.getItem('document_view_settings');
      const allSettings = stored ? JSON.parse(stored) : {};
      const settingsForType = allSettings['Customer'] || {};
      
      const defaultFields = {
        'Email Address': true,
        'Phone Number': true,
        'Mobile Number': true,
        'Website Link': true,
        'Billing Address': true,
        'Walk-in Customer': true,
        'Tax Filer': true,
        'Credit Limit': true,
        'Payment Terms': true,
        'Default Discount': true,
        'NTN Code': true,
        'STRN Registry': true,
        'CNIC Number': true,
        'WHT Category': true,
        'Total Balance': true,
        'Salesperson': true
      };
      
      const defaultColumns = {
        'Business Partner Details': true,
        'Phone Number': true,
        'City': true,
        'Credit Limit (Rs.)': true,
        'Total Balance (Rs.)': true,
        'Tax Status': true,
        'Status': true
      };
      
      const mergedColumns = { ...defaultColumns, ...settingsForType.columns };
      if (settingsForType.columns && settingsForType.columns['Customer Details'] !== undefined) {
        mergedColumns['Business Partner Details'] = settingsForType.columns['Customer Details'];
      }
      
      return {
        fields: { ...defaultFields, ...settingsForType.fields },
        columns: mergedColumns
      };
    } catch (e) {
      console.error(`Failed to parse document view settings for Customer`, e);
      return {
        fields: {
          'Email Address': true, 'Phone Number': true, 'Mobile Number': true, 'Website Link': true,
          'Billing Address': true, 'Walk-in Customer': true, 'Tax Filer': true, 'Credit Limit': true,
          'Payment Terms': true, 'Default Discount': true, 'NTN Code': true, 'STRN Registry': true,
          'CNIC Number': true, 'WHT Category': true, 'Total Balance': true, 'Salesperson': true
        },
        columns: {
          'Business Partner Details': true, 'Phone Number': true, 'City': true,
          'Credit Limit (Rs.)': true, 'Total Balance (Rs.)': true, 'Tax Status': true, 'Status': true
        }
      };
    }
  }, []);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesPersonsList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('sales_persons');
      return stored ? JSON.parse(stored) : SALES_PERSONS;
    } catch {
      return SALES_PERSONS;
    }
  });
  const [search, setSearch] = useState('');

  // Interactive Filters & Sorting States
  const [selectedFilerStatus, setSelectedFilerStatus] = useState<string>('all');
  const [selectedWalkinStatus, setSelectedWalkinStatus] = useState<string>('all');
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all');
  const [tempFilerStatus, setTempFilerStatus] = useState<string>('all');
  const [tempWalkinStatus, setTempWalkinStatus] = useState<string>('all');
  const [tempActiveStatus, setTempActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [tempSalesPerson, setTempSalesPerson] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'name' | 'email' | 'credit_limit' | 'opening_balance' | 'status'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Panel Open States
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Modal Form States
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'settings' | 'accounting'>('general');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const codeSetting = useMemo(() => {
    try {
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      return getCodeSettingsForBranch(currentCoId, currentBrId).customer;
    } catch {
      return { mode: 'manual', prefix: 'CUS-', digits: 4, nextNumber: 1 };
    }
  }, [showModal]);

  // Details Drawer States
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Selection & Confirmation States
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [bulkConfirmModal, setBulkConfirmModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [toastMessageData, setToastMessageData] = useState<{ isOpen: boolean; messages: string[] }>({ isOpen: false, messages: [] });

  // View state (List vs Grid)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('customers_view_mode') as 'grid' | 'list') || 'list';
    } catch {
      return 'list';
    }
  });

  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Close sorting dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('customers_view_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  const persist = (list: Customer[]) => {
    try {
      localStorage.setItem('customer_list', JSON.stringify(list));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      const seededFlag = localStorage.getItem('customers_seeded_v8');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.length > 0 && seededFlag === 'true') {
        setCustomers(parsed);
      } else {
        setCustomers(parsed || []);
      }
    } catch { /* ignore */ }
  }, []);

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    const newList = customers.filter(c => c.id !== deleteModal.id);
    setCustomers(newList);
    persist(newList);
    setSelectedCustomerIds(prev => prev.filter(x => x !== deleteModal.id));
  };

  const handleToggleActive = (id: string) => {
    const newList = customers.map(c =>
      c.id === id ? { ...c, is_active: !c.is_active } : c
    );
    setCustomers(newList);
    persist(newList);
  };

  const openCreate = () => {
    setActiveTab('general');
    setFormErrors({});
    const activeCo = sessionStorage.getItem('active_company');
    const activeBr = sessionStorage.getItem('active_branch');
    const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
    const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
    
    const settings = getCodeSettingsForBranch(currentCoId, currentBrId).customer;
    let nextId = '';
    if (settings.mode === 'auto') {
      nextId = generateNextCode('customer', currentCoId, currentBrId);
    }

    setEditing({
      id: crypto.randomUUID(),
      customer_id: nextId,
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
      payment_term_days: 30,
      discount_percent: 0,
      address: '',
      city: '',
      province: '',
      country: 'Pakistan',
      ntn: '',
      stn: '',
      cnic: '',
      wht_type: '',
      is_active: true,
      sales_person_id: '',
      bp_type: 'customer',
    });
    setShowModal(true);
  };

  const openEdit = (cust: Customer) => {
    setActiveTab('general');
    setFormErrors({});
    setEditing({ ...cust, bp_type: 'customer' });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditing(null);
    setFormErrors({});
    setShowModal(false);
  };

  const validateForm = (): boolean => {
    if (!editing) return false;
    const errors: Record<string, string> = {};
    if (!editing.name.trim()) errors.name = 'Customer Name is required';
    
    if (customerSettings.fields['Email Address'] && editing.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editing.email.trim())) {
        errors.email = 'Invalid email address format';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!editing) return;
    if (!validateForm()) {
      setActiveTab('general');
      return;
    }
    const existingIndex = customers.findIndex(c => c.id === editing.id);
    let newList: Customer[];
    if (existingIndex >= 0) {
      newList = [...customers];
      newList[existingIndex] = editing;
    } else {
      newList = [...customers, editing];
      
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      const settings = getCodeSettingsForBranch(currentCoId, currentBrId).customer;
      if (settings.mode === 'auto' && editing.customer_id) {
        incrementNextCode('customer', currentCoId, currentBrId);
      }
    }
    setCustomers(newList);
    persist(newList);
    closeModal();
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCustomerIds(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setBulkConfirmModal(true);
  };

  const doBulkDelete = () => {
    const newList = customers.filter(c => !selectedCustomerIds.includes(c.id));
    setCustomers(newList);
    persist(newList);
    setSelectedCustomerIds([]);
  };

  const handleBulkToggleFiler = (filer: boolean) => {
    const newList = customers.map(c =>
      selectedCustomerIds.includes(c.id) ? { ...c, is_filer: filer } : c
    );
    setCustomers(newList);
    persist(newList);
    setSelectedCustomerIds([]);
  };

  const handleBulkToggleActive = (active: boolean) => {
    const newList = customers.map(c =>
      selectedCustomerIds.includes(c.id) ? { ...c, is_active: active } : c
    );
    setCustomers(newList);
    persist(newList);
    setSelectedCustomerIds([]);
  };

  const handleResetFilters = () => {
    setSelectedFilerStatus('all');
    setSelectedWalkinStatus('all');
    setSelectedActiveStatus('all');
    setSelectedSalesPerson('all');
    setTempFilerStatus('all');
    setTempWalkinStatus('all');
    setTempActiveStatus('all');
    setTempSalesPerson('all');
    setSortKey('name');
    setSortDir('asc');
    setSearch('');
    setCurrentPage(1);
    setShowFilterDrawer(false);
  };

  const handleSort = (key: 'name' | 'email' | 'credit_limit' | 'opening_balance' | 'status') => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortPanel(false);
  };

  // Filter & Sort Logic
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => (c.bp_type || 'customer') === 'customer');

    result = result.filter(c => {
      const matchQuery =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
        (c.ntn && c.ntn.toLowerCase().includes(search.toLowerCase()));

      const matchFiler =
        selectedFilerStatus === 'all' ||
        (selectedFilerStatus === 'filer' && c.is_filer) ||
        (selectedFilerStatus === 'non-filer' && !c.is_filer);

      const matchWalkin =
        selectedWalkinStatus === 'all' ||
        (selectedWalkinStatus === 'walkin' && c.is_walkin) ||
        (selectedWalkinStatus === 'standard' && !c.is_walkin);

      const matchActive =
        selectedActiveStatus === 'all' ||
        (selectedActiveStatus === 'active' && c.is_active) ||
        (selectedActiveStatus === 'inactive' && !c.is_active);

      const matchSalesPerson =
        selectedSalesPerson === 'all' ||
        (c as any).sales_person_id === selectedSalesPerson;

      return matchQuery && matchFiler && matchWalkin && matchActive && matchSalesPerson;
    });

    result = [...result].sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'credit_limit') { av = a.credit_limit || 0; bv = b.credit_limit || 0; }
      else if (sortKey === 'opening_balance') { av = a.opening_balance || 0; bv = b.opening_balance || 0; }
      else if (sortKey === 'status') { av = a.is_active ? 1 : 0; bv = b.is_active ? 1 : 0; }
      else {
        av = a[sortKey as keyof Customer] as string | number || '';
        bv = b[sortKey as keyof Customer] as string | number || '';
      }

      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [customers, search, selectedFilerStatus, selectedWalkinStatus, selectedActiveStatus, selectedSalesPerson, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredCustomers.length / perPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * perPage, currentPage * perPage);

  // KPI Calculations
  const customerSubset = useMemo(() => customers.filter(c => (c.bp_type || 'customer') === 'customer'), [customers]);
  const totalCount = customerSubset.length;
  const filersCount = customerSubset.filter(c => c.is_filer).length;
  const walkinCount = customerSubset.filter(c => c.is_walkin).length;
  const totalBalance = customerSubset.reduce((acc, c) => acc + (c.opening_balance || 0), 0);

  const stats = [
    { label: 'Total Customers', value: totalCount.toString(), sub: `${totalCount} customer database`, icon: User, color: brand.primary, bg: brand.surface },
    { label: 'Tax Filers', value: filersCount.toString(), sub: `${totalCount > 0 ? ((filersCount / totalCount) * 100).toFixed(0) : 0}% of customer base`, icon: CheckCircle, color: '#15803D', bg: '#F0FDF4' },
    { label: 'Walk-in Accounts', value: walkinCount.toString(), sub: `${walkinCount} retail accounts`, icon: Clock, color: '#C2410C', bg: '#FFF7ED' },
    { label: 'Total Balance', value: `Rs. ${totalBalance.toLocaleString()}`, sub: 'Total outstanding balance', icon: CreditCard, color: '#BE123C', bg: '#FFF1F2' },
  ];

  const sortOptions: { key: 'name' | 'email' | 'credit_limit' | 'opening_balance' | 'status'; label: string }[] = [
    { key: 'name', label: 'Customer Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'status', label: 'Status' },
    { key: 'credit_limit', label: 'Credit Limit' },
    { key: 'opening_balance', label: 'Total Balance' },
  ];

  return (
    <div className="min-h-full space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Customer Management"
        subtitle={`${filteredCustomers.length} customers found · Last updated just now`}
        actions={
          <>
            <Button
              variant="white"
              size="md"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              variant="white"
              size="md"
              icon={SlidersHorizontal}
              onClick={() => {
                setTempFilerStatus(selectedFilerStatus);
                setTempWalkinStatus(selectedWalkinStatus);
                setTempActiveStatus(selectedActiveStatus);
                setTempSalesPerson(selectedSalesPerson);
                setShowFilterDrawer(true);
              }}
              className="relative"
            >
              Filter
              {(selectedFilerStatus !== 'all' || selectedWalkinStatus !== 'all' || selectedActiveStatus !== 'all' || selectedSalesPerson !== 'all' || search !== '') && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                  style={{ background: brand.accent || '#EF4444' }}>!</span>
              )}
            </Button>
            <Button
              onClick={openCreate}
              variant="primary"
              size="md"
              icon={Plus}
              className="bg-emerald-500 hover:bg-emerald-600 shadow-none"
            >
              Add Customer
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-hidden">
        {stats.map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card
              className="p-4 transition-all group cursor-default"
              style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-black tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>{stat.value}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: stat.bg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-none"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>

        {/* Solid Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}>
          <CardTitle title="Customer Records" count={filteredCustomers.length} countLabel="customers" />

          {/* Search inside header bar */}
          <div className="flex items-center gap-2 print-hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search Customers..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSortPanel(p => !p); }}
                className={`border ${showSortPanel ? 'bg-white/25 border-white/25' : 'bg-white/10 border-white/20'} text-white hover:bg-white/20`}
                icon={ArrowUpDown}
              >
                Sort
              </Button>
              <AnimatePresence>
                {showSortPanel && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -4 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -4 }}
                     className="absolute right-0 top-9 z-30 bg-white rounded-xl shadow-xl border overflow-hidden w-44"
                     style={{ borderColor: brand.dark + '15' }}>
                    {sortOptions.map(opt => (
                      <button key={opt.key} onClick={() => handleSort(opt.key)}
                        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-all cursor-pointer text-left"
                        style={{ color: sortKey === opt.key ? brand.primary : brand.dark }}>
                        {opt.label}
                        {sortKey === opt.key && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-1 rounded transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-1 rounded transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Floating Bar */}
        <AnimatePresence>
          {selectedCustomerIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-slate-900 text-white px-6 py-3 border-t border-slate-800 flex items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-400">
                <strong className="text-white text-sm mr-1">{selectedCustomerIds.length}</strong> customers selected
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Inactive
                </button>
                <button
                  onClick={() => handleBulkToggleFiler(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Tax Filer
                </button>
                <button
                  onClick={() => handleBulkToggleFiler(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Non-Filer
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedCustomerIds([])}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table / Grid Mode */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${selectedFilerStatus}-${selectedWalkinStatus}-${sortKey}-${sortDir}-${currentPage}-${search}`}
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <AnimatePresence mode="wait">
              {viewMode === 'list' ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="w-full max-w-full" maxHeight="450px" style={{ overscrollBehavior: 'contain' }}>
                    <table className="w-full">
                      <thead className="sticky top-0 z-10 bg-white">
                        <tr className="border-b border-[#E2E8F0]">
                          <th className="px-4 py-2.5 text-center w-12 border-b border-[#E2E8F0]">
                            <input
                              type="checkbox"
                              checked={filteredCustomers.length > 0 && selectedCustomerIds.length === filteredCustomers.length}
                              onChange={handleSelectAll}
                              className="rounded border-slate-300 text-blue-650 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
                            />
                          </th>
                          {([
                            { label: 'Business Partner Details', key: 'name', width: 'w-[22%]' },
                            { label: 'Phone Number', key: 'email', width: 'w-[15%]' },
                            { label: 'City', key: null, width: 'w-[13%]' },
                            { label: 'Credit Limit (Rs.)', key: 'credit_limit', width: 'w-[13%]' },
                            { label: 'Total Balance (Rs.)', key: 'opening_balance', width: 'w-[13%]' },
                            { label: 'Tax Status', key: null, width: 'w-[13%]' },
                            { label: 'Status', key: 'status', width: 'w-[11%]' },
                            { label: 'Actions', key: null, width: 'w-20' },
                          ] as { label: string; key: 'name' | 'email' | 'credit_limit' | 'opening_balance' | 'status' | null; width: string }[])
                          .filter(h => h.label === 'Actions' || customerSettings.columns[h.label])
                          .map((h) => (
                            <TableHeader
                              key={h.label}
                              sortKey={h.key || undefined}
                              activeSortKey={sortKey}
                              sortDir={sortDir}
                              onSort={(key) => handleSort(key)}
                              width={h.width}
                              borderLeft={false}
                              label={h.label}
                            />
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCustomers.map((cust, i) => {
                          const isSelected = selectedCustomerIds.includes(cust.id);

                          return (
                            <motion.tr key={cust.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 30, delay: i * 0.03 }}
                              className={`group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0 ${isSelected ? 'bg-blue-50/15' : ''}`}
                            >
                              {/* Checkbox */}
                              <td className="px-4 py-3 text-center w-12">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(cust.id)}
                                  className="rounded border-slate-300 text-blue-650 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
                                />
                              </td>

                              {/* Customer Details */}
                              {customerSettings.columns['Business Partner Details'] && (
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-14 h-7 rounded-lg flex items-center justify-center bg-slate-100 border border-slate-200 text-black text-[10px] font-mono font-medium flex-shrink-0">
                                      {cust.customer_id || `C-${cust.id.slice(0, 4).toUpperCase()}`}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-[12px] font-normal truncate max-w-[180px]" style={{ color: brand.dark }}>{cust.name}</h4>
                                      <p className="text-[10px] font-normal text-slate-400 mt-0.5">{cust.email}</p>
                                    </div>
                                  </div>
                                </td>
                              )}

                              {/* Phone Number */}
                              {customerSettings.columns['Phone Number'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-black">
                                  <span className="whitespace-nowrap">
                                    {cust.phone || cust.mobile || 'N/A'}
                                  </span>
                                </td>
                              )}

                              {/* City */}
                              {customerSettings.columns['City'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-black">
                                  {cust.city || 'N/A'}
                                </td>
                              )}

                              {/* Credit Limit */}
                              {customerSettings.columns['Credit Limit (Rs.)'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-black">
                                  {cust.credit_limit ? cust.credit_limit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                                </td>
                              )}

                              {/* Balance */}
                              {customerSettings.columns['Total Balance (Rs.)'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-black"
                                  style={{ color: cust.opening_balance > 0 ? '#BE123C' : '#000000' }}>
                                  {cust.opening_balance ? cust.opening_balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                                </td>
                              )}

                              {/* Tax Status */}
                              {customerSettings.columns['Tax Status'] && (
                                <td className="px-4 py-3">
                                  {cust.is_filer
                                    ? <FilerChip label="Filer" size="md" />
                                    : <NonFilerChip label="Non-Filer" size="md" />
                                  }
                                </td>
                              )}

                              {/* Status */}
                              {customerSettings.columns['Status'] && (
                                <td className="px-4 py-3">
                                  {cust.is_active
                                    ? <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(cust.id)} />
                                    : <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(cust.id)} />
                                  }
                                </td>
                              )}

                              {/* Actions */}
                              <td className="px-1 py-3 w-16 whitespace-nowrap">
                                <div className="flex items-center gap-0">
                                  <Button onClick={() => setViewingCustomer(cust)}
                                    variant="ghost" size="xs" icon={Eye} title="View Profile"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => openEdit(cust)}
                                    variant="ghost" size="xs" icon={Edit2} title="Edit"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => handleDelete(cust.id, cust.name)}
                                    variant="ghost" size="xs" icon={Trash2} title="Delete"
                                    className="!px-1 !text-red-500" />
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}

                        {paginatedCustomers.length === 0 && (
                          <tr>
                            <td colSpan={2 + Object.values(customerSettings.columns).filter(Boolean).length} className="py-16 text-center">
                              <User className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                              <p className="text-[13px] font-medium text-slate-400">No customers found</p>
                              <p className="text-[11px] text-slate-300 mt-1">Try adjusting your filters or search query</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </ScrollArea>
                </motion.div>
              ) : (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="w-full max-w-full p-4 bg-slate-50/50" maxHeight="450px" style={{ overscrollBehavior: 'contain' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                      {paginatedCustomers.map((cust) => (
                        <motion.div
                          key={cust.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card
                            className="h-full flex flex-col hover:-translate-y-1 transition-all cursor-pointer group p-4"
                            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                            onClick={() => setViewingCustomer(cust)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="h-8 px-2.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-mono font-bold text-[10px] shadow-none group-hover:scale-105 transition-transform">
                                {cust.customer_id || `C-${cust.id.slice(0, 4).toUpperCase()}`}
                              </div>

                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openEdit(cust)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(cust.id, cust.name)}
                                  className="p-1.5 rounded-lg text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              {cust.is_filer
                                ? <FilerChip label="Filer" size="xs" />
                                : <NonFilerChip label="Non-Filer" size="xs" />
                              }
                              {cust.is_walkin && <Chip label="Walk-in" size="xs" color="#475569" bg="#F1F5F9" border="#E2E8F0" />}
                              {!cust.is_active && <InactiveChip label="Inactive" size="xs" />}
                            </div>

                            <h3 className="text-[12px] font-normal text-slate-800 mb-0.5 line-clamp-1">{cust.name}</h3>
                            <p className="text-[10px] font-medium text-slate-400 mb-2">{cust.email}</p>

                            <p className="text-[11px] text-slate-500 font-normal line-clamp-2 h-8 mb-4">
                              {cust.address ? `${cust.address}, ${cust.city || ''}` : 'No address specified.'}
                            </p>

                            <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Limit: Rs. {(cust.credit_limit || 0).toLocaleString()}</span>
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Bal: Rs. {(cust.opening_balance || 0).toLocaleString()}</span>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 print-hidden bg-slate-50/50">
            <span className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-slate-700 font-bold">{Math.min(filteredCustomers.length, (currentPage - 1) * perPage + 1)}-{Math.min(filteredCustomers.length, currentPage * perPage)}</strong> of <strong className="text-slate-700 font-bold">{filteredCustomers.length}</strong> customers
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="white" size="xs" icon={ChevronLeft}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              />
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-7 min-w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-650 hover:bg-slate-50'
                  }`}
                  style={{ backgroundColor: currentPage === i + 1 ? brand.primary : 'transparent' }}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                variant="white" size="xs" icon={ChevronRight}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Details View Drawer */}
      <AnimatePresence>
        {viewingCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              onClick={() => setViewingCustomer(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Customer Details</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Reference ID: {viewingCustomer.customer_id || 'N/A'}</p>
                </div>
                <button onClick={() => setViewingCustomer(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Header Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">{viewingCustomer.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{viewingCustomer.email || 'No email address'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionHeader title="Contact Information" icon={User} className="text-slate-700" />
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    {customerSettings.fields['Phone Number'] && <Input variant="compact" label="Phone Number" readOnly value={viewingCustomer.phone || 'N/A'} />}
                    {customerSettings.fields['Mobile Number'] && <Input variant="compact" label="Mobile Number" readOnly value={viewingCustomer.mobile || 'N/A'} />}
                    {customerSettings.fields['Website Link'] && <Input variant="compact" label="Website Link" readOnly value={viewingCustomer.website || 'N/A'} />}
                  </div>
                </div>

                {customerSettings.fields['Billing Address'] && (
                  <div className="space-y-4">
                    <SectionHeader title="Physical Address" icon={MapPin} className="text-slate-700" />
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
                      <TextArea className="!rounded-lg !text-[11px] py-1.5 px-3 h-14 bg-white" label="Billing Address" readOnly value={viewingCustomer.address || 'N/A'} />
                      <div className="grid grid-cols-3 gap-2.5">
                        <Input variant="compact" label="City" readOnly value={viewingCustomer.city || 'N/A'} />
                        <Input variant="compact" label="Province" readOnly value={viewingCustomer.province || 'N/A'} />
                        <Input variant="compact" label="Country" readOnly value={viewingCustomer.country || 'N/A'} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <SectionHeader title="Tax Registry & Limits" icon={Globe} className="text-slate-700" />
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    {customerSettings.fields['Walk-in Customer'] && <Input variant="compact" label="Account Type" readOnly value={viewingCustomer.is_walkin ? 'Walk-in Account' : 'Corporate Account'} />}
                    {customerSettings.fields['Tax Filer'] && <Input variant="compact" label="Tax Status" readOnly value={viewingCustomer.is_filer ? 'Filer' : 'Non-Filer'} />}
                    {customerSettings.fields['Credit Limit'] && <Input variant="compact" label="Credit Limit" readOnly value={`Rs. ${(viewingCustomer.credit_limit || 0).toLocaleString()}`} />}
                    {customerSettings.fields['Payment Terms'] && <Input variant="compact" label="Payment Terms" readOnly value={`${viewingCustomer.payment_term_days || 30} Days`} />}
                    {customerSettings.fields['Default Discount'] && <Input variant="compact" label="Default Discount" readOnly value={`${viewingCustomer.discount_percent || 0}%`} />}
                    {customerSettings.fields['NTN Code'] && <Input variant="compact" label="NTN Number" readOnly value={viewingCustomer.ntn || 'N/A'} />}
                    {customerSettings.fields['STRN Registry'] && <Input variant="compact" label="STRN Registry" readOnly value={viewingCustomer.stn || 'N/A'} />}
                    {customerSettings.fields['CNIC Number'] && <Input variant="compact" label="CNIC Number" readOnly value={viewingCustomer.cnic || 'N/A'} />}
                    {customerSettings.fields['WHT Category'] && <Input variant="compact" label="WHT Category" readOnly value={viewingCustomer.wht_type || 'N/A'} />}
                    {customerSettings.fields['Total Balance'] && <Input variant="compact" label="Outstanding Balance" readOnly value={`Rs. ${(viewingCustomer.opening_balance || 0).toLocaleString()}`} />}
                    {customerSettings.fields['Salesperson'] && (
                      <Input
                        variant="compact"
                        label="Salesperson Assigned"
                        readOnly
                        value={salesPersonsList.find(x => x.id === viewingCustomer.sales_person_id)?.name || 'None'}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
                <Button variant="white" size="md" onClick={() => setViewingCustomer(null)}>Close</Button>
                <Button variant="primary" size="md" icon={Edit2} onClick={() => { const c = viewingCustomer; setViewingCustomer(null); openEdit(c); }} style={{ backgroundColor: brand.primary }}>Edit Profile</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-3xl flex flex-col max-h-[90vh]"
            >
             {/* Modal Header */}
             <ModalHeader
               title={editing.name ? `Edit Customer: ${editing.name}` : 'Create New Customer'}
               onClose={closeModal}
             />

              {/* Modal Tab Switcher */}
              <div className="flex border-b text-xs font-bold bg-slate-50/50 flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
                {[
                  { id: 'general', label: 'Basic Info', icon: User },
                  { id: 'settings', label: 'Credit & Registries', icon: ShieldCheck },
                  { id: 'accounting', label: 'Accounting', icon: CreditCard }
                ].map(tab => {
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (!validateForm()) {
                          setActiveTab('general');
                          return;
                        }
                        setActiveTab(tab.id as any);
                      }}
                      className="flex items-center gap-2 px-6 py-3 border-b-2 font-bold cursor-pointer transition-all outline-none"
                      style={{
                        borderColor: isCurrent ? brand.primary : 'transparent',
                        color: isCurrent ? brand.primary : '#64748B'
                      }}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-slate-50/20">
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* SECTION 1: BASIC INFORMATION */}
                    <div className="space-y-1.5">
                      <SectionHeader title="Basic Information" icon={User} className="text-slate-700" />
                      <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                        <div className="grid grid-cols-2 gap-4">
                          {codeSetting.mode === 'auto' ? (
                            <>
                              <Input
                                variant="compact"
                                label="Customer ID / Code"
                                value={editing.customer_id || ''}
                                onChange={(e) => setEditing({ ...editing, customer_id: e.target.value })}
                                placeholder="e.g. CUST-0001 (Auto-generated if empty)"
                                readOnly={true}
                              />
                              <Input
                                variant="compact"
                                label="Customer Name *"
                                value={editing.name}
                                onChange={(e) => {
                                  setEditing({ ...editing, name: e.target.value });
                                  if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, name: '' }));
                                }}
                                error={formErrors.name}
                                placeholder="e.g. Acme Corporation"
                              />
                            </>
                          ) : (
                            <>
                              <Input
                                variant="compact"
                                label="Customer Name *"
                                value={editing.name}
                                onChange={(e) => {
                                  setEditing({ ...editing, name: e.target.value });
                                  if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, name: '' }));
                                }}
                                error={formErrors.name}
                                placeholder="e.g. Acme Corporation"
                              />
                              <Input
                                variant="compact"
                                label="Customer ID / Code"
                                value={editing.customer_id || ''}
                                onChange={(e) => setEditing({ ...editing, customer_id: e.target.value })}
                                placeholder="e.g. CUST-0001 (Auto-generated if empty)"
                                readOnly={false}
                              />
                            </>
                          )}
                          {customerSettings.fields['Email Address'] && (
                            <Input
                              variant="compact"
                              label="Email Address"
                              type="email"
                              value={editing.email}
                              onChange={(e) => {
                                setEditing({ ...editing, email: e.target.value });
                                if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, email: '' }));
                              }}
                              error={formErrors.email}
                              placeholder="e.g. accounting@acme.com"
                            />
                          )}
                          {customerSettings.fields['Phone Number'] && <Input variant="compact" label="Phone Number" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="e.g. +92 21 3456789" />}
                          {customerSettings.fields['Mobile Number'] && <Input variant="compact" label="Mobile Number" value={editing.mobile} onChange={(e) => setEditing({ ...editing, mobile: e.target.value })} placeholder="e.g. +92 300 1234567" />}
                          {customerSettings.fields['Website Link'] && <Input variant="compact" label="Website Link" value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="e.g. www.acme.com" />}
                        </div>
                      </Card>
                    </div>

                    {/* SECTION 4: PHYSICAL ADDRESS */}
                    {customerSettings.fields['Billing Address'] && (
                      <div className="space-y-1.5">
                        <SectionHeader title="Physical Address" icon={MapPin} className="text-slate-700" />
                        <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <TextArea className="!rounded-lg !text-[11px] py-1.5 px-3 h-14" label="Billing Street Address" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} placeholder="e.g. Suite #12, 3rd Floor, Commercial Plaza" />
                            </div>
                            <Input variant="compact" label="City" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} placeholder="Karachi" />
                            <Input variant="compact" label="Province/State" value={editing.province} onChange={(e) => setEditing({ ...editing, province: e.target.value })} placeholder="Sindh" />
                            <Input variant="compact" label="Country" value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} placeholder="Pakistan" />
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* SECTION 2: BUSINESS SETTINGS */}
                    <div className="space-y-1.5">
                      <SectionHeader title="Business & Tax Settings" icon={ShieldCheck} className="text-slate-700" />
                      <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-6 flex-wrap pt-1">
                            {customerSettings.fields['Walk-in Customer'] && <Toggle checked={editing.is_walkin} onChange={(v) => setEditing({ ...editing, is_walkin: v })} label="Walk-in Retail Business Partner" />}
                            {customerSettings.fields['Tax Filer'] && <Toggle checked={editing.is_filer} onChange={(v) => setEditing({ ...editing, is_filer: v })} label="Registered Tax Filer" />}
                            <Toggle checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} label="Active Account Status" />
                          </div>
                          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0]">
                            {customerSettings.fields['Credit Limit'] && <Input variant="compact" label="Credit Limit (Rs.)" type="number" value={editing.credit_limit?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, credit_limit: parseFloat(e.target.value) || 0 })} placeholder="0.00" />}
                            {customerSettings.fields['Payment Terms'] && <Input variant="compact" label="Payment Terms (Days)" type="number" value={editing.payment_term_days?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, payment_term_days: parseInt(e.target.value) || 0 })} placeholder="30" />}
                            {customerSettings.fields['Default Discount'] && <Input variant="compact" label="Default Discount (%)" type="number" value={editing.discount_percent?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, discount_percent: parseFloat(e.target.value) || 0 })} placeholder="0" />}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* SECTION 5: TAX LAWS */}
                    <div className="space-y-1.5">
                      <SectionHeader title="Government Registries & WHT" icon={Globe} className="text-slate-700" />
                      <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                        <div className="grid grid-cols-3 gap-3">
                          {customerSettings.fields['NTN Code'] && <Input variant="compact" label="National Tax Number (NTN)" value={editing.ntn} onChange={(e) => setEditing({ ...editing, ntn: e.target.value })} placeholder="1234567-8" />}
                          {customerSettings.fields['STRN Registry'] && <Input variant="compact" label="Sales Tax Number (STRN)" value={editing.stn} onChange={(e) => setEditing({ ...editing, stn: e.target.value })} placeholder="STN-12345" />}
                          {customerSettings.fields['CNIC Number'] && <Input variant="compact" label="CNIC Number" value={editing.cnic} onChange={(e) => setEditing({ ...editing, cnic: e.target.value })} placeholder="42101-1234567-1" />}
                          {customerSettings.fields['WHT Category'] && <Input variant="compact" label="Withholding Tax (WHT) Type" value={editing.wht_type} onChange={(e) => setEditing({ ...editing, wht_type: e.target.value })} placeholder="Active / Exempt / Suspended" />}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === 'accounting' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* SECTION 3: FINANCIAL ACCOUNTING */}
                    <div className="space-y-1.5">
                      <SectionHeader title="Accounting Details" icon={CreditCard} className="text-slate-700" />
                      <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                        <div className="grid grid-cols-3 gap-3">
                          {customerSettings.fields['Total Balance'] && <Input variant="compact" label="Total Balance (Rs.)" type="number" value={editing.opening_balance?.toString() ?? ''} onChange={(e) => setEditing({ ...editing, opening_balance: parseFloat(e.target.value) || 0 })} placeholder="0.00" />}
                          {customerSettings.fields['Salesperson'] && (
                            <Select
                              variant="compact"
                              label="Salesperson"
                              value={editing.sales_person_id || ''}
                              onChange={(e) => setEditing({ ...editing, sales_person_id: e.target.value })}
                              options={[
                                { value: '', label: 'Select Salesperson...' },
                                ...salesPersonsList.map(sp => ({ value: sp.id, label: sp.name }))
                              ]}
                            />
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50 rounded-b-3xl flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
                <div>
                  {activeTab !== 'general' && (
                    <Button
                      type="button"
                      variant="white"
                      size="md"
                      icon={ChevronLeft}
                      onClick={() => {
                        if (activeTab === 'settings') setActiveTab('general');
                        else if (activeTab === 'accounting') setActiveTab('settings');
                      }}
                    >
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="white" size="md" onClick={closeModal}>
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    icon={Save}
                    onClick={handleSave}
                    className="bg-emerald-500 hover:bg-emerald-600 shadow-none text-white"
                  >
                    {customers.some(c => c.id === editing.id) ? 'Save Changes' : 'Add Customer'}
                  </Button>

                  {activeTab !== 'accounting' && (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      icon={ChevronRight}
                      iconPosition="right"
                      onClick={() => {
                        if (!validateForm()) {
                          setActiveTab('general');
                          return;
                        }
                        if (activeTab === 'general') setActiveTab('settings');
                        else if (activeTab === 'settings') setActiveTab('accounting');
                      }}
                      style={{ backgroundColor: brand.primary }}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        onApply={() => {
          setSelectedFilerStatus(tempFilerStatus);
          setSelectedWalkinStatus(tempWalkinStatus);
          setSelectedActiveStatus(tempActiveStatus);
          setSelectedSalesPerson(tempSalesPerson);
          setCurrentPage(1);
          setShowFilterDrawer(false);
        }}
      >
        {/* Tax Status */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Tax status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[
              { key: 'all', label: 'All' },
              { key: 'filer', label: 'Filer' },
              { key: 'non-filer', label: 'Non-Filer' }
            ].map(opt => {
              const isActive = tempFilerStatus === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTempFilerStatus(opt.key)}
                  className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none ${isActive
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-805 bg-transparent border border-transparent'
                    }`}
                  style={{ color: isActive ? brand.primary : undefined }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Type */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Account type</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[
              { key: 'all', label: 'All' },
              { key: 'walkin', label: 'Walk-in' },
              { key: 'standard', label: 'Standard' }
            ].map(opt => {
              const isActive = tempWalkinStatus === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTempWalkinStatus(opt.key)}
                  className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none ${isActive
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-805 bg-transparent border border-transparent'
                    }`}
                  style={{ color: isActive ? brand.primary : undefined }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Status */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Account Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' }
            ].map(opt => {
              const isActive = tempActiveStatus === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTempActiveStatus(opt.key as any)}
                  className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none ${isActive
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-805 bg-transparent border border-transparent'
                    }`}
                  style={{ color: isActive ? brand.primary : undefined }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Person */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Sales Person</label>
          <ComboBox
            value={tempSalesPerson === 'all' ? '' : tempSalesPerson}
            onChange={(val) => setTempSalesPerson(val || 'all')}
            options={salesPersonsList}
            placeholder="Select Sales Person..."
            variant="compact"
          />
        </div>
      </FilterDrawer>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Customer?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and all associated customer records will be permanently removed."
      />
      <ConfirmModal
        isOpen={bulkConfirmModal}
        onClose={() => setBulkConfirmModal(false)}
        onConfirm={doBulkDelete}
        title={`Delete ${selectedCustomerIds.length} Customers?`}
        message={`Are you sure you want to permanently delete the ${selectedCustomerIds.length} selected customer${selectedCustomerIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Yes, Delete All"
        variant="danger"
      />
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title="Required Fields Missing"
        message={alertModal.message}
        variant="warning"
      />
      <Toast
        isOpen={toastMessageData.isOpen}
        onClose={() => setToastMessageData(prev => ({ ...prev, isOpen: false }))}
        messages={toastMessageData.messages}
      />
    </div>
  );
};

export default CustomerComponent;
