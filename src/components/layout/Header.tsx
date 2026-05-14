import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-grow max-w-xl">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for invoices, clients, or reports..."
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <button className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100">
            JD
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">John Doe</p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Admin Account</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
