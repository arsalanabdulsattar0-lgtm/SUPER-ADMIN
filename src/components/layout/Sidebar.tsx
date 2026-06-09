import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  FilePlus,
  Menu,
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
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'add-invoice-v4', label: 'Add Invoice', icon: FilePlus },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Box },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 48 : 180 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen flex flex-col sticky top-0 flex-shrink-0 overflow-hidden z-50 transition-colors duration-300"
      style={{
        backgroundColor: brand.sidebarBg,
        borderRight: `1px solid ${brand.border}`,
      }}
    >
      {/* Logo / Toggle */}
      <div className={`py-6 flex items-center ${isCollapsed ? 'justify-center' : 'px-5 gap-2'}`}>
        <button
          onClick={onToggleSidebar}
          className="group/logo relative shrink-0 overflow-hidden transition-all hover:opacity-90 cursor-pointer"
          style={{
            width: 32,
            height: 32,
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
            style={{ fontSize: 16 }}
          >
            I
          </span>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 scale-50 group-hover/logo:scale-100 transition-all duration-300">
            <Menu className="w-[18px] h-[18px] text-white" />
          </div>
        </button>

        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-md font-bold tracking-tight truncate transition-colors duration-300"
            style={{ color: brand.textPrimary }}
          >
            InvoiceFlow
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <nav className={`flex-grow ${isCollapsed ? 'px-1.5' : 'px-2.5'} space-y-1.5 py-4 overflow-y-auto custom-scrollbar`}>
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer`}
              style={{
                backgroundColor: isActive ? brand.primary : 'transparent',
                color: isActive ? '#FFFFFF' : '#000000',
              }}
              title={isCollapsed ? item.label : ''}
            >
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl z-0"
                  style={{
                    backgroundColor: brand.primary,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon
                className={`${isCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'} relative z-10`}
                style={{ color: isActive ? '#FFFFFF' : '#000000' }}
              />
              {!isCollapsed && (
                <span className="relative z-10 truncate" style={{ color: isActive ? '#FFFFFF' : '#000000' }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div
        className={`py-4 space-y-1.5 ${isCollapsed ? 'px-1.5' : 'px-2.5'}`}
        style={{ borderTop: `1px solid ${brand.border}` }}
      >
        {bottomItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer`}
              style={{
                backgroundColor: isActive ? brand.primary : 'transparent',
                color: isActive ? '#FFFFFF' : '#000000',
              }}
              title={isCollapsed ? item.label : ''}
            >
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl z-0"
                  style={{
                    backgroundColor: brand.primary,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon
                className={`${isCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'} relative z-10`}
                style={{ color: isActive ? '#FFFFFF' : '#000000' }}
              />
              {!isCollapsed && <span className="relative z-10 truncate" style={{ color: isActive ? '#FFFFFF' : '#000000' }}>{item.label}</span>}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer`}
        >
          <LogOut className={`${isCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* PROFILE CARD */}
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${brand.border}` }}>
          <div className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-1.5'} group`}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
                }}
              >
                JD
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-[12px] font-bold leading-tight" style={{ color: brand.textPrimary }}>John Doe</p>
                  <p className="text-[10px] font-medium tracking-wider mt-0.5" style={{ color: brand.sidebarText }}>Admin Account</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
