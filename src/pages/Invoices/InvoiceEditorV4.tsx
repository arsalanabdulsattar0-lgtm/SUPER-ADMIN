import React, { useState } from 'react';
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
  DollarSign,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
  FileEdit,
} from 'lucide-react';
import { Input, Select, TextArea } from '../../components/ui/FormControls';

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

const currencies = [
  { value: 'USD', label: '🇺🇸 USD — US Dollar' },
  { value: 'EUR', label: '🇪🇺 EUR — Euro' },
  { value: 'GBP', label: '🇬🇧 GBP — British Pound' },
  { value: 'PKR', label: '🇵🇰 PKR — Pakistani Rupee' },
  { value: 'AED', label: '🇦🇪 AED — UAE Dirham' },
  { value: 'SAR', label: '🇸🇦 SAR — Saudi Riyal' },
];

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
];

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
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const [files, setFiles] = useState([
    { name: 'project_brief.pdf', size: '1.2 MB' },
    { name: 'logo_assets.zip', size: '4.5 MB' },
  ]);

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const addItem = () => {
    const newItem: InvoiceItem = { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) =>
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });

  const updateItem = (id: string, updates: Partial<InvoiceItem>) =>
    onChange({ ...data, items: data.items.map((item) => (item.id === id ? { ...item, ...updates } : item)) });

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const discountVal = (subtotal * data.discountPercentage) / 100;
  const total = subtotal + taxAmount - discountVal + data.shippingCharges;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'PKR' ? '₨' : currency === 'AED' ? 'د.إ' : '﷼';

  const status = statusConfig[paymentStatus];
  const StatusIcon = status.icon;

  // Section header helper
  const SectionHeader = ({ title, badge }: { title: string; badge?: string }) => (
    <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      {badge && <div className="px-2 py-0.5 bg-white/20 rounded text-[7px] font-bold uppercase tracking-wider">{badge}</div>}
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:px-8 lg:py-8 font-sans [&_input]:shadow-none [&_select]:shadow-none [&_textarea]:shadow-none" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: brand.primary }}>
              <Zap className="w-3 h-3 fill-current" />
              <span>System V4.0</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-4" style={{ color: brand.dark }}>
              Invoice Node
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
                className="text-[9px] font-black uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer"
                style={{ color: status.text }}
              >
                {(Object.keys(statusConfig) as PaymentStatus[]).map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>

            <button className="h-9 px-4 bg-white border font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2" style={{ color: brand.dark, borderColor: brand.dark + '15' }}>
              <History className="w-3.5 h-3.5" /> Activity
            </button>
            <button className="h-9 px-6 text-white font-black rounded-lg text-[9px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: brand.primary }}>
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* ── General Information ── */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
            <SectionHeader title="General Information" badge="Identity Layer" />
            <div className="p-6 space-y-5">

              {/* Row 1: Customer, Invoice ID, Reference */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6">
                  <Input label="Customer Entity" icon={Search} placeholder="Search client..." value={data.clientName}
                    onChange={(e) => onChange({ ...data, clientName: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                  <Input label="Invoice ID" className="font-mono" style={{ color: brand.primary }}
                    value={data.invoiceNumber} onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                  <Input label="Reference" placeholder="PO-NODE-004" value={data.reference}
                    onChange={(e) => onChange({ ...data, reference: e.target.value })} />
                </div>
              </div>

              {/* Row 2: Dates, Bank, Currency */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <Input label="Issue Date" type="date" value={data.date}
                  onChange={(e) => onChange({ ...data, date: e.target.value })} />
                <Input label="Due Date" type="date" value={data.dueDate}
                  onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                <Select label="Bank Account" value={data.bankAccount}
                  onChange={(e) => onChange({ ...data, bankAccount: e.target.value })}
                  options={[
                    { value: 'chase', label: 'Chase Bank (...4521)' },
                    { value: 'hbl', label: 'HBL Account (...9920)' },
                    { value: 'stripe', label: 'Stripe Payouts' },
                  ]}
                />
                {/* Currency Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" /> Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl py-3 px-4 text-sm font-bold text-[#304166] appearance-none cursor-pointer focus:border-[#2759CD] outline-none transition-all"
                  >
                    {currencies.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Subject, Payment Method */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <Input label="Subject Specification" placeholder="Define invoice objective..." value={data.subject}
                    onChange={(e) => onChange({ ...data, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl py-3 px-4 text-sm font-bold text-[#304166] appearance-none cursor-pointer focus:border-[#2759CD] outline-none transition-all"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Transaction Entries ── */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction Entries</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
                  {data.items.length} items
                </span>
              </div>
              <button onClick={addItem}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white font-black rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest text-[8px]"
                style={{ color: brand.primary }}>
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.2em] border-b" style={{ color: brand.dark, borderColor: brand.dark + '08' }}>
                    <th className="px-6 py-3.5 text-left">Description</th>
                    <th className="px-4 py-3.5 text-center w-24">Qty</th>
                    <th className="px-4 py-3.5 text-right w-32">Unit Price</th>
                    <th className="px-4 py-3.5 text-right w-20">Tax %</th>
                    <th className="px-6 py-3.5 text-right w-36">Total</th>
                    <th className="px-4 py-3.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: brand.dark + '05' }}>
                  {data.items.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-300 w-4 shrink-0">{idx + 1}</span>
                          <input
                            type="text"
                            placeholder="Item description..."
                            className="w-full bg-transparent border-none text-[13px] font-bold outline-none placeholder:text-slate-200"
                            style={{ color: brand.dark }}
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                          <input type="number"
                            className="w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-lg py-1.5 px-2 text-center text-[13px] font-bold outline-none focus:border-[#2759CD] transition-all"
                            style={{ color: brand.dark }}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-[10px] font-bold text-slate-400 mr-1">{currencySymbol}</span>
                          <input type="number"
                            className="w-20 bg-[#EFF5FC] border border-[#304166]/10 rounded-lg py-1.5 px-2 text-right text-[13px] font-bold outline-none focus:border-[#2759CD] transition-all"
                            style={{ color: brand.dark }}
                            value={item.price}
                            onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ backgroundColor: brand.soft + '50', color: brand.primary }}>
                          {data.taxRate}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-black text-[13px] tracking-tight" style={{ color: brand.primary }}>
                        {currencySymbol}{fmt(item.quantity * item.price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                          style={{ color: brand.accent }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                        No items yet — click "Add Item" to begin
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Bottom Tier ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left: Notes + Attachments */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Notes */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Notes & Special Terms" />
                <div className="p-6 flex-1">
                  <TextArea placeholder="Enter payment terms, bank details, or special instructions..." rows={3}
                    value={data.notes} onChange={(e) => onChange({ ...data, notes: e.target.value })} />
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Attachments</h3>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: brand.soft, color: brand.dark }}>
                    {files.length} files
                  </span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/30 min-h-[100px]"
                    style={{ borderColor: brand.dark + '12', backgroundColor: brand.surface }}>
                    <Upload className="w-5 h-5" style={{ color: brand.primary }} />
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: brand.dark }}>Click to Upload</p>
                    <p className="text-[8px] text-slate-400 uppercase">PDF, PNG, JPG — max 10MB</p>
                  </div>
                  <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg hover:border-blue-200 transition-colors" style={{ borderColor: brand.dark + '08' }}>
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: brand.primary }} />
                          <div className="truncate">
                            <p className="text-[10px] font-bold truncate" style={{ color: brand.dark }}>{file.name}</p>
                            <p className="text-[8px] text-slate-400">{file.size}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(idx)} className="p-1 rounded hover:bg-red-50 transition-colors shrink-0" style={{ color: brand.accent }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {files.length === 0 && (
                      <p className="text-[10px] text-slate-300 italic text-center pt-4">No files attached</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Financial Matrix */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Financial Matrix" badge={currency} />

                <div className="p-6 flex-1 flex flex-col justify-between gap-5">

                  {/* Adjustments */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Tax (%)', key: 'taxRate' },
                      { label: 'Disc (%)', key: 'discountPercentage' },
                      { label: 'Shipping', key: 'shippingCharges' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                        <input type="number"
                          className="w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-lg py-2 px-3 text-[13px] font-bold outline-none focus:border-[#2759CD] transition-all"
                          style={{ color: brand.dark }}
                          value={data[field.key as keyof InvoiceData] as number}
                          onChange={(e) => onChange({ ...data, [field.key as any]: parseFloat(e.target.value) || 0 })} />
                      </div>
                    ))}
                  </div>

                  {/* Breakdown Lines */}
                  <div className="space-y-2 border-t pt-4" style={{ borderColor: brand.dark + '08' }}>
                    {[
                      { label: 'Subtotal', value: subtotal, color: brand.dark, bold: false },
                      { label: `Tax (${data.taxRate}%)`, value: taxAmount, color: '#15803D', bold: false },
                      { label: `Discount (${data.discountPercentage}%)`, value: -discountVal, color: brand.accent, bold: false },
                      { label: 'Shipping', value: data.shippingCharges, color: brand.dark, bold: false },
                    ].map(({ label, value, color, bold }) => (
                      <div key={label} className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-400">{label}</span>
                        <span className={`font-${bold ? 'black' : 'bold'}`} style={{ color }}>
                          {value < 0 ? '-' : ''}{currencySymbol}{fmt(Math.abs(value))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: brand.primary }}>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">Net Payable</p>
                      <h2 className="text-2xl font-black tracking-tight text-white">
                        {currencySymbol}{fmt(total)}
                      </h2>
                      <p className="text-[8px] font-bold mt-0.5" style={{ color: brand.soft }}>{currency} · {paymentMethods.find(m => m.value === paymentMethod)?.label}</p>
                    </div>
                    <button className="h-11 px-6 text-white font-black rounded-xl shadow-xl text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: brand.accent }}>
                      <Check className="w-4 h-4" /> Execute
                    </button>
                  </div>

                  <button className="w-full py-2.5 font-black rounded-xl text-[9px] uppercase tracking-widest border transition-all hover:shadow-sm"
                    style={{ backgroundColor: brand.soft + '30', color: brand.primary, borderColor: brand.primary + '25' }}>
                    Generate Shareable Link
                  </button>
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
