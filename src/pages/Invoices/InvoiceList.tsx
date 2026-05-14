import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Download, Eye } from 'lucide-react';

const InvoiceList: React.FC = () => {
  const invoices = [
    { id: 'SI-000248', client: 'BlueRitt Technologies', date: '2026-05-12', amount: '$8,450.00', status: 'Draft' },
    { id: 'SI-000247', client: 'Acme Corp', date: '2026-05-10', amount: '$1,200.00', status: 'Paid' },
    { id: 'SI-000246', client: 'Global Solutions', date: '2026-05-08', amount: '$3,500.00', status: 'Pending' },
    { id: 'SI-000245', client: 'Starlight Media', date: '2026-05-05', amount: '$950.00', status: 'Paid' },
    { id: 'SI-000244', client: 'Nexus Systems', date: '2026-05-01', amount: '$12,000.00', status: 'Overdue' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600';
      case 'Pending': return 'bg-amber-50 text-amber-600';
      case 'Overdue': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoices</h2>
          <p className="text-slate-400 text-xs mt-1">Manage and track your business invoices.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full sm:w-64 bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <button className="p-2 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-indigo-600">{inv.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.client}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-50 bg-slate-50/20 text-center">
          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            View All Invoices
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InvoiceList;
