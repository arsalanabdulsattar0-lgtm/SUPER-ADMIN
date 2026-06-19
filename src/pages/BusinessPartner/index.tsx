import React, { useState } from 'react';
import { Users, Truck } from 'lucide-react';
import CustomerComponent from './Customer';
import SupplierComponent from './Supplier';
import { useTheme } from '../../context/ThemeContext';

const BusinessPartnerIndex: React.FC = () => {
  const { brand } = useTheme();
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');

  return (
    <div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>
      {/* Tab Switcher at the Page Level */}
      <div className="flex border-b border-slate-200 text-xs font-bold bg-white px-6 py-2.5 rounded-2xl shadow-none border border-slate-100 items-center gap-4 print-hidden">
        <span className="text-[11px] font-black text-slate-400 mr-2 uppercase tracking-wider">Business Partner Type:</span>
        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
          {[
            { id: 'customer', label: 'Customers', icon: Users },
            { id: 'supplier', label: 'Suppliers', icon: Truck }
          ].map(tab => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all outline-none border border-transparent ${
                  isCurrent 
                    ? 'bg-white shadow-sm border-slate-200/60 font-black' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                style={{
                  color: isCurrent ? brand.primary : undefined
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Module */}
      <div className="animate-fadeIn">
        {activeTab === 'customer' ? <CustomerComponent /> : <SupplierComponent />}
      </div>
    </div>
  );
};

export default BusinessPartnerIndex;
