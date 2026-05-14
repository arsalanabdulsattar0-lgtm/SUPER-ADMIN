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

const InvoiceEditorV2: React.FC<Props> = ({ data, onChange }) => {
  // Mock state for files to show it's "working"
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
    <div className="min-h-screen bg-[#fafbfc] p-4 lg:px-8 lg:py-10 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[9px] uppercase tracking-[0.25em] mb-1">
              <Zap className="w-3 h-3 fill-current" />
              <span>Smart Billing Engine V2.0</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Sale Invoice
              <span className="h-5 w-[1px] bg-slate-200" />
              <span className="text-slate-400 font-medium text-base tracking-normal">#{data.invoiceNumber}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button className="h-10 px-5 bg-white border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
               <History className="w-3.5 h-3.5" /> Activity
             </button>
             <button className="h-10 px-6 bg-slate-900 text-white font-bold rounded-lg text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2">
               <Save className="w-3.5 h-3.5" /> Save
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-10">
          
          {/* General Fields Card */}
          <div className="space-y-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <Input
                  label="Customer *"
                  icon={Search}
                  placeholder="Select client..."
                  value={data.clientName}
                  onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                />
              </div>
              <div className="lg:col-span-3">
                <Input
                  label="Invoice #"
                  className="font-mono text-indigo-600"
                  value={data.invoiceNumber}
                  onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })}
                />
              </div>
              <div className="lg:col-span-3">
                <Input
                  label="Reference"
                  placeholder="PO-2026-004"
                  value={data.reference}
                  onChange={(e) => onChange({ ...data, reference: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Input
                label="Issue Date"
                type="date"
                value={data.date}
                onChange={(e) => onChange({ ...data, date: e.target.value })}
              />
              <Input
                label="Due Date"
                type="date"
                value={data.dueDate}
                onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
              />
              <Select
                label="Bank Account"
                value={data.bankAccount}
                onChange={(e) => onChange({ ...data, bankAccount: e.target.value })}
                options={[
                  { value: 'chase', label: 'Chase Bank (...4521)' },
                  { value: 'hbl', label: 'HBL Premium (...9920)' },
                  { value: 'stripe', label: 'Stripe Payouts' },
                ]}
              />
            </div>

            <div className="pt-2">
              <Input
                label="Subject"
                placeholder="Enter invoice subject"
                value={data.subject}
                onChange={(e) => onChange({ ...data, subject: e.target.value })}
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Product Details</h3>
              </div>
              <button 
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[9px] font-black rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-widest"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-4 text-left">Description</th>
                    <th className="px-4 py-4 text-center w-24">Qty</th>
                    <th className="px-4 py-4 text-right w-36">Price</th>
                    <th className="px-8 py-4 text-right w-44">Total</th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-3">
                        <input
                          type="text"
                          placeholder="Item name..."
                          className="w-full bg-transparent border-none text-[13px] font-bold text-slate-900 outline-none placeholder:text-slate-300"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-center text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-200 transition-all outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-right text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-200 transition-all outline-none"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-8 py-3 text-right font-black text-sm tracking-tight">
                        ${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.id)} className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Layout: Notes & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            {/* Notes Section */}
            <div className="lg:col-span-7 space-y-6">
              <TextArea
                label="Additional Notes"
                placeholder="Include payment terms or bank details..."
                rows={4}
                value={data.notes}
                onChange={(e) => onChange({ ...data, notes: e.target.value })}
              />
              
              {/* Working Attachment Section */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1">
                    <Paperclip className="w-3.5 h-3.5" /> Attachments
                  </label>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{files.length} Files Attached</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dropzone */}
                  <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50/30 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer group h-full min-h-[120px]">
                    <Upload className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to upload</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-1 text-center leading-relaxed">PDF, PNG or JPG up to 10MB</p>
                  </div>

                  {/* File List */}
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-lg group hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-md shadow-sm">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{file.name}</p>
                            <p className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">{file.size}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {files.length === 0 && (
                      <div className="h-full flex items-center justify-center text-slate-300 italic text-[10px]">
                        No files attached
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Billing Summary */}
            <div className="lg:col-span-5 mt-6">
              <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white space-y-5 shadow-xl">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[9px] font-black  tracking-[0.25em]">Billing Summary</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Gross Ledger</span>
                    <span className="text-white text-sm font-black">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {/* Row for all 3 inputs */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Tax (%)', key: 'taxRate' },
                      { label: 'Disc (%)', key: 'discountPercentage' },
                      { label: 'Logistics', key: 'shippingCharges' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{field.label}</span>
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs font-bold text-white outline-none focus:border-indigo-400 transition-all"
                          value={data[field.key as keyof InvoiceData] as number}
                          onChange={(e) => onChange({ ...data, [field.key as any]: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Net Payable</p>
                    <h2 className="text-xl font-black tracking-tight text-white italic">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  </div>
                  <button className="h-10 px-6 bg-white text-slate-900 font-black rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all text-[9x]  tracking-widest flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Execute
                  </button>
                </div>
                
                <button className="w-full py-2 bg-white/5 text-slate-500 font-bold rounded-lg hover:bg-white/10 transition-all text-[8px] uppercase tracking-widest">
                   Get Sharable Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditorV2;
