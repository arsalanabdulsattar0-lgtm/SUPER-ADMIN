import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import { DEFAULT_CUSTOMERS } from '../../utils/customerData';
import { useTheme } from '../../context/ThemeContext';

export interface CustomerListItem {
  name: string;
  email: string;
  phone: string;
  location: string;
  totalInvoiced: string;
}

const CustomerList: React.FC = () => {
  const { brand } = useTheme();
  const [customers] = useState<CustomerListItem[]>(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      const parsed = stored ? JSON.parse(stored) : DEFAULT_CUSTOMERS;
      return parsed;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('customer_list', JSON.stringify(customers));
    } catch { /* ignore */ }
  }, [customers]);

  return (
    <div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>
      {/* Page Header */}
      <PageHeader
        title="Business Partners"
        subtitle="Manage your business partner database and relationships."
        actions={
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Business Partners..."
                className="w-full sm:w-64 bg-white border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
            <Button variant="primary" size="md" icon={Plus}>
              Add Business Partner
            </Button>
          </div>
        }
      />

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map((customer, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="h-full flex flex-col hover:-translate-y-1 transition-all cursor-pointer group p-6"
              style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-[12px] font-bold text-brand-primary" style={{ color: brand.primary }}>
                  {customer.name}
                </div>
                <Button variant="ghost" size="xs" icon={MoreHorizontal} title="More Options" className="px-2 py-2 text-slate-300 hover:text-slate-650 hover:bg-slate-50" />
              </div>
              
              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-300" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-300" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                  {customer.location}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest">Total Invoiced (Rs.)</p>
                  <p className="text-lg font-black mt-1" style={{ color: brand.dark }}>
                    {customer.totalInvoiced.replace(/^(Rs\.|PKR|\$)\s*/i, '').trim()}
                  </p>
                </div>
                <Button variant="ghost" size="xs" title="View Partner Profile" className="text-blue-650 hover:bg-blue-50 font-bold px-3 py-1.5">
                  View Profile
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
