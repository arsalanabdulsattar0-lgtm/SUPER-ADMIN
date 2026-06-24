import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import { 
  ShieldCheck, LayoutDashboard, Package, 
  Building2, LogOut, Printer, PlusCircle
} from 'lucide-react';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OverviewDashboard from './pages/OverviewDashboard';
import SuperAdminAuth from './pages/Auth/SuperAdminAuth';

type SuperAdminView = 'dashboard' | 'companies' | 'packages' | 'add-company';

const SuperAdminApp = () => {
  const { brand } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<SuperAdminView>('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-company', label: 'Add Company', icon: PlusCircle },
    { id: 'companies', label: 'Manage Companies', icon: Building2 },
    { id: 'packages', label: 'Manage Packages', icon: Package },
  ];

  if (!isAuthenticated) {
    return <SuperAdminAuth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: brand.mainBg }}>
      {/* Super Admin Sidebar */}
      <motion.div
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="flex flex-col h-full flex-shrink-0 relative z-20 border-r"
        style={{ backgroundColor: brand.sidebarBg, color: brand.sidebarText, borderColor: brand.border }}
      >
        <div className="flex items-center justify-between p-4 mb-4">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brand.primary }}>
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="font-bold text-lg leading-tight tracking-wide" style={{ color: brand.textPrimary }}>Super Admin</h1>
                <p className="text-xs font-medium" style={{ color: brand.textSecondary }}>Control Center</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as SuperAdminView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'font-medium shadow-sm' 
                  : 'hover:bg-black/5'
              }`}
              style={activeView === item.id ? { backgroundColor: brand.sidebarActiveBg, color: brand.sidebarActiveText } : { color: brand.sidebarText }}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'opacity-100' : 'opacity-70'}`} />
              {!isSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t" style={{ borderColor: brand.border }}>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-50 text-red-600"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b z-10 bg-white shadow-sm border-gray-100">
           <div className="flex items-center gap-4">
             <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg">
               <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             </button>
             <h2 className="text-xl font-semibold text-gray-800 capitalize">{activeView.replace('-', ' ')}</h2>
           </div>
        </header>
        
        <main className="flex-grow relative overflow-y-auto bg-gray-50/50 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              {activeView === 'dashboard' ? (
                 <OverviewDashboard />
              ) : (
                 <SuperAdminDashboard defaultTab={activeView} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminApp;
