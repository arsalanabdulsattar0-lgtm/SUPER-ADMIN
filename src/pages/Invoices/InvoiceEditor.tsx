import React from 'react';
import type { InvoiceData, InvoiceItem } from '../../types';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Search,
  History,
  Save,
  Printer,
  ChevronDown
} from 'lucide-react';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const InvoiceEditor: React.FC<Props> = ({ data, onChange }) => {
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
    <div className="p-4 pb-20">
      <div className=" space-y-4">
        {/* Integrated Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sale Invoice</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
              <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-widest rounded-md">
                Draft
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
              <History className="w-4 h-4" />
              History
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-lg shadow-slate-900/10">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/10"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-12 gap-4"
        >
          {/* Left Column: Basic Details */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search customer..."
                      className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10"
                      value={data.clientName}
                      onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Invoice #</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-mono text-indigo-600"
                      value={data.invoiceNumber}
                      onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reference</label>
                    <input
                      type="text"
                      placeholder="PO #, etc"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm"
                      value={data.reference}
                      onChange={(e) => onChange({ ...data, reference: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm"
                    value={data.date}
                    onChange={(e) => onChange({ ...data, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm"
                    value={data.dueDate}
                    onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bank Account</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm appearance-none cursor-pointer"
                      value={data.bankAccount}
                      onChange={(e) => onChange({ ...data, bankAccount: e.target.value })}
                    >
                      <option value="">Choose Account</option>
                      <option value="chase">Chase Bank (...4521)</option>
                      <option value="wellsfargo">Wells Fargo (...8892)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                <input
                  type="text"
                  placeholder="Design project for Q4..."
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
                  value={data.subject}
                  onChange={(e) => onChange({ ...data, subject: e.target.value })}
                />
              </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Product Details</h3>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-500 transition-all shadow-md shadow-indigo-100"
                >
                  <Plus className="w-3 h-3" />
                  Quick Add
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Item Description</th>
                      <th className="px-4 py-4 w-24 text-center">Qty</th>
                      <th className="px-4 py-4 w-32 text-right">Price</th>
                      <th className="px-4 py-4 w-32 text-right">Total</th>
                      <th className="px-6 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.items.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Type item name..."
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-700"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-center text-sm"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-sm"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                          ${(item.quantity * item.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Additional Comments</label>
              <textarea
                rows={3}
                placeholder="Internal notes or terms..."
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/10"
                value={data.notes}
                onChange={(e) => onChange({ ...data, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Right Column: Calculations & Summary */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-1000" />

              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 relative z-10">Invoice Summary</h3>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <span>Gross Total</span>
                  <span className="font-mono text-white">${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <span>Discount</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-12 bg-slate-800 border-none rounded-lg py-1 px-2 text-xs text-right text-white focus:ring-1 focus:ring-indigo-500"
                      value={data.discountPercentage}
                      onChange={(e) => onChange({ ...data, discountPercentage: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="text-[10px] font-bold">%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <span>Tax Amount</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-12 bg-slate-800 border-none rounded-lg py-1 px-2 text-xs text-right text-white focus:ring-1 focus:ring-indigo-500"
                      value={data.taxRate}
                      onChange={(e) => onChange({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="text-[10px] font-bold">%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <span>Shipping</span>
                  <input
                    type="number"
                    className="w-20 bg-slate-800 border-none rounded-lg py-1 px-2 text-xs text-right text-white focus:ring-1 focus:ring-indigo-500"
                    value={data.shippingCharges}
                    onChange={(e) => onChange({ ...data, shippingCharges: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="h-px bg-slate-800 my-4" />

                <div className="flex justify-between items-end pt-2">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                    <h2 className="text-4xl font-extrabold tracking-tight">${total.toLocaleString()}</h2>
                  </div>
                  <div className="text-right text-[10px] font-medium text-slate-500">
                    Net Payable
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Attachments</h3>
              <div className="border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center space-y-3 group hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                </div>
                <p className="text-xs text-slate-400 font-medium italic">Drop files or click to browse</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
