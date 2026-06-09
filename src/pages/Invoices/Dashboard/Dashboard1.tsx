import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Clock, AlertCircle,
  Search, Plus, Users, Box, BarChart3, Sparkles,
  ArrowRight, Edit
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import Card from '../../../components/ui/Card';
import { Input } from '../../../components/ui/FormControls';
import type { Invoice } from '../invoiceTypes';
import { AlertModal } from '../../../components/ui/AlertModal';

interface Dashboard1Props {
  invoiceItems?: Invoice[];
  onViewChange?: (view: string) => void;
}

const Dashboard1: React.FC<Dashboard1Props> = ({ invoiceItems = [], onViewChange }) => {
  const { brand } = useTheme();
  const [aiQuery, setAiQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  // Add Product form state
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productSku, setProductSku] = useState('');
  const [customProducts, setCustomProducts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('custom_products');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ── Data Calculations ──────────────────────────────────────────────────────
  const draftInvoices = invoiceItems.filter(inv => inv.status === 'Draft');
  const paidInvoices = invoiceItems.filter(inv => inv.status === 'Paid');
  const overdueInvoices = invoiceItems.filter(inv => inv.status === 'Overdue');
  const pendingInvoices = invoiceItems.filter(inv => inv.status === 'Pending');

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0)
    + overdueInvoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);

  const formatCurrency = (value: number) =>
    'Rs. ' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Filtered / Recent Invoices ─────────────────────────────────────────────
  const filteredInvoices = React.useMemo(() => {
    let list = [...invoiceItems];
    const q = aiQuery.toLowerCase().trim();
    if (q) {
      if (q.includes('overdue')) list = list.filter(i => i.status === 'Overdue');
      else if (q.includes('paid')) list = list.filter(i => i.status === 'Paid');
      else if (q.includes('pending') || q.includes('unpaid')) list = list.filter(i => i.status === 'Pending');
      else if (q.includes('draft')) list = list.filter(i => i.status === 'Draft');
      else list = list.filter(i =>
        i.customer.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.amount.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [invoiceItems, aiQuery]);

  const recentInvoices = filteredInvoices.slice(0, 4);

  // ── Save Product ───────────────────────────────────────────────────────────
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode || !productName || !productPrice) {
      setAlertModal({ isOpen: true, message: 'Please fill in all required fields: Product Code, Product Name, and Price.' });
      return;
    }
    const newProd = {
      id: productCode.toUpperCase(),
      name: productName,
      subtitle: 'SKU: ' + (productSku || 'SKU-GEN-' + Math.floor(1000 + Math.random() * 9000)) + ' · Rs. ' + parseFloat(productPrice).toFixed(2),
    };
    const updated = [...customProducts, newProd];
    setCustomProducts(updated);
    try { localStorage.setItem('custom_products', JSON.stringify(updated)); } catch { /* ignore */ }
    setProductCode(''); setProductName(''); setProductPrice(''); setProductSku('');
    setShowAddProductModal(false);
    setToastMessage('Product ' + newProd.id + ' saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Status color map ───────────────────────────────────────────────────────
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    Paid: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    Pending: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
    Overdue: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
    Draft: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20 relative font-sans" style={{ backgroundColor: brand.surface }}>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-slate-900 text-white text-[12px] font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">

        {/* Page Header with switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>
              Dashboard
            </h1>
            <p className="text-[12px] font-medium text-slate-400 mt-0.5">
              Here's your overview of your business sales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dashboard Version Switcher */}
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg border border-slate-200/30">
              {[
                { id: 'dashboard', label: 'Default' },
                { id: 'dashboard1', label: 'AI insights' },
                { id: 'dashboard2', label: 'Business overview' },
              ].map(t => {
                const isActive = t.id === 'dashboard1';
                return (
                  <button
                    key={t.id}
                    onClick={() => onViewChange?.(t.id)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-3" style={{ borderColor: brand.dark + '10' }}>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-slate-400">Paid</p>
                <p className="text-xl font-black text-slate-900">{paidInvoices.length}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3" style={{ borderColor: brand.dark + '10' }}>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-slate-400">Pending</p>
                <p className="text-xl font-black text-slate-900">{pendingInvoices.length}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3" style={{ borderColor: brand.dark + '10' }}>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-slate-400">Overdue</p>
                <p className="text-xl font-black text-rose-600">{overdueInvoices.length}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3" style={{ borderColor: brand.dark + '10' }}>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider text-slate-400">Draft</p>
                <p className="text-xl font-black text-slate-900">{draftInvoices.length}</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Revenue Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5" style={{ borderColor: brand.dark + '10' }}>
            <p className="text-[10px] font-black tracking-wider text-slate-400 mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black tracking-tight" style={{ color: brand.primary }}>{formatCurrency(totalRevenue)}</h3>
          </Card>
          <Card className="p-5" style={{ borderColor: brand.dark + '10' }}>
            <p className="text-[10px] font-black tracking-wider text-slate-400 mb-1">Pending Amount</p>
            <h3 className="text-3xl font-black text-amber-600 tracking-tight">{formatCurrency(pendingAmount)}</h3>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-black tracking-widest text-slate-400 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Create Invoice', icon: Plus, onClick: () => onViewChange?.('add-invoice-v4'), color: brand.primary, bg: 'bg-indigo-50' },
              { label: 'Add Customer', icon: Users, onClick: () => onViewChange?.('customers'), color: '#0EA5E9', bg: 'bg-sky-50' },
              { label: 'Add Product', icon: Box, onClick: () => setShowAddProductModal(true), color: '#F59E0B', bg: 'bg-amber-50' },
              { label: 'View Reports', icon: BarChart3, onClick: () => { setToastMessage('Reports & Analytics feature coming soon!'); setTimeout(() => setToastMessage(null), 3000); }, color: '#10B981', bg: 'bg-emerald-50' },
            ].map(action => (
              <motion.button
                key={action.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className="bg-white border rounded-xl p-4 text-left flex flex-col gap-2 transition-all group cursor-pointer"
                style={{ borderColor: brand.dark + '10' }}
              >
                <div className={'w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ' + action.bg}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-bold text-slate-900">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recent Invoices + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Invoices */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-widest text-slate-400">
                  {aiQuery ? 'Search Results' : 'Recent Invoices'}
                </h2>
                {aiQuery && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: brand.primary, backgroundColor: brand.surface }}>
                    {filteredInvoices.length} found
                  </span>
                )}
              </div>
              <button
                onClick={() => onViewChange?.('invoices')}
                className="text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                style={{ color: brand.primary }}
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentInvoices.length === 0 ? (
              <Card className="p-8 text-center flex flex-col items-center" style={{ borderColor: brand.dark + '10' }}>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No matching invoices found</h3>
                <p className="text-xs text-slate-500 max-w-[280px]">We couldn't find any invoices matching your search.</p>
                <button
                  onClick={() => setAiQuery('')}
                  className="mt-4 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  style={{ color: brand.primary, backgroundColor: brand.surface }}
                >
                  Clear Search
                </button>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map(inv => {
                  const c = statusColors[inv.status] || statusColors.Draft;
                  return (
                    <motion.div
                      key={inv.id}
                      whileHover={{ scale: 1.005 }}
                      className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer"
                      style={{ borderColor: brand.dark + '10' }}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{inv.customer}</h4>
                          <span className="text-xs font-medium text-slate-400">#{inv.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-base font-black text-slate-900">{inv.amount}</span>
                        <div className="px-3 py-1 rounded-lg border text-[11px] font-black" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                          {inv.status}
                        </div>
                        <button
                          onClick={() => onViewChange?.('edit-invoice-' + inv.id)}
                          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Insights */}
          <section>
            <h2 className="text-sm font-black tracking-widest text-slate-400 mb-4">Quick Insights</h2>
            <Card className="p-4 space-y-4" style={{ borderColor: brand.dark + '10' }}>
              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-3">Invoice Summary</h3>
                {[
                  { label: 'Total Invoices', value: String(invoiceItems.length) },
                  { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
                  { label: 'Pending Amount', value: formatCurrency(pendingAmount) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-md bg-slate-50 mb-2">
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    <span className="text-xs font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-3">Status Breakdown</h3>
                {[
                  { label: 'Paid', value: paidInvoices.length, color: '#15803D' },
                  { label: 'Pending', value: pendingInvoices.length, color: '#C2410C' },
                  { label: 'Overdue', value: overdueInvoices.length, color: '#BE123C' },
                  { label: 'Draft', value: draftInvoices.length, color: '#64748B' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-md bg-slate-50 mb-2">
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    <span className="text-xs font-black" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowAddProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-black text-slate-900 mb-4">Add New Product</h2>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                {[
                  { label: 'Product Code', value: productCode, setter: setProductCode, placeholder: 'e.g. PROD-001' },
                  { label: 'Product Name', value: productName, setter: setProductName, placeholder: 'e.g. Web Design Package' },
                  { label: 'Price (PKR)', value: productPrice, setter: setProductPrice, placeholder: 'e.g. 250.00' },
                  { label: 'SKU (Optional)', value: productSku, setter: setProductSku, placeholder: 'e.g. SKU-WDP-01' },
                ].map(f => (
                  <Input
                    key={f.label}
                    label={f.label}
                    type="text"
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    size="sm"
                  />
                ))}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-colors" style={{ backgroundColor: brand.primary }}>Save Product</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title="Required Fields Missing"
        message={alertModal.message}
        variant="warning"
      />

    </div>
  );
};

export default Dashboard1;
