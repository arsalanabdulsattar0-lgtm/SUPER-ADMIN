import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvoiceData, InvoiceItem } from '../../types';
import {
  Plus,
  Trash2,
  History,
  Save,
  Zap,
  Paperclip,
  Upload,
  Search,
  Check,
  FileText,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  FileEdit,
  ArrowRight,
  Package,
  Printer
} from 'lucide-react';
import { Input, TextArea, Select, ComboBox, ScrollArea } from '../../components/ui/FormControls';

// Sample data for the ComboBoxes
const sampleCustomers = [
  { id: '1', name: 'Arsalan Abdul Sattar', subtitle: 'Premium Client · Karachi, PK', strn: 'STRN-042-2024', ntn: '1234567-8', creditLimit: 500000, balance: 125000, status: 'active' },
  { id: '2', name: 'Google DeepMind', subtitle: 'Enterprise · London, UK', strn: 'STRN-UK-9821', ntn: '9876543-1', creditLimit: 2000000, balance: 0, status: 'active' },
  { id: '3', name: 'Al-Madina Traders', subtitle: 'Wholesale · Lahore, PK', strn: 'STRN-LHR-3310', ntn: '4561237-5', creditLimit: 150000, balance: 89000, status: 'overdue' },
  { id: '4', name: 'TechFlow Solutions', subtitle: 'SaaS · Dubai, UAE', strn: 'STRN-UAE-7821', ntn: '7894561-2', creditLimit: 750000, balance: 210000, status: 'active' },
  { id: '5', name: 'Vertex Systems', subtitle: 'Hardware · Tokyo, JP', strn: 'STRN-JP-0011', ntn: '3214569-9', creditLimit: 300000, balance: 0, status: 'inactive' },
  { id: '6', name: 'Blue Horizon Inc', subtitle: 'Logistics · Berlin, DE', strn: 'STRN-DE-5544', ntn: '6547893-4', creditLimit: 400000, balance: 55000, status: 'active' },
  { id: '7', name: 'Nova Dynamics', subtitle: 'R&D · Toronto, CA', strn: 'STRN-CA-2298', ntn: '8523697-6', creditLimit: 600000, balance: 320000, status: 'overdue' },
  { id: '8', name: 'Quantum Core', subtitle: 'Cybersecurity · Singapore', strn: 'STRN-SG-8812', ntn: '1597534-0', creditLimit: 1000000, balance: 0, status: 'active' },
];

const sampleProducts = [
  { id: 'P001', name: 'Logic Board Pro v4', subtitle: 'SKU: LB-V4-001 · $450.00' },
  { id: 'P002', name: 'Wireless Mesh Node', subtitle: 'SKU: WMN-2024 · $120.00' },
  { id: 'P003', name: 'Thermal Paste XG', subtitle: 'SKU: TP-XG-01 · $15.00' },
  { id: 'P004', name: 'Fiber Patch Cord', subtitle: 'SKU: FPC-OS2-1M · $8.00' },
  { id: 'P005', name: 'Core Processor i9', subtitle: 'SKU: CP-I9-14G · $599.00' },
  { id: 'P006', name: 'High-Speed RAM 32GB', subtitle: 'SKU: RAM-DDR5-32 · $110.00' },
  { id: 'P007', name: 'NVMe SSD 2TB', subtitle: 'SKU: SSD-NVME-2TB · $180.00' },
  { id: 'P010', name: 'Chassis Airflow ATX', subtitle: 'SKU: CASE-ATX-AF · $95.00' },
];

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

type PaymentStatus = 'draft' | 'pending' | 'paid' | 'overdue';

