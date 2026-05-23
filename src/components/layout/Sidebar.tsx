import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  Menu,
  Sparkles,
  ChevronDown,
  Box
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<Props> = ({ activeView, onViewChange, isCollapsed, onToggleSidebar, onLogout }) => {
  const { brand } = useTheme();

  const handleMenuClick = (id: string) => {
    onViewChange(id);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dashboard1', label: 'Dashboard 1', icon: Sparkles },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'add-invoice-v4', label: 'Create V4', icon: Zap },
    { id: 'clients', label: 'Customer', icon: Users },
    { id: 'products', label: 'Products', icon: Box },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 60 : 224 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen flex flex-col sticky top-0 flex-shrink-0 overflow-hidden z-50 transition-colors duration-300"
      style={{
        backgroundColor: brand.sidebarBg,
        borderRight: `1px solid ${brand.border}`,
      }}
    >
      {/* Logo / Toggle */}
      <div className={`py-6 flex items-center ${isCollapsed ? 'justify-center' : 'px-6 gap-2.5'}`}>
        <button
          onClick={onToggleSidebar}
          className="group/logo relative shrink-0 overflow-hidden transition-all hover:opacity-90"
          style={{
            width: isCollapsed ? 40 : 32,
            height: isCollapsed ? 40 : 32,
            backgroundColor: brand.primary,
            borderRadius: 10,
            boxShadow: `0 4px 12px ${brand.primary}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="text-white font-bold group-hover/logo:scale-0 transition-all duration-300"
            style={{ fontSize: isCollapsed ? 20 : 16 }}
          >
            I
          </span>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 scale-50 group-hover/logo:scale-100 transition-all duration-300">
            <Menu className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
          </div>
        </button>

        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold tracking-tight truncate transition-colors duration-300"
            style={{ color: brand.textPrimary }}
          >
            InvoiceFlow
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <nav className={`flex-grow ${isCollapsed ? 'px-2' : 'px-3'} space-y-1.5 py-4 overflow-y-auto custom-scrollbar`}>
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-11' : 'gap-2.5 px-4 py-2.5'} rounded-xl text-[13px] font-medium transition-all relative`}
              style={{
                backgroundColor: isActive ? brand.sidebarActiveBg : 'transparent',
                color: isActive ? brand.sidebarActiveText : brand.sidebarText,
              }}
              title={isCollapsed ? item.label : ''}
            >
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl z-0"
                  style={{
                    backgroundColor: brand.sidebarActiveBg,
                    border: `1px solid ${brand.primary}20`,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon
                className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} relative z-10`}
                style={{ color: isActive ? brand.sidebarActiveText : brand.sidebarText }}
              />
              {!isCollapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div
        className={`py-4 space-y-1.5 ${isCollapsed ? 'px-2' : 'px-3'}`}
        style={{ borderTop: `1px solid ${brand.border}` }}
      >
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-11' : 'gap-2.5 px-4 py-2.5'} rounded-xl text-[13px] font-medium transition-all hover:opacity-80`}
            style={{ color: brand.sidebarText }}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon
              className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`}
              style={{ color: brand.sidebarText }}
            />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}

        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-11' : 'gap-2.5 px-4 py-2.5'} rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all`}
        >
          <LogOut className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* PROFILE CARD */}
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${brand.border}` }}>
          <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} group cursor-pointer`}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
                }}
              >
                JD
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight" style={{ color: brand.textPrimary }}>John Doe</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: brand.sidebarText }}>Admin Account</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className="w-4 h-4 group-hover:translate-y-0.5 transition-transform shrink-0"
                style={{ color: brand.sidebarText }}
              />
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
