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
  Box,
  Undo2,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  activeView: string;
  invoiceType?: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
  currentCompany?: { id: string; name: string; logo?: string } | null;
  currentBranch?: { id: string; name: string } | null;
  companies?: { id: string; name: string; is_active: boolean; logo?: string }[];
  branches?: { id: string; companyId: string; name: string }[];
  onContextChange?: (companyId: string, branchId: string, setAsDefault: boolean) => void;
}

const Sidebar: React.FC<Props> = ({
  activeView,
  invoiceType,
  onViewChange,
  isCollapsed,
  onToggleSidebar,
  onLogout,
  userName = 'Arsalan Ahmed',
  userRole = 'Administrator',
  currentCompany = null,
  currentBranch = null,
  companies = [],
  branches = [],
  onContextChange
}) => {
  const { brand } = useTheme();
  const [showPopover, setShowPopover] = React.useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = React.useState('');
  const [selectedBranchId, setSelectedBranchId] = React.useState('');
  const [setAsDefault, setSetAsDefault] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isCurrentlyCollapsed = isCollapsed;
  if (isHovered && false) {
    console.log(isHovered);
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Business Partners', icon: Users },
    { id: 'products', label: 'Inventory', icon: Box },
    {
      id: 'sales',
      label: 'Sale',
      icon: FileText,
      isParent: true,
      subItems: [
        { id: 'invoices', label: 'Sale List', icon: FileText },
        { id: 'add-sale-invoice', label: 'Sale Invoice', icon: FilePlus },
        { id: 'return-invoice', label: 'Sale Return', icon: Undo2 },
        { id: 'add-service-invoice', label: 'Service Invoice', icon: FilePlus },
        { id: 'add-digital-invoice', label: 'Digital Invoice', icon: FilePlus }
      ]
    },
  ];

  const isSalesActive =
    activeView === 'invoices' ||
    activeView === 'return-invoice' ||
    activeView === 'add-invoice-v4';

  const [salesExpanded, setSalesExpanded] = React.useState(true);

  // Auto-expand if active view changes to a sale view
  React.useEffect(() => {
    if (isSalesActive) {
      setSalesExpanded(true);
    }
  }, [activeView, isSalesActive]);

  const handleMenuClick = (item: any) => {
    if (item.isParent) {
      if (isCurrentlyCollapsed) {
        if (activeView === 'dashboard') {
          onToggleSidebar();
        } else {
          setIsHovered(true);
        }
        setSalesExpanded(true);
      } else {
        setSalesExpanded(!salesExpanded);
      }
    } else {
      onViewChange(item.id);
    }
  };

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <motion.aside
      onMouseEnter={() => {
        if (activeView !== 'dashboard') {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (activeView !== 'dashboard') {
          setIsHovered(false);
        }
      }}
      initial={false}
      animate={{ width: isCurrentlyCollapsed ? 44 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen flex flex-col sticky top-0 flex-shrink-0 overflow-hidden z-50 transition-colors duration-300"
      style={{
        backgroundColor: brand.sidebarBg,
        borderRight: `1px solid ${brand.border}`,
      }}
    >
      {/* Logo / Toggle */}
      <div className={`py-6 flex items-center ${isCurrentlyCollapsed ? 'justify-center' : 'px-5 gap-2'}`}>
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

        {!isCurrentlyCollapsed && (
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
      <nav className={`flex-grow ${isCurrentlyCollapsed ? 'px-1.5' : 'px-2.5'} space-y-1.5 py-4 overflow-y-auto custom-scrollbar`}>
        {menuItems.map((item) => {
          if (item.isParent) {
            const isParentActive =
              activeView === 'invoices' ||
              activeView === 'return-invoice' ||
              activeView === 'add-invoice-v4';
            const isActive = isParentActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between ${isCurrentlyCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer`}
                  style={{
                    backgroundColor: isActive && isCurrentlyCollapsed ? brand.primary : 'transparent',
                    color: isActive && isCurrentlyCollapsed ? '#FFFFFF' : '#000000',
                  }}
                  title={isCurrentlyCollapsed ? item.label : ''}
                >
                  {isActive && isCurrentlyCollapsed && (
                    <div
                      className="absolute inset-0 rounded-xl z-0"
                      style={{
                        backgroundColor: brand.primary,
                      }}
                    />
                  )}
                  {isActive && !isCurrentlyCollapsed && (
                    <div
                      className="absolute inset-0 rounded-xl z-0"
                      style={{
                        backgroundColor: `${brand.primary}10`, // Soft background highlight for active parent when expanded
                      }}
                    />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <item.icon
                      className={`${isCurrentlyCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'}`}
                      style={{ color: isCurrentlyCollapsed && isActive ? '#FFFFFF' : (isActive ? brand.primary : '#000000') }}
                    />
                    {!isCurrentlyCollapsed && (
                      <span className="truncate font-semibold" style={{ color: isActive ? brand.primary : '#000000' }}>{item.label}</span>
                    )}
                  </div>
                  {!isCurrentlyCollapsed && (
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-200 relative z-10"
                      style={{
                        transform: salesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: isActive ? brand.primary : '#6b7280'
                      }}
                    />
                  )}
                </button>

                {!isCurrentlyCollapsed && (
                  <motion.div
                    initial={false}
                    animate={{ height: salesExpanded ? 'auto' : 0, opacity: salesExpanded ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-1"
                  >
                    {item.subItems.map((subItem) => {
                      let isSubActive = false;
                      if (subItem.id === 'invoices') {
                        isSubActive = activeView === 'invoices';
                      } else if (subItem.id === 'return-invoice') {
                        isSubActive = activeView === 'return-invoice';
                      } else if (subItem.id === 'add-sale-invoice') {
                        isSubActive = activeView === 'add-invoice-v4' && (invoiceType === 'Sale Invoice' || !invoiceType || (invoiceType !== 'Service Invoice' && invoiceType !== 'Digital Invoice'));
                      } else if (subItem.id === 'add-service-invoice') {
                        isSubActive = activeView === 'add-invoice-v4' && invoiceType === 'Service Invoice';
                      } else if (subItem.id === 'add-digital-invoice') {
                        isSubActive = activeView === 'add-invoice-v4' && invoiceType === 'Digital Invoice';
                      }

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onViewChange(subItem.id)}
                          className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all relative cursor-pointer text-left"
                          style={{
                            backgroundColor: isSubActive ? `${brand.primary}15` : 'transparent',
                            color: isSubActive ? brand.primary : '#4b5563',
                          }}
                        >
                          {isSubActive && (
                            <div
                              className="absolute left-4 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: brand.primary }}
                            />
                          )}
                          <span className="truncate">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          }

          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center ${isCurrentlyCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer`}
              style={{
                backgroundColor: isActive ? brand.primary : 'transparent',
                color: isActive ? '#FFFFFF' : '#000000',
              }}
              title={isCurrentlyCollapsed ? item.label : ''}
            >
              {isActive && !isCurrentlyCollapsed && (
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
                className={`${isCurrentlyCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'} relative z-10`}
                style={{ color: isActive ? '#FFFFFF' : '#000000' }}
              />
              {!isCurrentlyCollapsed && (
                <span className="relative z-10 truncate" style={{ color: isActive ? '#FFFFFF' : '#000000' }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div
        className={`py-4 space-y-1.5 ${isCurrentlyCollapsed ? 'px-1.5' : 'px-2.5'}`}
        style={{ borderTop: `1px solid ${brand.border}` }}
      >
        {bottomItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center ${isCurrentlyCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer`}
              style={{
                backgroundColor: isActive ? brand.primary : 'transparent',
                color: isActive ? '#FFFFFF' : '#000000',
              }}
              title={isCurrentlyCollapsed ? item.label : ''}
            >
              {isActive && !isCurrentlyCollapsed && (
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
                className={`${isCurrentlyCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'} relative z-10`}
                style={{ color: isActive ? '#FFFFFF' : '#000000' }}
              />
              {!isCurrentlyCollapsed && <span className="relative z-10 truncate" style={{ color: isActive ? '#FFFFFF' : '#000000' }}>{item.label}</span>}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCurrentlyCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'gap-2 px-3 py-2'} rounded-xl text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer`}
        >
          <LogOut className={`${isCurrentlyCollapsed ? 'w-[16px] h-[16px]' : 'w-4 h-4'}`} />
          {!isCurrentlyCollapsed && <span>Logout</span>}
        </button>

        {/* PROFILE CARD */}
        <div className="mt-4 pt-4 relative" style={{ borderTop: `1px solid ${brand.border}` }}>
          {isCurrentlyCollapsed ? (
            <button
              onClick={() => {
                if (currentCompany && currentBranch) {
                  setSelectedCompanyId(currentCompany.id);
                  setSelectedBranchId(currentBranch.id);
                  try {
                    const defCo = localStorage.getItem('default_company_id');
                    const defBr = localStorage.getItem('default_branch_id');
                    setSetAsDefault(defCo === currentCompany.id && defBr === currentBranch.id);
                  } catch {}
                }
                setShowPopover(!showPopover);
              }}
              className="w-full flex items-center justify-center p-1 rounded-xl transition-all cursor-pointer group"
            >
              {currentCompany?.logo ? (
                <img
                  src={currentCompany.logo}
                  alt={currentCompany.name}
                  className="w-7 h-7 rounded-xl object-contain border border-slate-100 bg-white shadow-lg shrink-0"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
                  }}
                >
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </button>
          ) : (
            <div className="w-full bg-slate-50/60 border border-slate-100/50 rounded-2xl p-2.5 shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all animate-fade-in">
              {/* Top Row: Avatar, Name & Role */}
              <button
                onClick={() => {
                  if (currentCompany && currentBranch) {
                    setSelectedCompanyId(currentCompany.id);
                    setSelectedBranchId(currentBranch.id);
                    try {
                      const defCo = localStorage.getItem('default_company_id');
                      const defBr = localStorage.getItem('default_branch_id');
                      setSetAsDefault(defCo === currentCompany.id && defBr === currentBranch.id);
                    } catch {}
                  }
                  setShowPopover(!showPopover);
                }}
                className="flex items-center gap-2 w-full text-left cursor-pointer group"
              >
                {currentCompany?.logo ? (
                  <img
                    src={currentCompany.logo}
                    alt={currentCompany.name}
                    className="w-7 h-7 rounded-xl object-contain border border-slate-100 bg-white shadow-md shrink-0 transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-extrabold text-[10px] shadow-md shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
                    }}
                  >
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className="text-left select-none min-w-0 flex-grow">
                  <p className="text-[12px] font-bold leading-tight text-slate-800 truncate" style={{ color: brand.textPrimary }}>{userName}</p>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider truncate">{userRole}</p>
                </div>
              </button>

              {/* Separator / Divider */}
              <div className="h-[1px] bg-slate-100 my-2" />

              {/* Bottom Row: Company & Branch Context selection */}
              <button
                onClick={() => {
                  if (currentCompany && currentBranch) {
                    setSelectedCompanyId(currentCompany.id);
                    setSelectedBranchId(currentBranch.id);
                    try {
                      const defCo = localStorage.getItem('default_company_id');
                      const defBr = localStorage.getItem('default_branch_id');
                      setSetAsDefault(defCo === currentCompany.id && defBr === currentBranch.id);
                    } catch {}
                  }
                  setShowPopover(!showPopover);
                }}
                className="w-full text-left cursor-pointer group select-none"
              >
                <p className="text-[11px] font-bold text-slate-700 leading-tight truncate group-hover:text-blue-600 transition-colors">{currentCompany?.name || 'Select Company'}</p>
                <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 truncate">{currentBranch?.name || 'Select Branch'}</p>
              </button>
            </div>
          )}

          {/* POPOVER OVERLAY */}
          {showPopover && (
            <>
              {/* Backdrop to close click outside */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setShowPopover(false)}
              />
              
              {/* Context Selector Popover */}
              <div
                className="fixed z-50 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 flex flex-col space-y-4"
                style={{
                  left: isCurrentlyCollapsed ? '54px' : '210px',
                  bottom: '20px'
                }}
              >
                {/* Profile Information Header */}
                <div className="flex items-center gap-3">
                  {currentCompany?.logo ? (
                    <img
                      src={currentCompany.logo}
                      alt={currentCompany.name}
                      className="w-7 h-7 rounded-xl object-contain border border-slate-100 bg-white shadow-md shrink-0"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-md shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
                      }}
                    >
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className="text-left">
                    <h4 className="text-[12px] font-bold text-slate-800 leading-tight">{userName}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{userRole}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 text-left space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Context</p>
                  <p className="text-[11px] font-bold text-slate-700 truncate">{currentCompany?.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 truncate">{currentBranch?.name}</p>
                </div>

                <hr className="border-slate-100" />

                {/* Company & Branch Selection */}
                <div className="text-left space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Company</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => {
                        const coId = e.target.value;
                        setSelectedCompanyId(coId);
                        const firstBr = branches.find(b => b.companyId === coId);
                        setSelectedBranchId(firstBr ? firstBr.id : '');
                      }}
                      className="w-full text-[12px] bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium text-slate-700 focus:border-blue-500"
                    >
                      {companies.filter(c => c.is_active).map(co => (
                        <option key={co.id} value={co.id}>{co.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Branch</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full text-[12px] bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium text-slate-700 focus:border-blue-500"
                    >
                      {branches.filter(b => b.companyId === selectedCompanyId).map(br => (
                        <option key={br.id} value={br.id}>{br.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Set as Default Toggle */}
                  <label className="flex items-center gap-2.5 pt-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={setAsDefault}
                      onChange={(e) => setSetAsDefault(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600 font-bold">Set As Default Company & Branch</span>
                  </label>
                </div>

                {/* Save changes Button */}
                <button
                  onClick={() => {
                    if (onContextChange && selectedCompanyId && selectedBranchId) {
                      onContextChange(selectedCompanyId, selectedBranchId, setAsDefault);
                    }
                    setShowPopover(false);
                  }}
                  className="w-full text-[12px] font-bold text-white py-2 rounded-xl text-center shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: brand.primary
                  }}
                >
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