const statusConfig: Record<PaymentStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  draft: { label: 'Draft', icon: FileEdit, bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
  pending: { label: 'Pending', icon: Clock, bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  paid: { label: 'Paid', icon: CheckCircle, bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  overdue: { label: 'Overdue', icon: AlertCircle, bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
};

const InvoiceEditorV4: React.FC<Props> = ({ data, onChange }) => {
  const brand = {
    primary: '#2759CD',
    dark: '#304166',
    accent: '#EE4932',
    soft: '#BDD1FF',
    surface: '#EFF5FC',
    white: '#FFFFFF',
  };

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [files, setFiles] = useState([
    { name: 'project_brief.pdf', size: '1.2 MB' },
    { name: 'logo_assets.zip', size: '4.5 MB' },
  ]);

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const selectedCustomer = sampleCustomers.find(c => c.id === selectedCustomerId) || null;

  const addItem = () => {
    const id = crypto.randomUUID();
    const newItem: InvoiceItem = {
      id,
      productCode: '',
      description: '',
      unit: '',
      unitDetails: '',
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      furtherTax: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
    setLastAddedId(id);

    // Auto-scroll to bottom after state update
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const removeItem = (id: string) =>
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });

  const updateItem = (id: string, updates: Partial<InvoiceItem>) =>
    onChange({ ...data, items: data.items.map((item) => (item.id === id ? { ...item, ...updates } : item)) });

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
  const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const currencySymbol = '$';

  const status = statusConfig[paymentStatus];
  const StatusIcon = status.icon;

  const filteredItems = data.items.filter(item =>
    item.description.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-4 h-4" style={{ color: '#EF4444' }} />;
    if (ext === 'zip' || ext === 'rar') return <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />;
    return <FileText className="w-4 h-4" style={{ color: brand.primary }} />;
  };

  // Section header helper
  const SectionHeader = ({ title, badge }: { title: string; badge?: string }) => (
    <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
      <h3 className="text-[11px] font-bold">{title}</h3>
      {badge && <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold">{badge}</div>}
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:px-8 lg:py-8 font-sans [&_input]:shadow-none [&_select]:shadow-none [&_textarea]:shadow-none" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-[11px] mb-1" style={{ color: brand.primary }}>
              <Zap className="w-3 h-3 fill-current" />
              <span>System V4.0</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-4" style={{ color: brand.dark }}>
              invoice node
              <span className="h-5 w-[1px]" style={{ backgroundColor: brand.dark + '20' }} />
              <span className="font-medium text-base opacity-40">#{data.invoiceNumber}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Payment Status Badge — interactive */}
            <div className="flex items-center gap-1 rounded-xl border px-3 py-1.5" style={{ backgroundColor: status.bg, borderColor: status.border }}>
              <StatusIcon className="w-3.5 h-3.5" style={{ color: status.text }} />
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="text-[10px] font-bold bg-transparent border-none outline-none cursor-pointer"
                style={{ color: status.text }}
              >
                {(Object.keys(statusConfig) as PaymentStatus[]).map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>

            <button className="h-9 px-6 text-white font-bold rounded-lg text-[11px] shadow-lg transition-all flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: brand.primary }}>
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* ── General Information + Client Profile (Side-by-Side Cards) ── */}
          <div className="flex gap-4 items-stretch">

            {/* Left Column: General Information */}
            <div className="flex-1 bg-white rounded-xl border shadow-sm relative z-40" style={{ borderColor: brand.dark + '10' }}>
              <SectionHeader title="General Information" badge="Identity Layer" className="rounded-t-xl" />
              <div className="p-4 space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-6">
                    <ComboBox
                      variant="compact"
                      label="Customer Entity"
                      placeholder="Search client..."
                      value={selectedCustomerId}
                      options={sampleCustomers}
                      onChange={(id) => {
                        setSelectedCustomerId(id);
                        const client = sampleCustomers.find(c => c.id === id);
                        if (client) onChange({ ...data, clientName: client.name });
                      }}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Issue Date" type="date" value={data.date}
                      onChange={(e) => onChange({ ...data, date: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Invoice ID" className="font-mono" style={{ color: brand.primary }}
                      value={data.invoiceNumber} onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Reference" placeholder="PO-2026-004" value={data.reference}
                      onChange={(e) => onChange({ ...data, reference: e.target.value })} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-6">
                    <Input variant="compact" label="Customer Address" placeholder="Street, City, Country..." value={data.clientAddress || ''}
                      onChange={(e) => onChange({ ...data, clientAddress: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Due Date" type="date" value={data.dueDate}
                      onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <Select
                      variant="compact"
                      label="Invoice Type"
                      value={data.type || 'Standard'}
                      onChange={(e) => onChange({ ...data, type: e.target.value })}
                      options={[
                        { value: 'Standard', label: 'Standard Invoice' },
                        { value: 'Service', label: 'Service Invoice' },
                        { value: 'Product', label: 'Product Sale' },
                        { value: 'Subscription', label: 'Subscription' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Independent Client Profile Card */}
            <AnimatePresence mode="wait">
              {selectedCustomer ? (
                <motion.div
                  key={selectedCustomer.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-[240px] shrink-0 bg-white rounded-xl border shadow-md overflow-hidden"
                  style={{ borderColor: brand.primary + '30' }}
                >
                  {/* Header */}
                  <div className="px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: brand.primary }}>
                    <span className="text-[10px] font-black text-white tracking-widest">CLIENT PROFILE</span>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${selectedCustomer.status === 'active' ? 'bg-emerald-400/30 text-emerald-100' :
                      selectedCustomer.status === 'overdue' ? 'bg-red-400/30 text-red-100' :
                        'bg-slate-400/30 text-slate-100'
                      }`}>{selectedCustomer.status}</div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 bg-gradient-to-b from-[#EFF5FC]/60 to-white">
                    {[
                      { label: 'NTN', value: selectedCustomer.ntn },
                      { label: 'STRN', value: selectedCustomer.strn },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</span>
                        <span className="text-[10px] font-black font-mono text-slate-700">{row.value}</span>
                      </div>
                    ))}

                    <div className="h-[1px] bg-slate-200/60 my-1" />

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Credit Limit</span>
                      <span className="text-[11px] font-black" style={{ color: brand.primary }}>PKR {selectedCustomer.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Balance</span>
                      <span className={`text-[11px] font-black ${selectedCustomer.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {selectedCustomer.balance > 0 ? `PKR ${selectedCustomer.balance.toLocaleString()}` : 'Clear'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-[240px] shrink-0 bg-white rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 py-10 shadow-sm"
                  style={{ borderColor: brand.dark + '15' }}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-200" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-widest leading-relaxed">
                    Select customer<br />to view profile
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Scanner Bar (Reusable ComboBox) ── */}
          <div className="relative z-30">
            <div className="w-[35%]">
              <ComboBox
                variant="default"
                className="!bg-white shadow-sm"
                placeholder="Product Code / Barcode"
                value=""
                icon={Search}
                options={sampleProducts}
                onChange={(id) => {
                  const prod = sampleProducts.find(p => p.id === id);
                  if (prod) {
                    const newItem: InvoiceItem = {
                      id: Math.random().toString(36).substr(2, 9),
                      productCode: prod.id,
                      description: prod.name,
                      unit: 'pcs',
                      unitDetails: prod.subtitle || '',
                      quantity: 1,
                      price: parseFloat(prod.subtitle?.split('$')[1] || '0'),
                      discount: 0,
                      tax: 0,
                      furtherTax: 0,
                    };
                    onChange({ ...data, items: [...data.items, newItem] });
                  }
                }}
              />
            </div>
          </div>

          {/* ── Transaction Entries ── */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <h3 className="text-[11px] font-bold">Transaction Entries</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
                  {filteredItems.length} Items
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64">
                  <ComboBox
                    variant="compact"
                    placeholder="Global product search..."
                    value=""
                    options={sampleProducts}
                    onChange={(id) => {
                      const prod = sampleProducts.find(p => p.id === id);
                      if (prod) {
                        const newId = crypto.randomUUID();
                        onChange({
                          ...data,
                          items: [...data.items, {
                            id: newId,
                            productCode: prod.id,
                            description: prod.name,
                            unit: 'pcs',
                            unitDetails: 'Standard',
                            quantity: 1,
                            price: 450,
                            discount: 0,
                            tax: 0,
                            furtherTax: 0
                          }]
                        });
                        setLastAddedId(newId);
                      }
                    }}
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </div>
                <button onClick={addItem}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white font-bold rounded-lg hover:bg-slate-50 transition-all text-[11px] shrink-0"
                  style={{ color: brand.primary }}>
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>
            </div>

            <ScrollArea
              maxHeight="320px"
              className="overflow-x-auto"
              ref={scrollContainerRef}
              style={{ overscrollBehavior: 'contain' }}
            >
              <table className="w-full relative">
                <thead className="sticky top-0 bg-white z-20 shadow-sm">
                  <tr className="text-[10px] font-black tracking-wider border-b" style={{ color: brand.dark, borderColor: brand.dark + '10' }}>
                    <th className="px-3 py-4 text-left w-10">#</th>
                    <th className="px-3 py-4 text-left w-52 border-l border-slate-100">Product Code</th>
                    <th className="px-3 py-4 text-left w-52 border-l border-slate-100">Description</th>
                    <th className="px-3 py-4 text-left w-16 border-l border-slate-100">Unit</th>
                    <th className="px-3 py-4 text-left w-24 border-l border-slate-100">Details</th>
                    <th className="px-3 py-4 text-left w-16 border-l border-slate-100">Qty</th>
                    <th className="px-3 py-4 text-left w-24 border-l border-slate-100">Price</th>
                    <th className="px-3 py-4 text-left w-24 border-l border-slate-100">Discount</th>
                    <th className="px-3 py-4 text-left w-24 border-l border-slate-100">Tax</th>
                    <th className="px-3 py-4 text-left w-24 border-l border-slate-100">Further Tax</th>
                    <th className="px-4 py-4 text-left w-24 border-l border-slate-100">Total</th>
                    <th className="px-3 py-4 w-10 border-l border-slate-100" />
                  </tr>
                </thead>
                <tbody style={{ borderColor: brand.dark + '10' }}>
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        layout
                        className="group hover:bg-slate-50/60 transition-colors border-b last:border-0"
                        style={{ borderColor: brand.dark + '08' }}
                      >
                        <td className="px-3 py-3 text-[10px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors text-center">{idx + 1}</td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <ComboBox
                            variant="compact"
                            placeholder="P-CODE"
                            value={item.productCode}
                            options={sampleProducts.map(p => ({ id: p.id, name: p.id, subtitle: p.name }))}
                            onChange={(id) => {
                              const prod = sampleProducts.find(p => p.id === id);
                              if (prod) {
                                updateItem(item.id, {
                                  productCode: prod.id,
                                  description: prod.name,
                                  price: 450 // Default rate
                                });
                              }
                            }}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            variant="transparent"
                            placeholder="Detailed description..."
                            className="!font-bold text-slate-700"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            variant="compact"
                            placeholder="pcs"
                            className="text-center !bg-white border-slate-200"
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            variant="compact"
                            placeholder="Details"
                            className="!bg-white border-slate-200"
                            value={item.unitDetails}
                            onChange={(e) => updateItem(item.id, { unitDetails: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            type="number"
                            variant="compact"
                            className="text-center !bg-white border-slate-200"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            type="number"
                            variant="compact"
                            className="text-right !bg-white border-slate-200"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            type="number"
                            variant="compact"
                            className="text-right text-red-500 font-black !bg-white border-slate-200"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            type="number"
                            variant="compact"
                            className="text-right text-green-600 font-black !bg-white border-slate-200"
                            value={item.tax}
                            onChange={(e) => updateItem(item.id, { tax: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-2 py-3 border-l border-slate-50">
                          <Input
                            type="number"
                            variant="compact"
                            className="text-right text-amber-500 font-black !bg-white border-slate-200"
                            value={item.furtherTax}
                            onChange={(e) => updateItem(item.id, { furtherTax: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-black text-[11px] tracking-tight text-indigo-600 border-l border-slate-50">
                          {currencySymbol}{fmt((item.quantity * item.price) - item.discount + item.tax + item.furtherTax)}
                        </td>
                        <td className="px-4 py-3 text-center border-l border-slate-50">
                          <button onClick={() => removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50/50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <Plus className="w-12 h-12" />
                          <p className="text-[11px] font-black uppercase tracking-widest">
                            {data.items.length === 0 ? 'No entries found — Click "Add Item" to start' : 'No items match your search'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Sticky Summary Footer */}
                {data.items.length > 0 && (
                  <tfoot className="sticky bottom-0 z-10 bg-white border-t-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]" style={{ borderColor: brand.dark + '10' }}>
                    <tr className="font-black">
                      <td className="px-3 py-3 text-[10px] text-slate-400 text-center">Σ</td>
                      <td colSpan={4} className="px-4 py-3 text-[11px] text-slate-500 uppercase tracking-widest text-right pr-10 border-l border-slate-50">Total Summary</td>
                      <td className="px-2 py-3 text-center text-[11px] text-slate-700 border-l border-slate-50">
                        {data.items.reduce((sum, i) => sum + i.quantity, 0)}
                      </td>
                      <td className="px-2 py-3 text-right text-[11px] text-slate-700 border-l border-slate-50">
                        {/* Price total removed as requested */}
                      </td>
                      <td className="px-2 py-3 text-right text-[11px] text-red-500 border-l border-slate-50">
                        {currencySymbol}{fmt(data.items.reduce((sum, i) => sum + i.discount, 0))}
                      </td>
                      <td className="px-2 py-3 text-right text-[11px] text-emerald-600 border-l border-slate-50">
                        {currencySymbol}{fmt(data.items.reduce((sum, i) => sum + i.tax, 0))}
                      </td>
                      <td className="px-2 py-3 text-right text-[11px] text-amber-600 border-l border-slate-50">
                        {currencySymbol}{fmt(data.items.reduce((sum, i) => sum + i.furtherTax, 0))}
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] text-indigo-700 underline decoration-indigo-200 underline-offset-4 border-l border-slate-50">
                        {currencySymbol}{fmt(subtotal)}
                      </td>
                      <td className="border-l border-slate-50"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </ScrollArea>
          </div>

          {/* ── Bottom Tier ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: Notes + Attachments */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Notes */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Notes & Special Terms" />
                <div className="p-6 flex-1">
                  <TextArea placeholder="Enter payment terms, bank details, or special instructions..." className="h-full min-h-[100px]"
                    value={data.notes} onChange={(e) => onChange({ ...data, notes: e.target.value })} />
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-4 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Paperclip className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold">Document Attachments</h3>
                      <p className="text-[8px] opacity-70">Supporting files & assets</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-white/15 rounded-full text-[9px] font-black tracking-wider uppercase">
                    {files.length} {files.length === 1 ? 'File' : 'Files'}
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Upload Zone */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="group border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-blue-50/40 relative overflow-hidden min-h-[180px]"
                    style={{ borderColor: brand.primary + '20', backgroundColor: brand.surface + '40' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all group-hover:-translate-y-1">
                      <Upload className="w-5 h-5" style={{ color: brand.primary }} />
                    </div>

                    <div className="text-center relative z-10 px-4">
                      <p className="text-[11px] font-black tracking-tight" style={{ color: brand.dark }}>Click to Upload</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">or Drag & Drop files here</p>
                    </div>

                    <div className="flex gap-2 mt-2 pb-2">
                      {['PDF', 'JPG', 'ZIP'].map(type => (
                        <span key={type} className="text-[8px] font-black px-1.5 py-0.5 bg-white border border-slate-200 rounded uppercase" style={{ color: brand.dark }}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* File List */}
                  <ScrollArea maxHeight="220px" className="space-y-3 pr-2 pb-2">
                    <AnimatePresence mode="popLayout">
                      {files.map((file, idx) => (
                        <motion.div
                          key={file.name + idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                          className="group flex items-center justify-between p-3 bg-[#EFF5FC]/40 border border-slate-200/60 rounded-xl hover:bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-default"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-50 transition-colors border border-slate-100">
                              {getFileIcon(file.name)}
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] font-black truncate" style={{ color: brand.dark }}>{file.name}</p>
                              <p className="text-[9px] font-bold text-slate-400">{file.size}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFile(idx)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {files.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center py-8 text-center"
                      >
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                          <Paperclip className="w-4 h-4 text-slate-300" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 italic">No files attached to this invoice</p>
                      </motion.div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Right: Financial Matrix */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Financial Matrix" badge="PKR" />

                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* Discount Section */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8">
                      <span className="text-[11px] font-bold text-slate-500">Discount (%)</span>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        suffix="%"
                        value={data.discountPercentage}
                        onChange={(e) => onChange({ ...data, discountPercentage: parseFloat(e.target.value) || 0, discountAmount: 0 })}
                      />
                    </div>
                  </div>

                  {/* Shipping Charges */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8">
                      <span className="text-[11px] font-bold text-slate-500">Shipping Charges</span>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        value={data.shippingCharges}
                        onChange={(e) => onChange({ ...data, shippingCharges: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {/* Round Off */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8">
                      <span className="text-[11px] font-bold text-slate-500">Round Off</span>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        value={data.roundOff}
                        onChange={(e) => onChange({ ...data, roundOff: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-1" />

                  {/* Gross */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">Gross Subtotal</span>
                    <span className="text-[12px] font-black text-slate-700">{currencySymbol}{fmt(subtotal)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-500">Tax</span>
                      <span className="text-[9px] text-slate-400">Calculated ({data.taxRate}%)</span>
                    </div>
                    <span className="text-[12px] font-black text-slate-700">{currencySymbol}{fmt(taxAmount)}</span>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-1" />

                  {/* Net */}
                  <div className="flex justify-between items-center px-1 py-2">
                    <span className="text-[11px] font-black text-slate-700">Net Total (PKR)</span>
                    <span className="text-[16px] font-black" style={{ color: brand.primary }}>{currencySymbol}{fmt(netPayable)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditorV4;
