import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, MoreVertical, Plus,
  FileText, CheckCircle, Clock, AlertCircle, TrendingUp,
  ArrowUpDown, Printer, Trash2, Edit3,
  ChevronLeft, ChevronRight, SlidersHorizontal, X
} from 'lucide-react';
import { Input } from '../../components/ui/FormControls';

// ─── Brand ───────────────────────────────────────────────────────────────────
const brand = {
  primary:  '#2759CD',
  dark:     '#304166',
  accent:   '#EE4932',
  soft:     '#BDD1FF',
  surface:  '#EFF5FC',
  white:    '#FFFFFF',
};

// ─── Data ────────────────────────────────────────────────────────────────────
type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

interface Invoice {
  id: string; client: string; clientInitials: string; clientColor: string;
  issueDate: string; dueDate: string; amount: string; rawAmount: number;
  status: InvoiceStatus; payment: string; type: string;
}

const invoices: Invoice[] = [
  { id: 'SI-000248', client: 'BlueRitt Technologies Inc.', clientInitials: 'BT', clientColor: '#2759CD', issueDate: '2026-05-12', dueDate: '2026-06-12', amount: '$8,450.00',  rawAmount: 8450,  status: 'Draft',   payment: 'Net 30',  type: 'Service'  },
  { id: 'SI-000247', client: 'Acme Corporation',           clientInitials: 'AC', clientColor: '#10B981', issueDate: '2026-05-10', dueDate: '2026-05-25', amount: '$1,200.00',  rawAmount: 1200,  status: 'Paid',    payment: 'Cleared', type: 'Product'  },
  { id: 'SI-000246', client: 'Global Solutions Ltd.',      clientInitials: 'GS', clientColor: '#F59E0B', issueDate: '2026-05-08', dueDate: '2026-05-23', amount: '$3,500.00',  rawAmount: 3500,  status: 'Pending', payment: 'Net 15',  type: 'Standard' },
  { id: 'SI-000245', client: 'Starlight Media Group',      clientInitials: 'SM', clientColor: '#8B5CF6', issueDate: '2026-05-05', dueDate: '2026-05-20', amount: '$950.00',   rawAmount: 950,   status: 'Paid',    payment: 'Cleared', type: 'Service'  },
  { id: 'SI-000244', client: 'Nexus Systems Corp.',        clientInitials: 'NS', clientColor: '#EE4932', issueDate: '2026-05-01', dueDate: '2026-05-16', amount: '$12,000.00', rawAmount: 12000, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000243', client: 'Pinnacle Ventures',          clientInitials: 'PV', clientColor: '#0EA5E9', issueDate: '2026-04-28', dueDate: '2026-05-13', amount: '$5,750.00',  rawAmount: 5750,  status: 'Paid',    payment: 'Cleared', type: 'Product'  },
  { id: 'SI-000242', client: 'Apex Digital Studio',        clientInitials: 'AD', clientColor: '#EC4899', issueDate: '2026-04-25', dueDate: '2026-05-10', amount: '$2,300.00',  rawAmount: 2300,  status: 'Pending', payment: 'Net 15',  type: 'Service'  },
  { id: 'SI-000241', client: 'Quantum Analytics',          clientInitials: 'QA', clientColor: '#14B8A6', issueDate: '2026-04-20', dueDate: '2026-05-05', amount: '$6,800.00',  rawAmount: 6800,  status: 'Overdue', payment: 'Overdue', type: 'Standard' },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  Paid:    { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  Pending: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', icon: Clock       },
  Overdue: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', icon: AlertCircle },
  Draft:   { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', icon: FileText    },
};

// ─── Stats Cards Data ─────────────────────────────────────────────────────────
const stats = [
  { label: 'Total Invoices', value: '248',       sub: '+12 this month',  icon: FileText,    color: brand.primary, bg: '#EFF5FC' },
  { label: 'Paid',           value: '186',       sub: '75% collection',  icon: CheckCircle, color: '#15803D',     bg: '#F0FDF4' },
  { label: 'Pending',        value: '42',        sub: '$28,450 waiting', icon: Clock,       color: '#C2410C',     bg: '#FFF7ED' },
  { label: 'Total Revenue',  value: '$142,800',  sub: '+8.2% vs last mo',icon: TrendingUp,  color: brand.primary, bg: '#EFF5FC' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const InvoiceList: React.FC = () => {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [openAction, setOpenAction]     = useState<string | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const perPage = 6;

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.id.toLowerCase().includes(search.toLowerCase()) ||
                        inv.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const statusTabs: (InvoiceStatus | 'All')[] = ['All', 'Paid', 'Pending', 'Overdue', 'Draft'];

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
          <button className="h-9 px-4 flex items-center gap-2 bg-white border rounded-xl text-[12px] font-bold transition-all hover:bg-slate-50 shadow-sm"
            style={{ color: brand.dark, borderColor: brand.dark + '15' }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="h-9 px-5 flex items-center gap-2 rounded-xl text-[12px] font-bold text-white shadow-lg transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${brand.primary}, #1a45b0)` }}>
            <Plus className="w-3.5 h-3.5" /> Create Invoice
          </button>
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
        style={{ borderColor: brand.dark + '10', minHeight: '480px' }}>

        {/* Table Top Bar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
          style={{ borderColor: brand.dark + '08' }}>

          {/* Search */}
          <div className="w-full sm:w-72">
            <Input
              variant="compact"
              icon={Search}
              placeholder="Search invoices or clients..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              suffix={search ? (
                <button onClick={() => setSearch('')} className="flex items-center">
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              ) : undefined}
            />
          </div>

          {/* Status Tabs */}
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

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 flex items-center gap-1.5 rounded-xl text-[11px] font-bold border transition-all hover:bg-slate-50"
              style={{ color: brand.dark, borderColor: brand.dark + '15' }}>
              <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 rounded-xl text-[11px] font-bold border transition-all hover:bg-slate-50"
              style={{ color: brand.dark, borderColor: brand.dark + '15' }}>
              <ArrowUpDown className="w-3 h-3" /> Sort
            </button>
          </div>
        </div>

        {/* Table */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${statusFilter}-${currentPage}-${search}`}
            className="overflow-x-auto"
            style={{ minHeight: '280px' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
          <table className="w-full">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${brand.dark}08, ${brand.primary}08)` }}>
                {['Invoice ID', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left">
                    <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: brand.dark + '80' }}>{h}</span>
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
                      className="group border-b transition-colors hover:bg-blue-50/40 cursor-pointer"
                      style={{ borderColor: brand.dark + '06' }}
                    >
                      {/* Invoice ID */}
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-black font-mono" style={{ color: brand.primary }}>
                          {inv.id}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3.5">
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
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-medium text-slate-500">{inv.issueDate}</span>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-medium" style={{
                          color: inv.status === 'Overdue' ? '#BE123C' : 'rgb(100 116 139)'
                        }}>{inv.dueDate}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-black" style={{ color: brand.dark }}>{inv.amount}</span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                          style={{ background: brand.soft + '40', color: brand.primary }}>
                          {inv.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit border"
                          style={{ background: cfg.bg, borderColor: cfg.border }}>
                          <StatusIcon className="w-3 h-3" style={{ color: cfg.text }} />
                          <span className="text-[10px] font-black tracking-wide" style={{ color: cfg.text }}>
                            {inv.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg transition-all hover:bg-blue-50"
                            title="View" style={{ color: brand.primary }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg transition-all hover:bg-blue-50"
                            title="Edit" style={{ color: brand.primary }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg transition-all hover:bg-blue-50"
                            title="Download" style={{ color: brand.primary }}>
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenAction(openAction === inv.id ? null : inv.id)}
                              className="p-1.5 rounded-lg transition-all hover:bg-slate-100 text-slate-400">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            <AnimatePresence>
                              {openAction === inv.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                  className="absolute right-0 top-8 z-20 bg-white border rounded-xl shadow-xl overflow-hidden w-36"
                                  style={{ borderColor: brand.dark + '10' }}
                                >
                                  {[
                                    { icon: Eye,      label: 'View Details', color: brand.primary },
                                    { icon: Download, label: 'Download PDF', color: brand.dark    },
                                    { icon: Trash2,   label: 'Delete',       color: '#EE4932'     },
                                  ].map(item => (
                                    <button key={item.label}
                                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-bold hover:bg-slate-50 transition-all"
                                      style={{ color: item.color }}>
                                      <item.icon className="w-3.5 h-3.5" />
                                      {item.label}
                                    </button>
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
                      <p className="text-[11px] text-slate-300 mt-1">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all disabled:opacity-40 hover:bg-white"
                style={{ borderColor: brand.dark + '12', color: brand.dark }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all"
                  style={currentPage === p
                    ? { background: brand.primary, color: '#fff' }
                    : { color: brand.dark + 'aa', borderColor: brand.dark + '12' }
                  }>
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all disabled:opacity-40 hover:bg-white"
                style={{ borderColor: brand.dark + '12', color: brand.dark }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Click outside to close dropdown */}
      {openAction && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenAction(null)} />
      )}
    </div>
  );
};

export default InvoiceList;
