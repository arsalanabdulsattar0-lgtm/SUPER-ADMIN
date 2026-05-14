import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  PlusCircle,
  Zap
} from 'lucide-react';

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<Props> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'add-invoice', label: 'Create New', icon: PlusCircle },
    { id: 'add-invoice-v2', label: 'Create V2', icon: Zap },
    { id: 'add-invoice-v3', label: 'Create V3', icon: Zap },
    { id: 'add-invoice-v4', label: 'Create V4', icon: Zap },
    { id: 'clients', label: 'Clients', icon: Users },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 flex-shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <span className="text-white font-bold text-xl">I</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">InvoiceFlow</span>
      </div>

      <nav className="flex-grow px-4 space-y-2 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all relative ${
              activeView === item.id 
                ? 'text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {activeView === item.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-full z-0"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 relative z-10 ${activeView === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <item.icon className="w-5 h-5 text-slate-400" />
            <span>{item.label}</span>
          </button>
        ))}
        
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-4">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
