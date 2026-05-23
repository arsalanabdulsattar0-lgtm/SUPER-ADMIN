import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, MoreVertical, Plus,
  FileText, CheckCircle, Clock, AlertCircle, TrendingUp,
  ArrowUpDown, Printer, Trash2, Edit3,
  ChevronLeft, ChevronRight, SlidersHorizontal, X
} from 'lucide-react';
import { ScrollArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import type { InvoiceData, InvoiceItem } from '../../types';

// ─── Data ────────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface Invoice {
  id: string; client: string; clientInitials: string; clientColor: string;
  issueDate: string; dueDate: string; amount: string; rawAmount: number;
  status: InvoiceStatus; payment: string; type: string;
}

export const initialInvoices: Invoice[] = [
  { id: 'SI-000248', client: 'BlueRitt Technologies Inc.', clientInitials: 'BT', clientColor: '#2759CD', issueDate: '2026-05-12', dueDate: '2026-06-12', amount: '$8,450.00', rawAmount: 8450, status: 'Draft', payment: 'Net 30', type: 'Service' },
  { id: 'SI-000247', client: 'Acme Corporation', clientInitials: 'AC', clientColor: '#10B981', issueDate: '2026-05-10', dueDate: '2026-05-25', amount: '$1,200.00', rawAmount: 1200, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000246', client: 'Global Solutions Ltd.', clientInitials: 'GS', clientColor: '#F59E0B', issueDate: '2026-05-08', dueDate: '2026-05-23', amount: '$3,500.00', rawAmount: 3500, status: 'Pending', payment: 'Net 15', type: 'Standard' },
  { id: 'SI-000245', client: 'Starlight Media Group', clientInitials: 'SM', clientColor: '#8B5CF6', issueDate: '2026-05-05', dueDate: '2026-05-20', amount: '$950.00', rawAmount: 950, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000244', client: 'Nexus Systems Corp.', clientInitials: 'NS', clientColor: '#EE4932', issueDate: '2026-05-01', dueDate: '2026-05-16', amount: '$12,000.00', rawAmount: 12000, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000243', client: 'Pinnacle Ventures', clientInitials: 'PV', clientColor: '#0EA5E9', issueDate: '2026-04-28', dueDate: '2026-05-13', amount: '$5,750.00', rawAmount: 5750, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000242', client: 'Apex Digital Studio', clientInitials: 'AD', clientColor: '#EC4899', issueDate: '2026-04-25', dueDate: '2026-05-10', amount: '$2,300.00', rawAmount: 2300, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000241', client: 'Quantum Analytics', clientInitials: 'QA', clientColor: '#14B8A6', issueDate: '2026-04-20', dueDate: '2026-05-05', amount: '$6,800.00', rawAmount: 6800, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000240', client: 'Vortex Enterprises', clientInitials: 'VE', clientColor: '#2563EB', issueDate: '2026-04-18', dueDate: '2026-05-03', amount: '$4,120.00', rawAmount: 4120, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000239', client: 'Horizon Media', clientInitials: 'HM', clientColor: '#7C3AED', issueDate: '2026-04-15', dueDate: '2026-04-30', amount: '$1,850.00', rawAmount: 1850, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000238', client: 'Titan Industrial', clientInitials: 'TI', clientColor: '#059669', issueDate: '2026-04-12', dueDate: '2026-05-12', amount: '$9,300.00', rawAmount: 9300, status: 'Draft', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000237', client: 'Nebula Software', clientInitials: 'NS', clientColor: '#DB2777', issueDate: '2026-04-10', dueDate: '2026-04-25', amount: '$5,200.00', rawAmount: 5200, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000236', client: 'Nova Creative', clientInitials: 'NC', clientColor: '#DC2626', issueDate: '2026-04-08', dueDate: '2026-04-23', amount: '$2,950.00', rawAmount: 2950, status: 'Overdue', payment: 'Overdue', type: 'Service' },
  { id: 'SI-000235', client: 'Alpha Logistics', clientInitials: 'AL', clientColor: '#D97706', issueDate: '2026-04-05', dueDate: '2026-04-20', amount: '$7,150.00', rawAmount: 7150, status: 'Paid', payment: 'Cleared', type: 'Standard' },
  { id: 'SI-000234', client: 'Spectra Design', clientInitials: 'SD', clientColor: '#4F46E5', issueDate: '2026-04-02', dueDate: '2026-04-17', amount: '$1,500.00', rawAmount: 1500, status: 'Pending', payment: 'Net 15', type: 'Product' },
  { id: 'SI-000233', client: 'Summit Partners', clientInitials: 'SP', clientColor: '#0891B2', issueDate: '2026-03-29', dueDate: '2026-04-29', amount: '$6,400.00', rawAmount: 6400, status: 'Paid', payment: 'Cleared', type: 'Standard' },
  { id: 'SI-000232', client: 'Infinity Group', clientInitials: 'IG', clientColor: '#EA580C', issueDate: '2026-03-26', dueDate: '2026-04-10', amount: '$3,250.00', rawAmount: 3250, status: 'Overdue', payment: 'Overdue', type: 'Product' },
  { id: 'SI-000231', client: 'Zenith Agency', clientInitials: 'ZA', clientColor: '#0D9488', issueDate: '2026-03-22', dueDate: '2026-04-06', amount: '$4,800.00', rawAmount: 4800, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000230', client: 'Catalyst Ventures', clientInitials: 'CV', clientColor: '#9333EA', issueDate: '2026-03-18', dueDate: '2026-04-18', amount: '$8,900.00', rawAmount: 8900, status: 'Draft', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000229', client: 'Omega Solutions', clientInitials: 'OS', clientColor: '#2563EB', issueDate: '2026-03-15', dueDate: '2026-03-30', amount: '$1,100.00', rawAmount: 1100, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000228', client: 'Delta Consulting', clientInitials: 'DC', clientColor: '#059669', issueDate: '2026-03-12', dueDate: '2026-03-27', amount: '$3,700.00', rawAmount: 3700, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000227', client: 'Echo Studios', clientInitials: 'ES', clientColor: '#E11D48', issueDate: '2026-03-09', dueDate: '2026-03-24', amount: '$2,400.00', rawAmount: 2400, status: 'Overdue', payment: 'Overdue', type: 'Service' },
  { id: 'SI-000226', client: 'Matrix Corp', clientInitials: 'MC', clientColor: '#4F46E5', issueDate: '2026-03-05', dueDate: '2026-04-05', amount: '$11,500.00', rawAmount: 11500, status: 'Pending', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000225', client: 'Cyber Security Inc', clientInitials: 'CS', clientColor: '#0891B2', issueDate: '2026-03-02', dueDate: '2026-03-17', amount: '$5,600.00', rawAmount: 5600, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000224', client: 'Pioneer Lab', clientInitials: 'PL', clientColor: '#D97706', issueDate: '2026-02-28', dueDate: '2026-03-15', amount: '$8,200.00', rawAmount: 8200, status: 'Draft', payment: 'Net 15', type: 'Standard' },
  { id: 'SI-000223', client: 'Solar Energy', clientInitials: 'SE', clientColor: '#10B981', issueDate: '2026-02-25', dueDate: '2026-03-27', amount: '$4,750.00', rawAmount: 4750, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000222', client: 'Lunar Interactive', clientInitials: 'LI', clientColor: '#8B5CF6', issueDate: '2026-02-20', dueDate: '2026-03-07', amount: '$1,900.00', rawAmount: 1900, status: 'Pending', payment: 'Net 15', type: 'Product' },
  { id: 'SI-000221', client: 'Vanguard Tech', clientInitials: 'VT', clientColor: '#EE4932', issueDate: '2026-02-15', dueDate: '2026-03-17', amount: '$10,200.00', rawAmount: 10200, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000220', client: 'Aurora Media', clientInitials: 'AM', clientColor: '#0EA5E9', issueDate: '2026-02-10', dueDate: '2026-02-25', amount: '$3,100.00', rawAmount: 3100, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000219', client: 'Quantum Crest', clientInitials: 'QC', clientColor: '#EC4899', issueDate: '2026-02-05', dueDate: '2026-02-20', amount: '$6,300.00', rawAmount: 6300, status: 'Pending', payment: 'Net 15', type: 'Standard' },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  Paid: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  Pending: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', icon: Clock },
  Overdue: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', icon: AlertCircle },
  Draft: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', icon: FileText },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = 'id' | 'client' | 'issueDate' | 'dueDate' | 'amount' | 'status' | 'type';
type SortDir = 'asc' | 'desc';

// ─── Component ────────────────────────────────────────────────────────────────
interface InvoiceListProps {
  onViewChange?: (view: 'dashboard' | 'invoices' | 'add-invoice' | 'add-invoice-v2' | 'add-invoice-v3' | 'add-invoice-v4' | 'clients' | 'settings' | 'help') => void;
  invoiceItems: Invoice[];
  setInvoiceItems: React.Dispatch<React.SetStateAction<Invoice[]>>;
  onPrintInvoice?: (inv: Invoice) => void;
  onEditInvoice?: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onViewChange, invoiceItems, setInvoiceItems, onPrintInvoice, onEditInvoice }) => {
  const { brand } = useTheme();

  // ─── Stats Cards Data ─────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Invoices', value: '248', sub: '+12 this month', icon: FileText, color: brand.primary, bg: brand.surface },
    { label: 'Paid', value: '186', sub: '75% collection', icon: CheckCircle, color: '#15803D', bg: '#F0FDF4' },
    { label: 'Pending', value: '42', sub: '$28,450 waiting', icon: Clock, color: '#C2410C', bg: '#FFF7ED' },
    { label: 'Total Revenue', value: '$142,800', sub: '+8.2% vs last mo', icon: TrendingUp, color: brand.primary, bg: brand.surface },
  ];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [openAction, setOpenAction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('issueDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  const perPage = 15;

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (filterRef.current && !filterRef.current.contains(target)) {
        setShowFilterPanel(false);
      }
      if (sortRef.current && !sortRef.current.contains(target)) {
        setShowSortPanel(false);
      }
      if (openAction && !target.closest('.action-menu-container')) {
        setOpenAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openAction]);

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
          clientName: inv.client,
          clientAddress: 'Enterprise Client Account',
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
          notes: `Please include the invoice number ${inv.id} in your wire transfer reference.`
        };
        setPreviewInvoice(fallback);
      }
    } catch {
      alert('Failed to load invoice preview!');
    }
  };

  const typeOptions = ['All', ...Array.from(new Set(invoiceItems.map(i => i.type)))];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortPanel(false);
  };

  const filtered = invoiceItems
    .filter(inv => {
      const matchSearch = inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.client.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      const matchType = typeFilter === 'All' || inv.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (sortKey === 'amount') { av = a.rawAmount; bv = b.rawAmount; }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const statusTabs: (InvoiceStatus | 'All')[] = ['All', 'Paid', 'Pending', 'Overdue', 'Draft'];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'client', label: 'Client Name' },
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
          <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>Invoice List</h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            {filtered.length} invoices found · Last updated just now
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="white" size="md" icon={Download}>
            Export
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
            className="bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all group cursor-default"
            style={{ borderColor: brand.dark + '10' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 tracking-wide">{stat.label}</p>
                <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>{stat.value}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border shadow-sm overflow-hidden"
        style={{ borderColor: brand.dark + '10' }}>

        {/* ── Solid Header Bar (reference image style) ── */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Invoice Records</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {filtered.length} Invoices
            </span>
          </div>

          {/* Search inside header bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search invoices or clients..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>

            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowFilterPanel(p => !p); setShowSortPanel(false); }}
                className={`border ${showFilterPanel ? 'bg-white/25 border-white/25' : 'bg-white/10 border-white/20'} text-white hover:bg-white/20`}
              >
                <SlidersHorizontal className="w-3 h-3 mr-1" /> Filter
                {(typeFilter !== 'All') && (
                  <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ml-1 text-white"
                    style={{ background: brand.accent }}>1</span>
                )}
              </Button>
              <AnimatePresence>
                {showFilterPanel && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-9 z-30 bg-white rounded-xl shadow-xl border p-4 w-56"
                    style={{ borderColor: brand.dark + '15' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: brand.dark + '60' }}>Filter by Type</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {typeOptions.map(t => (
                        <button key={t} onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all"
                          style={typeFilter === t
                            ? { background: brand.primary, color: '#fff', borderColor: brand.primary }
                            : { background: '#f8fafc', color: brand.dark, borderColor: brand.dark + '15' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {typeFilter !== 'All' && (
                      <Button onClick={() => setTypeFilter('All')}
                        variant="ghost"
                        size="xs"
                        fullWidth
                        className="text-red-500 hover:bg-red-50"
                        icon={X}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSortPanel(p => !p); setShowFilterPanel(false); }}
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

        {/* Status Filter Tabs */}
        <div className="px-4 py-2 border-b flex items-center justify-between"
          style={{ borderColor: brand.dark + '08', background: brand.surface + '40' }}>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: brand.surface }}>
            {statusTabs.map(tab => (
              <button key={tab}
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                className="relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors duration-200"
                style={{ color: statusFilter === tab ? '#fff' : brand.dark + 'aa', zIndex: 1 }}
              >
                {statusFilter === tab && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: brand.primary }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    initial={false}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] font-medium text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {typeFilter !== 'All' && <span className="ml-1 font-bold" style={{ color: brand.primary }}>· {typeFilter}</span>}
          </p>
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
            <ScrollArea className="w-full max-w-full" maxHeight="340px" style={{ overscrollBehavior: 'contain' }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
                    {([
                      { label: 'Invoice ID', key: 'id' },
                      { label: 'Client', key: 'client' },
                      { label: 'Issue Date', key: 'issueDate' },
                      { label: 'Due Date', key: 'dueDate' },
                      { label: 'Amount', key: 'amount' },
                      { label: 'Type', key: 'type' },
                      { label: 'Status', key: 'status' },
                      { label: 'Actions', key: null },
                    ] as { label: string; key: SortKey | null }[]).map((h, idx) => (
                      <th key={h.label}
                        className={`px-4 py-3 text-left border-b ${h.key ? 'cursor-pointer hover:bg-blue-50/40 select-none' : ''} transition-colors ${idx !== 0 ? 'border-l border-slate-100' : ''} ${h.key === 'client' ? 'w-[26%]' : ''} ${h.label === 'Actions' ? 'w-[11%] whitespace-nowrap' : ''}`}
                        style={{ borderColor: brand.dark + '10' }}
                        onClick={() => h.key && handleSort(h.key)}>
                        <span className="text-[10px] font-black tracking-widest uppercase"
                          style={{ color: sortKey === h.key ? brand.primary : brand.dark + '70' }}>
                          {h.label}
                          {h.key && <SortArrow col={h.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((inv, i) => {
                    const cfg = statusConfig[inv.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr key={inv.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30, delay: i * 0.04 }}
                        className="group border-b transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0"
                        style={{ borderColor: brand.dark + '08' }}
                      >
                        {/* Invoice ID */}
                        <td className="px-4 py-3 border-l border-slate-50 first:border-0">
                          <span className="text-[12px] font-black font-mono" style={{ color: brand.primary }}>
                            {inv.id}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3 border-l border-slate-50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                              style={{ background: inv.clientColor }}>
                              {inv.clientInitials}
                            </div>
                            <span className="text-[12px] font-bold truncate max-w-[150px]" style={{ color: brand.dark }}>
                              {inv.client}
                            </span>
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="px-4 py-3 border-l border-slate-50">
                          <span className="text-[12px] font-medium text-slate-500">{inv.issueDate}</span>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-3 border-l border-slate-50">
                          <span className="text-[12px] font-medium"
                            style={{ color: inv.status === 'Overdue' ? '#BE123C' : 'rgb(100 116 139)' }}>
                            {inv.dueDate}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 border-l border-slate-50">
                          <span className="text-[13px] font-black" style={{ color: brand.dark }}>{inv.amount}</span>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 border-l border-slate-50">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: brand.soft + '40', color: brand.primary }}>
                            {inv.type}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 border-l border-slate-50">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit border"
                            style={{ background: cfg.bg, borderColor: cfg.border }}>
                            <StatusIcon className="w-3 h-3" style={{ color: cfg.text }} />
                            <span className="text-[10px] font-black tracking-wide" style={{ color: cfg.text }}>
                              {inv.status}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-2 py-3 border-l border-slate-50">
                          <div className="flex items-center gap-0">
                            <Button onClick={() => handleOpenPreview(inv)}
                              variant="ghost" size="xs" icon={Eye} title="View"
                              className="!px-1 text-blue-600 hover:bg-blue-50" />
                            <Button onClick={() => onEditInvoice?.(inv.id)}
                              variant="ghost" size="xs" icon={Edit3} title="Edit"
                              className="!px-1 text-blue-600 hover:bg-blue-50" />
                            <Button onClick={() => onPrintInvoice?.(inv)}
                              variant="ghost" size="xs" icon={Printer} title="Print"
                              className="!px-1 text-blue-600 hover:bg-blue-50" />
                            <div className="relative action-menu-container">
                              <Button
                                onClick={(e) => { e.stopPropagation(); setOpenAction(openAction === inv.id ? null : inv.id); }}
                                variant="ghost" size="xs" icon={MoreVertical}
                                className="!px-0 text-slate-400 hover:bg-slate-100" />
                              <AnimatePresence>
                                {openAction === inv.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                    className="absolute right-0 top-8 z-20 bg-white border rounded-xl shadow-xl overflow-hidden w-36"
                                    style={{ borderColor: brand.dark + '10' }}>
                                    {[
                                      { icon: Download, label: 'Download PDF', color: brand.dark },
                                      { icon: Trash2, label: 'Delete', color: '#EE4932' },
                                    ].map(item => (
                                      <Button key={item.label}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (item.label === 'View Details') handleOpenPreview(inv);
                                          if (item.label === 'Download PDF') onPrintInvoice?.(inv);
                                          if (item.label === 'Delete') {
                                            setInvoiceItems(prev => prev.filter(x => x.id !== inv.id));
                                          }
                                          setOpenAction(null);
                                        }}
                                        variant="ghost" size="sm" icon={item.icon}
                                        className="w-full justify-start hover:bg-slate-50 rounded-none px-3 font-bold"
                                        style={{ color: item.color }}
                                      >
                                        {item.label}
                                      </Button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}

                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                        <p className="text-[13px] font-bold text-slate-400">No invoices found</p>
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
            <p className="text-[11px] font-medium text-slate-400">
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
        {previewInvoice && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]"
              style={{ borderColor: brand.dark + '10' }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50" style={{ borderColor: brand.dark + '08' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Invoice Review</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: brand.primary }}>
                      {previewInvoice.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1">Invoice ID: {previewInvoice.invoiceNumber}</h3>
                </div>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <ScrollArea className="flex-1 p-8 overflow-y-auto" maxHeight="calc(90vh - 140px)">
                <div className="space-y-8">
                  {/* Biller & Client info in two columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b" style={{ borderColor: brand.dark + '08' }}>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From</h4>
                      <p className="text-xs font-black text-slate-900">{previewInvoice.senderName || 'Antigravity Creative Studio'}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed whitespace-pre-line">
                        {previewInvoice.senderAddress || '452 Innovation Blvd, San Francisco, CA 94107'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bill To</h4>
                      <p className="text-xs font-black text-slate-900">{previewInvoice.clientName}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed whitespace-pre-line">
                        {previewInvoice.clientAddress || 'Enterprise Client'}
                      </p>
                    </div>
                  </div>

                  {/* Date, Subject, Reference Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b" style={{ borderColor: brand.dark + '08' }}>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Issue Date</h4>
                      <p className="text-xs font-bold text-slate-800 mt-1">{previewInvoice.date}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Due Date</h4>
                      <p className="text-xs font-bold text-slate-800 mt-1">{previewInvoice.dueDate}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Subject</h4>
                      <p className="text-xs font-bold text-slate-800 mt-1 truncate">{previewInvoice.subject || 'Services Rendered'}</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Reference</h4>
                      <p className="text-xs font-bold text-slate-800 mt-1">{previewInvoice.reference || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Items List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b" style={{ borderColor: brand.dark + '10' }}>
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4 w-[40%]">Description</th>
                          <th className="py-3 px-4 text-right">Unit</th>
                          <th className="py-3 px-4 text-right">Qty</th>
                          <th className="py-3 px-4 text-right">Rate</th>
                          <th className="py-3 px-4 text-right">Tax</th>
                          <th className="py-3 px-4 text-right">Discount</th>
                          <th className="py-3 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewInvoice.items.map((item: InvoiceItem, idx: number) => {
                          const itemTotal = (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0);
                          return (
                            <tr key={idx} className="border-b text-xs text-slate-700" style={{ borderColor: brand.dark + '06' }}>
                              <td className="py-3.5 px-4 font-bold text-slate-900">{item.productCode || 'BC-001'}</td>
                              <td className="py-3.5 px-4 font-medium leading-relaxed">{item.description}</td>
                              <td className="py-3.5 px-4 text-right font-medium text-slate-500">{item.unit || 'Job'}</td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-900">{item.quantity}</td>
                              <td className="py-3.5 px-4 text-right font-medium text-slate-500">${item.price.toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-right font-medium text-green-600">+${(item.tax + (item.furtherTax || 0)).toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-right font-medium text-red-500">-${item.discount.toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-900">${itemTotal.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Totals Breakdown & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
                    {/* Left: Notes & Bank Info */}
                    <div className="md:col-span-7 space-y-4">
                      {previewInvoice.notes && (
                        <div className="p-4 bg-slate-50 rounded-2xl border" style={{ borderColor: brand.dark + '08' }}>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Terms & Remarks</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">{previewInvoice.notes}</p>
                        </div>
                      )}
                      {previewInvoice.bankAccount && (
                        <div className="p-4 bg-slate-50 rounded-2xl border" style={{ borderColor: brand.dark + '08' }}>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Bank Payment Account</h5>
                          <p className="text-[11px] font-bold text-slate-700">{previewInvoice.bankAccount}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Calculated Totals */}
                    <div className="md:col-span-5 space-y-2 text-xs">
                      {(() => {
                        const subtotal = previewInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0), 0);
                        const taxAmount = (subtotal * (previewInvoice.taxRate || 0)) / 100;
                        const discountVal = previewInvoice.discountAmount || (subtotal * (previewInvoice.discountPercentage || 0)) / 100;
                        const netPayable = subtotal + taxAmount - discountVal + (previewInvoice.shippingCharges || 0) + (previewInvoice.roundOff || 0);
                        const balanceDue = netPayable - (previewInvoice.receivedAmount || 0);

                        return (
                          <>
                            <div className="flex justify-between text-slate-500 font-medium">
                              <span>Subtotal</span>
                              <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {taxAmount > 0 && (
                              <div className="flex justify-between text-slate-500 font-medium">
                                <span>Global Tax ({previewInvoice.taxRate}%)</span>
                                <span className="text-green-600">+${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {discountVal > 0 && (
                              <div className="flex justify-between text-slate-500 font-medium">
                                <span>Global Discount</span>
                                <span className="text-red-500">-${discountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {(previewInvoice.shippingCharges || 0) > 0 && (
                              <div className="flex justify-between text-slate-500 font-medium">
                                <span>Shipping Charges</span>
                                <span>+${previewInvoice.shippingCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="h-px bg-slate-100 my-1" />
                            <div className="flex justify-between font-black text-sm" style={{ color: brand.dark }}>
                              <span>Net Payable</span>
                              <span>${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-bold">
                              <span>Amount Received</span>
                              <span>-${(previewInvoice.receivedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="p-3 bg-red-50 rounded-2xl flex justify-between font-black text-sm text-red-600 mt-2">
                              <span>Balance Due</span>
                              <span>${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3" style={{ borderColor: brand.dark + '08' }}>
                <Button
                  onClick={() => setPreviewInvoice(null)}
                  variant="white"
                  size="md"
                >
                  Close Preview
                </Button>
                <Button
                  onClick={() => {
                    const mapped: Invoice = {
                      id: previewInvoice.invoiceNumber,
                      client: previewInvoice.clientName,
                      clientInitials: previewInvoice.clientName.slice(0, 2).toUpperCase(),
                      clientColor: brand.primary,
                      issueDate: previewInvoice.date,
                      dueDate: previewInvoice.dueDate,
                      amount: `$${(previewInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.price), 0)).toLocaleString()}`,
                      rawAmount: previewInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.price), 0),
                      status: 'Pending',
                      payment: 'Net 30',
                      type: previewInvoice.type
                    };
                    onPrintInvoice?.(mapped);
                  }}
                  variant="primary"
                  size="md"
                  icon={Printer}
                >
                  Print / PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceList;
