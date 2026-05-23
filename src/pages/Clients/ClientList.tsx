import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Client {
  name: string;
  email: string;
  phone: string;
  location: string;
  totalInvoiced: string;
}

const DEFAULT_CLIENTS: Client[] = [
  { name: 'BlueRitt Technologies', email: 'billing@blueritt.com', phone: '+1 234 567 890', location: 'Austin, TX', totalInvoiced: '$45,200' },
  { name: 'Acme Corp', email: 'finance@acme.com', phone: '+1 987 654 321', location: 'New York, NY', totalInvoiced: '$12,800' },
  { name: 'Global Solutions', email: 'hello@globalsol.com', phone: '+1 555 123 456', location: 'San Francisco, CA', totalInvoiced: '$8,900' },
  { name: 'Starlight Media', email: 'accounts@starlight.io', phone: '+1 444 777 888', location: 'London, UK', totalInvoiced: '$2,450' },
  { name: 'Ahmed', email: 'ahmed@example.com', phone: '+92 300 1234567', location: 'Lahore, Pakistan', totalInvoiced: '$0.00' },
  { name: 'Client Six', email: 'client6@example.com', phone: '+1 111 111 111', location: 'Chicago, IL', totalInvoiced: '$5,000' },
  { name: 'Client Seven', email: 'client7@example.com', phone: '+1 222 222 222', location: 'Miami, FL', totalInvoiced: '$3,200' },
  { name: 'Client Eight', email: 'client8@example.com', phone: '+1 333 333 333', location: 'Seattle, WA', totalInvoiced: '$7,800' },
  { name: 'Client Nine', email: 'client9@example.com', phone: '+1 444 444 444', location: 'Denver, CO', totalInvoiced: '$2,300' },
  { name: 'Client Ten', email: 'client10@example.com', phone: '+1 555 555 555', location: 'Boston, MA', totalInvoiced: '$6,500' },
  { name: 'Client Eleven', email: 'client11@example.com', phone: '+1 666 666 666', location: 'Houston, TX', totalInvoiced: '$4,400' },
  { name: 'Client Twelve', email: 'client12@example.com', phone: '+1 777 777 777', location: 'Phoenix, AZ', totalInvoiced: '$3,600' },
  { name: 'Client Thirteen', email: 'client13@example.com', phone: '+1 888 888 888', location: 'Philadelphia, PA', totalInvoiced: '$5,900' },
  { name: 'Client Fourteen', email: 'client14@example.com', phone: '+1 999 999 999', location: 'San Antonio, TX', totalInvoiced: '$2,800' },
  { name: 'Client Fifteen', email: 'client15@example.com', phone: '+1 101 010 1010', location: 'Dallas, TX', totalInvoiced: '$4,700' },
  { name: 'Client Sixteen', email: 'client16@example.com', phone: '+1 202 020 2020', location: 'San Jose, CA', totalInvoiced: '$3,100' },
  { name: 'Client Seventeen', email: 'client17@example.com', phone: '+1 303 030 3030', location: 'Austin, TX', totalInvoiced: '$6,200' },
  { name: 'Client Eighteen', email: 'client18@example.com', phone: '+1 404 040 4040', location: 'Jacksonville, FL', totalInvoiced: '$2,900' },
  { name: 'Client Nineteen', email: 'client19@example.com', phone: '+1 505 050 5050', location: 'Fort Worth, TX', totalInvoiced: '$5,300' },
  { name: 'Client Twenty', email: 'client20@example.com', phone: '+1 606 060 6060', location: 'Columbus, OH', totalInvoiced: '$4,100' },
  { name: 'Client Twenty-One', email: 'client21@example.com', phone: '+1 707 070 7070', location: 'Charlotte, NC', totalInvoiced: '$3,700' },
  { name: 'Client Twenty-Two', email: 'client22@example.com', phone: '+1 808 080 8080', location: 'San Francisco, CA', totalInvoiced: '$6,800' },
  { name: 'Client Twenty-Three', email: 'client23@example.com', phone: '+1 909 090 9090', location: 'Indianapolis, IN', totalInvoiced: '$2,500' },
  { name: 'Client Twenty-Four', email: 'client24@example.com', phone: '+1 111 222 3333', location: 'Seattle, WA', totalInvoiced: '$7,200' },
  { name: 'Client Twenty-Five', email: 'client25@example.com', phone: '+1 222 333 4444', location: 'Denver, CO', totalInvoiced: '$3,900' },
  { name: 'Client Twenty-Six', email: 'client26@example.com', phone: '+1 333 444 5555', location: 'Boston, MA', totalInvoiced: '$5,500' },
  { name: 'Client Twenty-Seven', email: 'client27@example.com', phone: '+1 444 555 6666', location: 'Chicago, IL', totalInvoiced: '$4,300' },
  { name: 'Client Twenty-Eight', email: 'client28@example.com', phone: '+1 555 666 7777', location: 'Miami, FL', totalInvoiced: '$2,600' },
  { name: 'Client Twenty-Nine', email: 'client29@example.com', phone: '+1 666 777 8888', location: 'Houston, TX', totalInvoiced: '$6,100' },
  { name: 'Client Thirty', email: 'client30@example.com', phone: '+1 777 888 9999', location: 'Phoenix, AZ', totalInvoiced: '$4,800' },
];

const ClientList: React.FC = () => {
  const [clients] = useState<Client[]>(() => {
    try {
      const stored = localStorage.getItem('client_list');
      const parsed = stored ? JSON.parse(stored) : DEFAULT_CLIENTS;
      return parsed;
    } catch {
      return [
        { name: 'BlueRitt Technologies', email: 'billing@blueritt.com', phone: '+1 234 567 890', location: 'Austin, TX', totalInvoiced: '$45,200' },
        { name: 'Acme Corp', email: 'finance@acme.com', phone: '+1 987 654 321', location: 'New York, NY', totalInvoiced: '$12,800' },
        { name: 'Global Solutions', email: 'hello@globalsol.com', phone: '+1 555 123 456', location: 'San Francisco, CA', totalInvoiced: '$8,900' },
        { name: 'Starlight Media', email: 'accounts@starlight.io', phone: '+1 444 777 888', location: 'London, UK', totalInvoiced: '$2,450' },
        { name: 'Ahmed', email: 'ahmed@example.com', phone: '+92 300 1234567', location: 'Lahore, Pakistan', totalInvoiced: '$0.00' },
      ];
      return DEFAULT_CLIENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('client_list', JSON.stringify(clients));
    } catch { /* ignore */ }
  }, [clients]);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customers</h2>
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
          <Button variant="primary" size="md" icon={Plus} className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100">
            Add Client
          </Button>
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
              <Button variant="ghost" size="xs" icon={MoreHorizontal} className="px-2 py-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50" />
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
              <Button variant="ghost" size="xs" className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold px-3 py-1.5">
                View Profile
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;
