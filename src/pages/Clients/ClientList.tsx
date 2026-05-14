import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';

const ClientList: React.FC = () => {
  const clients = [
    { name: 'BlueRitt Technologies', email: 'billing@blueritt.com', phone: '+1 234 567 890', location: 'Austin, TX', totalInvoiced: '$45,200' },
    { name: 'Acme Corp', email: 'finance@acme.com', phone: '+1 987 654 321', location: 'New York, NY', totalInvoiced: '$12,800' },
    { name: 'Global Solutions', email: 'hello@globalsol.com', phone: '+1 555 123 456', location: 'San Francisco, CA', totalInvoiced: '$8,900' },
    { name: 'Starlight Media', email: 'accounts@starlight.io', phone: '+1 444 777 888', location: 'London, UK', totalInvoiced: '$2,450' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clients</h2>
          <p className="text-slate-400 text-xs mt-1">Manage your customer database and relationships.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..."
              className="w-full sm:w-64 bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <span className="text-xl font-bold">{client.name[0]}</span>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-4">{client.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-slate-300" />
                {client.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone className="w-4 h-4 text-slate-300" />
                {client.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-slate-300" />
                {client.location}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Invoiced</p>
                <p className="text-lg font-bold text-slate-900">{client.totalInvoiced}</p>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;
