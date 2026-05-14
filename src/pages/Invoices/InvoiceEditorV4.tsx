import React, { useState } from 'react';
import type { InvoiceData, InvoiceItem } from '../../types';
import {
  Plus,
  Trash2,
  Printer,
  History,
  Save,
  Zap,
  Calendar,
  MessageSquare,
  Paperclip,
  Upload,
  Search,
  RefreshCw,
  CreditCard,
  Check,
  ArrowRight,
  Clock,
  Landmark,
  FileText,
  X
} from 'lucide-react';
import { Input, Select, TextArea } from '../../components/ui/FormControls';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const InvoiceEditorV4: React.FC<Props> = ({ data, onChange }) => {
  // Brand Standard Design System
  const brand = {
    primary: '#2759CD',    // Core Blue
    dark: '#304166',       // Deep Navy
    accent: '#EE4932',     // Execute Orange
    soft: '#BDD1FF',       // Soft Accent
    surface: '#EFF5FC',    // Background
    white: '#FFFFFF'
  };

  const [files, setFiles] = useState([
    { name: 'project_brief.pdf', size: '1.2 MB' },
    { name: 'logo_assets.zip', size: '4.5 MB' }
  ]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      price: 0,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    onChange({
      ...data,
      items: data.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const discountVal = (subtotal * data.discountPercentage) / 100;
  const total = subtotal + taxAmount - discountVal + data.shippingCharges;

  return (
    <div className="min-h-screen p-4 lg:px-8 lg:py-8 font-sans" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
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
          <div className="flex items-center gap-3">
             <button className="h-9 px-4 bg-white border font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2" style={{ color: brand.dark, borderColor: brand.dark + '15' }}>
               <History className="w-3.5 h-3.5" /> Activity
             </button>
             <button className="h-9 px-6 text-white font-black rounded-lg text-[9px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: brand.primary }}>
               <Save className="w-3.5 h-3.5" /> Save
             </button>
          </div>
        </div>

        {/* Core Layout */}
        <div className="space-y-6">
          
          {/* Identity Section */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
            <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">General Information</h3>
              <div className="px-2 py-0.5 bg-white/20 rounded text-[7px] font-bold uppercase tracking-wider">Identity Layer</div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <Input
                    label="Customer Entity"
                    icon={Search}
                    placeholder="Search client..."
                    value={data.clientName}
                    onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                  />
                </div>
                <div className="lg:col-span-3">
                  <Input
                    label="Invoice ID"
                    className="font-mono"
                    style={{ color: brand.primary }}
                    value={data.invoiceNumber}
                    onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })}
                  />
                </div>
                <div className="lg:col-span-3">
                  <Input
                    label="Reference"
                    placeholder="PO-NODE-004"
                    value={data.reference}
                    onChange={(e) => onChange({ ...data, reference: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Input label="Generation Date" type="date" value={data.date} onChange={(e) => onChange({ ...data, date: e.target.value })} />
                <Input label="Maturity Date" type="date" value={data.dueDate} onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                <Select
                  label="Settlement"
                  value={data.bankAccount}
                  onChange={(e) => onChange({ ...data, bankAccount: e.target.value })}
                  options={[
                    { value: 'chase', label: 'Chase Bank Account' },
                    { value: 'hbl', label: 'HBL Account' },
                  ]}
                />
              </div>

              <div className="pt-2">
                <Input
                  label="Subject Specification"
                  placeholder="Define invoice objective..."
                  value={data.subject}
                  onChange={(e) => onChange({ ...data, subject: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction Entries</h3>
              </div>
              <button 
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-1.5 bg-white font-black rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest text-[8px]"
                style={{ color: brand.primary }}
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.2em] border-b bg-slate-50/10" style={{ color: brand.dark, borderColor: brand.dark + '05' }}>
                    <th className="px-6 py-4 text-left">Nomenclature</th>
                    <th className="px-4 py-4 text-center w-24">Qty</th>
                    <th className="px-4 py-4 text-right w-32">Unit Cost</th>
                    <th className="px-6 py-4 text-right w-36">Aggregate</th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: brand.dark + '05' }}>
                  {data.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-2.5">
                        <input
                          type="text"
                          placeholder="Item..."
                          className="w-full bg-transparent border-none text-[13px] font-bold outline-none placeholder:text-slate-200"
                          style={{ color: brand.dark }}
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="number"
                          className="w-full bg-slate-50 border rounded-lg py-1 px-1.5 text-center text-[13px] font-bold outline-none"
                          style={{ color: brand.dark, borderColor: brand.dark + '10' }}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          className="w-full bg-slate-50 border rounded-lg py-1 px-1.5 text-right text-[13px] font-bold outline-none"
                          style={{ color: brand.dark, borderColor: brand.dark + '10' }}
                          value={item.price}
                          onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-6 py-2.5 text-right font-black text-[13px] tracking-tight" style={{ color: brand.primary }}>
                        ${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button onClick={() => removeItem(item.id)} style={{ color: brand.accent }} className="hover:scale-110 transition-transform">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Symmetrical Bottom Tier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Notes */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-2.5 text-white text-[9px] font-black uppercase tracking-[0.2em]" style={{ backgroundColor: brand.primary }}>
                   Notes & Special Terms
                </div>
                <div className="p-6 flex-1">
                  <TextArea
                    placeholder="Enter instructions..."
                    rows={3}
                    value={data.notes}
                    onChange={(e) => onChange({ ...data, notes: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Evidence Locker */}
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-2.5 text-white text-[9px] font-black uppercase tracking-[0.2em]" style={{ backgroundColor: brand.primary }}>
                   Evidence Locker
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: brand.dark }}>
                      <Paperclip className="w-3 h-3" /> System Assets
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[80px]" style={{ backgroundColor: brand.surface, borderColor: brand.dark + '10' }}>
                      <Upload className="w-4 h-4" style={{ color: brand.primary }} />
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Upload</p>
                    </div>
                    <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded-lg transition-colors" style={{ borderColor: brand.dark + '05' }}>
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3 h-3 flex-shrink-0" style={{ color: brand.primary }} />
                            <p className="text-[9px] font-black truncate" style={{ color: brand.dark }}>{file.name}</p>
                          </div>
                          <button onClick={() => removeFile(idx)} style={{ color: brand.accent }}><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-2.5 text-white text-[9px] font-black uppercase tracking-[0.2em]" style={{ backgroundColor: brand.primary }}>
                  Financial Matrix
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Tax (%)', key: 'taxRate' },
                        { label: 'Disc (%)', key: 'discountPercentage' },
                        { label: 'Logistics', key: 'shippingCharges' },
                      ].map((field) => (
                        <Input
                          key={field.key}
                          label={field.label}
                          type="number"
                          value={data[field.key as keyof InvoiceData] as number}
                          onChange={(e) => onChange({ ...data, [field.key as any]: parseFloat(e.target.value) || 0 })}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] pt-4 border-t" style={{ color: brand.dark, borderColor: brand.dark + '05' }}>
                      <span>Gross Ledger</span>
                      <span className="text-base font-black">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="pt-4 border-t flex justify-between items-center" style={{ borderColor: brand.dark + '10' }}>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40" style={{ color: brand.dark }}>Aggregate Sum</p>
                        <h2 className="text-xl font-black tracking-tight italic" style={{ color: brand.primary }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                      </div>
                      <button className="h-9 px-6 text-white font-black rounded-lg shadow-md transition-all text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2" style={{ backgroundColor: brand.accent }}>
                        <Check className="w-4 h-4" /> Execute
                      </button>
                    </div>
                    <button className="w-full py-2.5 font-black rounded-lg text-[8px] uppercase tracking-widest border" style={{ backgroundColor: brand.surface, color: brand.primary, borderColor: brand.primary + '20' }}>
                      Secure Gateway Link
                    </button>
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
