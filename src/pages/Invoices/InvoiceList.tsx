import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, Plus,
  FileText, CheckCircle, Clock, TrendingUp,
  ArrowUpDown, Printer, Trash2, Edit3,
  ChevronLeft, ChevronRight, SlidersHorizontal, X,
  CreditCard, Package
} from 'lucide-react';
import { ScrollArea, Select, Input, TextArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import Card from '../../components/ui/Card';
import type { InvoiceData, InvoiceItem } from '../../types';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { seedPrintTemplates } from '../../utils/settingsData';
import { sampleCustomers } from '../../utils/customerData';

// ─── Data ────────────────────────────────────────────────────────────────────
export type { InvoiceStatus, Invoice } from './invoiceTypes';
export { initialInvoices } from './invoiceTypes';
import type { InvoiceStatus, Invoice } from './invoiceTypes';

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  Posted: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  Unposted: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', icon: Clock },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = 'id' | 'fbrInvoiceNumber' | 'customer' | 'issueDate' | 'dueDate' | 'amount' | 'status' | 'type';
type SortDir = 'asc' | 'desc';

// ─── Component ────────────────────────────────────────────────────────────────
interface InvoiceListProps {
  onViewChange?: (view: 'dashboard' | 'invoices' | 'add-invoice' | 'add-invoice-v2' | 'add-invoice-v3' | 'add-invoice-v4' | 'customers' | 'settings' | 'help') => void;
  invoiceItems: Invoice[];
  setInvoiceItems: React.Dispatch<React.SetStateAction<Invoice[]>>;
  onPrintInvoice?: (inv: Invoice, templateId?: string) => void;
  onEditInvoice?: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onViewChange, invoiceItems, setInvoiceItems, onPrintInvoice, onEditInvoice }) => {
  const { brand } = useTheme();

  // ─── Stats Cards Data ─────────────────────────────────────────────────────────
  const postedCount = invoiceItems.filter(i => i.status === 'Posted').length;
  const unpostedCount = invoiceItems.filter(i => i.status === 'Unposted').length;
  const postedSum = invoiceItems.filter(i => i.status === 'Posted').reduce((sum, i) => sum + (i.rawAmount || 0), 0);
  const unpostedSum = invoiceItems.filter(i => i.status === 'Unposted').reduce((sum, i) => sum + (i.rawAmount || 0), 0);

  const stats = [
    { label: 'Total Invoices', value: String(invoiceItems.length), sub: 'Overall volume', icon: FileText, color: brand.primary, bg: brand.surface },
    { label: 'Posted', value: String(postedCount), sub: `Rs. ${postedSum.toLocaleString(undefined, { maximumFractionDigits: 0 })} volume`, icon: CheckCircle, color: '#15803D', bg: '#F0FDF4' },
    { label: 'Unposted', value: String(unpostedCount), sub: `Rs. ${unpostedSum.toLocaleString(undefined, { maximumFractionDigits: 0 })} waiting`, icon: Clock, color: '#C2410C', bg: '#FFF7ED' },
    { label: 'Total Revenue', value: `Rs. ${postedSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'From posted invoices', icon: TrendingUp, color: brand.primary, bg: brand.surface },
  ];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [saleInvNoFilter, setSaleInvNoFilter] = useState<string>('');
  const [tempStatusFilter, setTempStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [tempTypeFilter, setTempTypeFilter] = useState<string>('All');
  const [tempCustomerFilter, setTempCustomerFilter] = useState<string>('All');
  const [tempSaleInvNoFilter, setTempSaleInvNoFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [openAction, setOpenAction] = useState<string | null>(null);
  const [activePrintRowId, setActivePrintRowId] = useState<string | null>(null);
  const [showPreviewPrintDropdown, setShowPreviewPrintDropdown] = useState(false);
  const [templates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('print_templates');
      const deletedIds = new Set(['pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9', 'pt-10', 'pt-11', 'pt-12']);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((t: any) => !deletedIds.has(t.template_id));
        if (filtered.length < seedPrintTemplates.length) {
          const storedIds = new Set(filtered.map((t: any) => t.template_id));
          const missing = seedPrintTemplates.filter(t => !storedIds.has(t.template_id));
          const merged = [...filtered, ...missing];
          localStorage.setItem('print_templates', JSON.stringify(merged));
          return merged;
        }
        return filtered;
      }
      return seedPrintTemplates;
    } catch {
      return seedPrintTemplates;
    }
  });

  const getTemplatesForInvoice = (inv: Invoice) => {
    let normType: string;
    if (inv.type === 'Sale Return') normType = 'Sales Return';
    else if (inv.type === 'Service' || inv.type === 'Service Invoice') normType = 'Service Invoice';
    else normType = 'Sales Invoice'; // 'Sale Invoice' and anything else
    return templates.filter(t => t.is_active && t.document_type === normType);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('issueDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'warning' | 'error' | 'info' }>({ isOpen: false, title: '', message: '' });
  const perPage = 15;

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setShowSortPanel(false);
      }
      if (openAction && !target.closest('.action-menu-container')) {
        setOpenAction(null);
      }
      if (activePrintRowId && !target.closest('.print-dropdown-container')) {
        setActivePrintRowId(null);
      }
      if (showPreviewPrintDropdown && !target.closest('.preview-print-dropdown-container')) {
        setShowPreviewPrintDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openAction, activePrintRowId, showPreviewPrintDropdown]);

  const handleResetFilters = () => {
    setStatusFilter('All');
    setTypeFilter('All');
    setCustomerFilter('All');
    setSaleInvNoFilter('');
    setTempStatusFilter('All');
    setTempTypeFilter('All');
    setTempCustomerFilter('All');
    setTempSaleInvNoFilter('');
    setStartDate('');
    setEndDate('');
    setTempStartDate('');
    setTempEndDate('');
    setSearch('');
    setCurrentPage(1);
    setShowFilterDrawer(false);
  };

  const handleExport = () => {
    try {
      const headers = ['Invoice ID', 'Business Partner', 'Issue date', 'Due date', 'Amount (Rs.)', 'Type', 'Status'];
      const rows = filtered.map(inv => [
        inv.id,
        inv.customer,
        inv.issueDate,
        inv.dueDate,
        inv.amount.replace(/^(Rs\.|PKR|\$)\s*/i, ''),
        inv.type || 'Standard',
        inv.status
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      setAlertModal({
        isOpen: true,
        title: 'Export Failed',
        message: 'Failed to export invoices.',
        variant: 'error'
      });
    }
  };

  const handleOpenPreview = (inv: Invoice) => {
    try {
      const stored = localStorage.getItem(`invoice_detail_${inv.id}`);
      if (stored) {
        setPreviewInvoice(JSON.parse(stored) as InvoiceData);
      } else {
        const fallback: InvoiceData = {
          invoiceNumber: inv.id,
          date: inv.issueDate,
          dueDate: inv.dueDate,
          senderName: 'Antigravity Creative Studio',
          senderAddress: '452 Innovation Blvd, San Francisco, CA 94107',
          customerName: inv.customer,
          customerAddress: 'Enterprise Customer Account',
          subject: 'Services Rendered',
          reference: '',
          productCode: '',
          remarks: '',
          type: inv.type || 'Standard',
          items: [
            {
              id: '1',
              productCode: 'BC-001',
              description: `${inv.type || 'Standard'} Services & Deliverables`,
              unit: 'Job',
              unitDetails: '',
              quantity: 1,
              price: inv.rawAmount || 0,
              discount: 0,
              tax: 0,
              furtherTax: 0
            }
          ],
          taxRate: 0,
          discountPercentage: 0,
          discountAmount: 0,
          shippingCharges: 0,
          roundOff: 0,
          receivedAmount: 0,
          bankAccount: '',
          notes: `Please include the invoice number ${inv.id} in your wire transfer reference.`,
          salesPerson: '',
          department: ''
        };
        setPreviewInvoice(fallback);
      }
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Load Failed',
        message: 'Failed to load invoice preview!',
        variant: 'error'
      });
    }
  };

  const typeOptions = ['All', 'Sale Invoice', 'Sale Return', 'Service Invoice', 'Digital Invoice'];

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    setInvoiceItems(prev => prev.filter(x => x.id !== deleteModal.id));
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortPanel(false);
  };

  const uniqueCustomers = (() => {
    try {
      const stored = localStorage.getItem('customers');
      const list = stored ? JSON.parse(stored) : [];
      const registryNames = list.map((c: any) => c.name);
      const allNames = new Set([
        ...registryNames,
        ...sampleCustomers.map(c => c.name),
        ...invoiceItems.map(inv => inv.customer)
      ]);
      return ['All', ...Array.from(allNames).sort()];
    } catch {
      const allNames = new Set([
        ...sampleCustomers.map(c => c.name),
        ...invoiceItems.map(inv => inv.customer)
      ]);
      return ['All', ...Array.from(allNames).sort()];
    }
  })();

  const filtered = invoiceItems
    .filter(inv => {
      const matchSearch = inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer.toLowerCase().includes(search.toLowerCase()) ||
        (inv.fbrInvoiceNumber && inv.fbrInvoiceNumber.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      const matchType = typeFilter === 'All' || inv.type === typeFilter;
      const matchCustomer = customerFilter === 'All' || inv.customer === customerFilter;
      const matchSaleInvNo = !saleInvNoFilter.trim() || 
        inv.id.toLowerCase().includes(saleInvNoFilter.toLowerCase()) ||
        (inv.fbrInvoiceNumber && inv.fbrInvoiceNumber.toLowerCase().includes(saleInvNoFilter.toLowerCase()));
      
      let matchDate = true;
      if (startDate) matchDate = matchDate && inv.issueDate >= startDate;
      if (endDate) matchDate = matchDate && inv.issueDate <= endDate;
      
      return matchSearch && matchStatus && matchType && matchCustomer && matchSaleInvNo && matchDate;
    })
    .sort((a, b) => {
      let av: string | number = (a[sortKey] || '') as string | number;
      let bv: string | number = (b[sortKey] || '') as string | number;
      if (sortKey === 'amount') { av = a.rawAmount; bv = b.rawAmount; }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'fbrInvoiceNumber', label: 'FBR Invoice Number' },
    { key: 'customer', label: 'Business Partner Name' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'type', label: 'Type' },
  ];

  const SortArrow = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-block opacity-50" style={{ color: sortKey === col ? brand.primary : brand.dark }}>
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>Sale List</h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            {filtered.length} sales found · Last updated just now
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="white"
            size="md"
            icon={Download}
            onClick={handleExport}
          >
            Export
          </Button>
           <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempStatusFilter(statusFilter);
              setTempTypeFilter(typeFilter);
              setTempStartDate(startDate);
              setTempEndDate(endDate);
              setShowFilterDrawer(true);
            }}
            className="relative"
          >
            Filter
            {(statusFilter !== 'All' || typeFilter !== 'All' || customerFilter !== 'All' || saleInvNoFilter !== '' || startDate !== '' || endDate !== '' || search !== '') && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                style={{ background: brand.accent || '#EF4444' }}>!</span>
            )}
          </Button>
          <Button
            onClick={() => onViewChange?.('add-invoice-v4')}
            variant="primary"
            size="md"
            icon={Plus}
            className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
          >
            Create Invoice
          </Button>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* ── Table Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-none"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>

        {/* ── Solid Header Bar (reference image style) ── */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Sale Records</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {filtered.length} sales
            </span>
          </div>

          {/* Search inside header bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search invoices or partners..."
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
                        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-all"
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
          </div>
        </div>


        {/* Table */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${statusFilter}-${typeFilter}-${sortKey}-${sortDir}-${currentPage}-${search}`}
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <ScrollArea className="w-full max-w-full overflow-x-hidden" maxHeight="340px" style={{ overscrollBehavior: 'contain', overflowX: 'hidden' }}>
              <table className="w-full table-layout-fixed">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-[#E2E8F0]">
                    {([
                      { label: 'Invoice ID', key: 'id', width: 'w-[10%]' },
                      { label: 'FBR Invoice Number', key: 'fbrInvoiceNumber', width: 'w-[14%]' },
                      { label: 'Business Partner', key: 'customer', width: 'w-[18%]' },
                      { label: 'Issue Date', key: 'issueDate', width: 'w-[10%]' },
                      { label: 'Due Date', key: 'dueDate', width: 'w-[10%]' },
                      { label: 'Amount (Rs.)', key: 'amount', width: 'w-[10%]' },
                      { label: 'Type', key: 'type', width: 'w-[9%]' },
                      { label: 'Status', key: 'status', width: 'w-[9%]' },
                      { label: 'Actions', key: null, width: 'w-[10%]' },
                    ] as { label: string; key: SortKey | null; width: string }[]).map((h) => (
                      <th key={h.label}
                        className={`${h.label === 'Actions' ? 'px-2' : 'px-4'} py-3 text-left border-b ${h.key ? 'cursor-pointer hover:bg-blue-50/40 select-none' : ''} transition-colors ${h.width}`}
                        style={{ borderColor: brand.dark + '10' }}
                        onClick={() => h.key && handleSort(h.key)}>
                        <span className="text-[10px] font-black tracking-widest inline-flex items-center gap-0.5 whitespace-nowrap"
                          style={{ color: sortKey === h.key ? brand.primary : '#000000' }}>
                          {h.label}
                          {h.key && <SortArrow col={h.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((inv, i) => {
                    const cfg = statusConfig[inv.status] || statusConfig['Unposted'];
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr key={inv.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30, delay: i * 0.04 }}
                        className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0"
                      >
                        {/* Invoice ID */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-normal font-mono" style={{ color: brand.dark }}>{inv.id}</span>
                        </td>

                        {/* FBR Invoice Number */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-normal font-mono text-slate-600">
                            {inv.status === 'Posted' ? (inv.fbrInvoiceNumber || '-') : '-'}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-normal truncate max-w-[200px]" style={{ color: brand.dark }}>
                            {inv.customer}
                          </span>
                        </td>

                        {/* Issue Date */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-normal text-slate-500">{inv.issueDate}</span>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-normal"
                             style={{ color: inv.status === 'Unposted' ? '#BE123C' : 'rgb(100 116 139)' }}>
                            {inv.dueDate}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-[12px] font-normal text-slate-600">
                          <span>{inv.amount.replace(/^(Rs\.|PKR|\$)\s*/i, '')}</span>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-normal" style={{ color: brand.dark }}>{inv.type}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full w-fit border whitespace-nowrap"
                            style={{ background: cfg.bg, borderColor: cfg.border }}>
                            <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.text }} />
                            <span className="text-[12px] font-medium tracking-wide" style={{ color: cfg.text }}>
                              {inv.status}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-2 py-3 w-24">
                          <div className="flex items-center gap-1">
                            <Button onClick={() => handleOpenPreview(inv)}
                              variant="ghost" size="xs" icon={Eye} title="View"
                              className="!px-1 text-blue-600 hover:bg-blue-50" />
                            <Button onClick={() => onEditInvoice?.(inv.id)}
                              variant="ghost" size="xs" icon={Edit3} title="Edit"
                              className="!px-1 text-blue-600 hover:bg-blue-50" />
                            <div className="relative print-dropdown-container">
                              <Button onClick={(e) => {
                                e.stopPropagation();
                                setActivePrintRowId(activePrintRowId === inv.id ? null : inv.id);
                              }}
                                variant="ghost" size="xs" icon={Printer} title="Print Layout"
                                className="!px-1 text-blue-600 hover:bg-blue-50" />
                              <AnimatePresence>
                                {activePrintRowId === inv.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border p-2 w-48 shadow-lg"
                                    style={{ borderColor: '#E2E8F0' }}
                                  >
                                    {getTemplatesForInvoice(inv).map(t => (
                                      <button
                                        key={t.template_id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onPrintInvoice?.(inv, t.template_id);
                                          setActivePrintRowId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 text-brand-dark cursor-pointer border-none"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {t.template_name} ({t.paper_size})
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <Button onClick={() => {
                              const normType = inv.type === 'Sale Return' ? 'Sales Return' : 'Sales Invoice';
                              const matchingTemplates = templates.filter(t => t.is_active && t.document_type === normType);
                              const defaultTemplate = matchingTemplates.find(t => t.is_default) || matchingTemplates[0] || templates.find(t => t.is_active) || templates[0];
                              onPrintInvoice?.(inv, defaultTemplate?.template_id);
                            }}
                              variant="ghost" size="xs" icon={Download} title="Download PDF"
                              className="!px-1 text-blue-600 hover:bg-blue-50" />
                            <Button onClick={() => handleDelete(inv.id, inv.customer)}
                              variant="ghost" size="xs" icon={Trash2} title="Delete"
                              className="!px-1 !text-red-500" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}

                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                        <p className="text-[13px] font-medium text-slate-400">No invoices found</p>
                        <p className="text-[11px] text-slate-300 mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: brand.dark + '08', background: brand.surface + '60' }}>
            <p className="text-[11px] font-medium text-black">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white" size="xs" icon={ChevronLeft}
                className="w-8 h-8 px-0" />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'} size="xs"
                  className="w-8 h-8 px-0 border-none"
                >
                  {p}
                </Button>
              ))}
              <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white" size="xs" icon={ChevronRight}
                className="w-8 h-8 px-0" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Click outside is handled by document click listener */}

      {/* Stunning Glassmorphism Invoice Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (() => {
          const invoiceObj = invoiceItems.find(inv => inv.id === previewInvoice.invoiceNumber);
          const status = invoiceObj ? invoiceObj.status : 'Unposted';
          return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-white max-w-4xl w-full rounded-3xl border overflow-hidden flex flex-col max-h-[90vh] relative border-slate-100 font-sans shadow-none"
                style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b flex-shrink-0" style={{ borderColor: brand.dark + '10' }}>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5" style={{ color: brand.dark }}>
                      Invoice: {previewInvoice.invoiceNumber}
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 capitalize">{previewInvoice.type}</span>
                      {(() => {
                        const cfg = statusConfig[status] || statusConfig['Unposted'];
                        const StatusIcon = cfg.icon;
                        return (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap"
                            style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}>
                            <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.text }} />
                            <span>{status}</span>
                          </div>
                        );
                      })()}
                    </h2>
                  </div>
                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              {/* Scrollable Modal Content */}
              <ScrollArea className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar" maxHeight="calc(90vh - 140px)">
                <div className="space-y-6">
                  {/* SECTION 1: General Information */}
                  <div className="space-y-1.5">
                    <h4 className="text-[13px] font-black ml-1 flex items-center gap-2" style={{ color: brand.dark }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: brand.primary }} />
                      General Information
                    </h4>
                    <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer details */}
                        <div className="space-y-3">
                          <Input variant="compact" label="Business Partner Name" placeholder="Business Partner Name" readOnly value={previewInvoice.customerName} />
                          <TextArea label="Address" placeholder="Address" readOnly value={previewInvoice.customerAddress || ''} className="!rounded-lg text-[11px] py-1.5 px-3 h-14" />
                        </div>
                        {/* Sender details */}
                        <div className="space-y-3">
                          <Input variant="compact" label="Company Name" placeholder="Company Name" readOnly value={previewInvoice.senderName || 'Antigravity Creative Studio'} />
                          <TextArea label="Company Address" placeholder="Company Address" readOnly value={previewInvoice.senderAddress || ''} className="!rounded-lg text-[11px] py-1.5 px-3 h-14" />
                        </div>
                      </div>
                      <div className="h-px bg-slate-100 my-4" />
                      <div className={`grid grid-cols-2 sm:grid-cols-3 ${status === 'Posted' ? 'md:grid-cols-7' : 'md:grid-cols-6'} gap-4`}>
                        <Input variant="compact" label="Issue Date" placeholder="Issue Date" readOnly value={previewInvoice.date} />
                        <Input variant="compact" label="Due Date" placeholder="Due Date" readOnly value={previewInvoice.dueDate} />
                        <Input variant="compact" label="Invoice ID" placeholder="Invoice ID" readOnly value={previewInvoice.invoiceNumber} />
                        <Input variant="compact" label="Invoice Type" placeholder="Invoice Type" readOnly value={previewInvoice.type} />
                        <Input variant="compact" label="Reference" placeholder="Reference" readOnly value={previewInvoice.reference || 'N/A'} />
                        <Input variant="compact" label="Subject" placeholder="Subject" readOnly value={previewInvoice.subject || 'Services Rendered'} />
                        {status === 'Posted' && (
                          <Input variant="compact" label="FBR Invoice Number" placeholder="FBR Invoice Number" readOnly value={invoiceObj?.fbrInvoiceNumber || ''} />
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* SECTION 2: Transaction Entries */}
                  <div className="space-y-1.5">
                    <h4 className="text-[13px] font-black ml-1 flex items-center gap-2" style={{ color: brand.dark }}>
                      <Package className="w-3.5 h-3.5" style={{ color: brand.primary }} />
                      Transaction Entries
                    </h4>
                    <Card className="p-0 overflow-hidden" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-black tracking-widest text-slate-500 border-b" style={{ borderColor: brand.dark + '10' }}>
                              <th className="py-3 px-4 text-[10px] font-black tracking-widest text-slate-500">Product Code</th>
                              <th className="py-3 px-4 w-[25%] text-[10px] font-black tracking-widest text-slate-500">Description</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Unit</th>
                              <th className="py-3 px-4 text-left text-[10px] font-black tracking-widest text-slate-500">Details</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Qty</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Price (Rs.)</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Discount (Rs.)</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Tax (Rs.)</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Further Tax (Rs.)</th>
                              <th className="py-3 px-4 text-right text-[10px] font-black tracking-widest text-slate-500">Total (Rs.)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewInvoice.items.map((item: InvoiceItem, idx: number) => {
                              const itemTotal = (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0);
                              return (
                                <tr key={idx} className="border-b text-[12px] text-slate-600 last:border-0" style={{ borderColor: brand.dark + '06' }}>
                                  <td className="py-3.5 px-4 font-medium font-mono" style={{ color: brand.primary }}>{item.productCode || 'BC-001'}</td>
                                  <td className="py-3.5 px-4 font-normal leading-relaxed" style={{ color: brand.dark }}>{item.description}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-slate-500">{item.unit || 'Job'}</td>
                                  <td className="py-3.5 px-4 text-left font-normal text-slate-500">{item.unitDetails || ''}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-slate-600">{item.quantity}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-slate-500">{item.price.toFixed(2)}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-red-500">-{item.discount === 0 ? '0.00' : item.discount.toFixed(2)}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-green-600">+{item.tax === 0 ? '0.00' : item.tax.toFixed(2)}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-green-600">+{(item.furtherTax || 0) === 0 ? '0.00' : (item.furtherTax || 0).toFixed(2)}</td>
                                  <td className="py-3.5 px-4 text-right font-normal text-slate-700">{itemTotal.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>

                  {/* SECTION 3: Notes & Financial Breakdown */}
                  <div className="space-y-1.5">
                    <h4 className="text-[13px] font-black ml-1 flex items-center gap-2" style={{ color: brand.dark }}>
                      <CreditCard className="w-3.5 h-3.5" style={{ color: brand.primary }} />
                      Notes & Financial Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
                      {/* Left: Notes & Bank Info */}
                      <div className="md:col-span-7 space-y-4">
                        {previewInvoice.notes && (
                          <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                            <TextArea label="Notes & Special Terms" readOnly value={previewInvoice.notes} className="!rounded-lg text-[11px] py-1.5 px-3 h-20" />
                          </Card>
                        )}
                        {previewInvoice.bankAccount && (
                          <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                            <Input variant="compact" label="Bank Payment Account" readOnly value={previewInvoice.bankAccount} />
                          </Card>
                        )}
                      </div>

                      {/* Right: Calculated Totals */}
                      <div className="md:col-span-5">
                        <Card className="p-4 space-y-2 text-[12px]" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                          {(() => {
                            const subtotal = previewInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0), 0);
                            const taxAmount = (subtotal * (previewInvoice.taxRate || 0)) / 100;
                            const discountVal = previewInvoice.discountAmount || (subtotal * (previewInvoice.discountPercentage || 0)) / 100;
                            const netPayable = subtotal + taxAmount - discountVal + (previewInvoice.shippingCharges || 0) + (previewInvoice.roundOff || 0);
                            const balanceDue = netPayable - (previewInvoice.receivedAmount || 0);

                            return (
                              <>
                                <div className="flex justify-between text-slate-500 font-normal">
                                  <span>Gross Subtotal</span>
                                  <span className="text-slate-800 font-normal">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {taxAmount > 0 && (
                                  <div className="flex justify-between items-center text-slate-500 font-normal">
                                    <div className="flex flex-col">
                                      <span>Tax</span>
                                      <span className="text-[10px] text-slate-400">Calculated ({previewInvoice.taxRate}%)</span>
                                    </div>
                                    <span className="text-green-600 font-normal">+{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                {discountVal > 0 && (
                                  <div className="flex justify-between text-slate-500 font-normal">
                                    <span>Discount</span>
                                    <span className="text-red-500 font-normal">-{discountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                {(previewInvoice.shippingCharges || 0) > 0 && (
                                  <div className="flex justify-between text-slate-500 font-normal">
                                    <span>Shipping Charges</span>
                                    <span className="text-slate-800 font-normal">+{previewInvoice.shippingCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                {(previewInvoice.roundOff || 0) !== 0 && (
                                  <div className="flex justify-between text-slate-500 font-normal">
                                    <span>Round Off</span>
                                    <span className="text-slate-800 font-normal">{(previewInvoice.roundOff || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                <div className="h-px bg-slate-100 my-1" />
                                <div className="flex justify-between font-bold text-[13px] py-1.5 border-t border-b border-slate-100" style={{ color: brand.dark }}>
                                  <span>Net Total (Rs.)</span>
                                  <span style={{ color: brand.primary }}>{netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {previewInvoice.receivedAmount > 0 && (
                                  <div className="flex justify-between text-green-600 font-normal">
                                    <span>Amount Received (Rs.)</span>
                                    <span>-{(previewInvoice.receivedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                )}
                                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex justify-between font-bold text-[13px] text-rose-600 mt-2">
                                  <span>Balance Due (Rs.)</span>
                                  <span>{balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </>
                            );
                          })()}
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-slate-50 flex-shrink-0" style={{ borderColor: brand.dark + '10' }}>
                <Button
                  onClick={() => setPreviewInvoice(null)}
                  variant="white"
                  size="md"
                >
                  Close Preview
                </Button>
                <div className="relative preview-print-dropdown-container">
                  <Button
                    onClick={() => setShowPreviewPrintDropdown(!showPreviewPrintDropdown)}
                    variant="primary"
                    size="md"
                    icon={Printer}
                  >
                    Print / PDF ▼
                  </Button>
                  <AnimatePresence>
                    {showPreviewPrintDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 bottom-full mb-1 z-[200] bg-white rounded-xl border p-2 w-48 shadow-lg"
                        style={{ borderColor: '#E2E8F0' }}
                      >
                        {getTemplatesForInvoice({
                          id: previewInvoice.invoiceNumber,
                          customer: previewInvoice.customerName,
                          customerInitials: previewInvoice.customerName.slice(0, 2).toUpperCase(),
                          customerColor: brand.primary,
                          issueDate: previewInvoice.date,
                          dueDate: previewInvoice.dueDate,
                          amount: '',
                          rawAmount: 0,
                          status: 'Unposted',
                          payment: 'Net 30',
                          type: previewInvoice.type
                        } as Invoice).map(t => (
                          <button
                            key={t.template_id}
                            onClick={() => {
                              const subtotal = previewInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0), 0);
                              const taxAmount = (subtotal * (previewInvoice.taxRate || 0)) / 100;
                              const discountVal = previewInvoice.discountAmount || (subtotal * (previewInvoice.discountPercentage || 0)) / 100;
                              const netPayable = subtotal + taxAmount - discountVal + (previewInvoice.shippingCharges || 0) + (previewInvoice.roundOff || 0);

                              const mapped: Invoice = {
                                id: previewInvoice.invoiceNumber,
                                customer: previewInvoice.customerName,
                                customerInitials: previewInvoice.customerName.slice(0, 2).toUpperCase(),
                                customerColor: brand.primary,
                                issueDate: previewInvoice.date,
                                dueDate: previewInvoice.dueDate,
                                amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                rawAmount: netPayable,
                                status: 'Unposted',
                                payment: 'Net 30',
                                type: previewInvoice.type
                              };
                              onPrintInvoice?.(mapped, t.template_id);
                              setShowPreviewPrintDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 text-brand-dark cursor-pointer border-none"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {t.template_name} ({t.paper_size})
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>

      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Filter Invoices"
        onReset={handleResetFilters}
        onApply={() => {
          setStatusFilter(tempStatusFilter);
          setTypeFilter(tempTypeFilter);
          setCustomerFilter(tempCustomerFilter);
          setSaleInvNoFilter(tempSaleInvNoFilter);
          setStartDate(tempStartDate);
          setEndDate(tempEndDate);
          setCurrentPage(1);
          setShowFilterDrawer(false);
        }}
      >
        <div className="space-y-4">
          <Select
            variant="compact"
            label="Business Partner"
            value={tempCustomerFilter}
            onChange={(e) => setTempCustomerFilter(e.target.value)}
            options={uniqueCustomers.map(c => ({ value: c, label: c === 'All' ? 'All Partners' : c }))}
          />

          <Input
            variant="compact"
            label="Sale Inv No"
            placeholder="Search by invoice number..."
            value={tempSaleInvNoFilter}
            onChange={(e) => setTempSaleInvNoFilter(e.target.value)}
          />

          <Select
            variant="compact"
            label="Status"
            value={tempStatusFilter}
            onChange={(e) => setTempStatusFilter(e.target.value as any)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Posted', label: 'Posted' },
              { value: 'Unposted', label: 'Unposted' },
            ]}
          />

          <Select
            variant="compact"
            label="Invoice Type"
            value={tempTypeFilter}
            onChange={(e) => setTempTypeFilter(e.target.value)}
            options={typeOptions.map(t => ({ value: t, label: t === 'All' ? 'All Types' : t }))}
          />

          <Input
            variant="compact"
            type="date"
            label="From Date"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
          />

          <Input
            variant="compact"
            type="date"
            label="To Date"
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
          />
        </div>
      </FilterDrawer>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Invoice?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and all associated invoice items and records will be permanently deleted."
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant || "warning"}
      />
    </div>
  );
};

export default InvoiceList;
