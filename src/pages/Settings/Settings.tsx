import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Palette, Receipt, Users, Building2, Shield, Package, Warehouse, Printer,
  ChevronDown, Settings2, X, Binary, FolderOpen
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Import child modules
import { ProfileModule } from './components/ProfileModule';
import { BillingModule } from './components/BillingModule';
import { AppearanceModule } from './components/AppearanceModule';
import { TaxSetupModule } from './components/TaxSetupModule';
import { SalesPersonModule } from './components/SalesPersonModule';
import { CompanyModule } from './components/CompanyModule';
import { UserManagementModule } from './components/UserManagementModule';
import { ProductSetupModule } from './components/ProductSetupModule';
import { WarehouseModule } from './components/WarehouseModule';
import { PrintTemplatesModule } from './components/PrintTemplatesModule';
import { CodeSettingsModule } from './components/CodeSettingsModule';
import { DepartmentModule } from './components/DepartmentModule';

// Re-export types
export type { TaxSetup } from './components/TaxSetupModule';
export type { SalesPerson } from './components/SalesPersonModule';
export type { Company } from './components/CompanyModule';
export type { Warehouse } from './components/WarehouseModule';

// ─── Main Settings component ──────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { theme: activeTheme, setTheme, brand } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'profile',         title: 'Profile Settings',  desc: 'Manage your public profile and avatar.',                                    icon: User },
    { id: 'billing',         title: 'Billing & Plans',   desc: 'Manage your subscription and payment methods.',                             icon: CreditCard },
    { id: 'appearance',      title: 'Appearance',        desc: 'Customize the look and feel of the app.',                                   icon: Palette },
    { id: 'tax',             title: 'Tax Setup',         desc: 'Manage tax codes, types, rates, and provinces.',                            icon: Receipt },
    { id: 'sales',           title: 'Salesperson',       desc: 'Manage salespersons, targets, and commissions.',                            icon: Users },
    { id: 'company',         title: 'Company',           desc: 'Manage company profiles, NTN, STN, PRAL tokens and contacts.',              icon: Building2 },
    { id: 'users',           title: 'User Management',   desc: 'Manage user access, roles, allowed IPs, and company assignments.',          icon: Shield },
    { id: 'code-settings',   title: 'Code Settings',     desc: 'Manage document fields visibility, auto/manual numbering sequences, and formatting grids.', icon: Binary },
    { id: 'product',         title: 'Product Setup',     desc: 'Configure product setup types, serial prefixes, and lookup values.',        icon: Package },
    { id: 'warehouse',       title: 'Warehouse',         desc: 'Manage warehouses, storage locations and inventory distribution.',          icon: Warehouse },
    { id: 'print-templates', title: 'Print Templates',   desc: 'Create and manage customizable print layouts for invoices and documents.',  icon: Printer },
    { id: 'department',      title: 'Department Settings', desc: 'Manage departments used throughout the ERP system.', icon: FolderOpen },
  ];

  const renderModule = (id: string) => {
    switch (id) {
      case 'profile':         return <ProfileModule brand={brand} />;
      case 'billing':         return <BillingModule brand={brand} />;
      case 'appearance':      return <AppearanceModule brand={brand} activeTheme={activeTheme} setTheme={setTheme} />;
      case 'tax':             return <TaxSetupModule brand={brand} />;
      case 'sales':           return <SalesPersonModule brand={brand} />;
      case 'company':         return <CompanyModule brand={brand} />;
      case 'users':           return <UserManagementModule brand={brand} />;
      case 'product':         return <ProductSetupModule brand={brand} />;
      case 'warehouse':       return <WarehouseModule brand={brand} />;
      case 'print-templates': return <PrintTemplatesModule brand={brand} />;
      case 'code-settings':   return <CodeSettingsModule brand={brand} onClose={() => setActiveSection(null)} />;
      case 'department':      return <DepartmentModule brand={brand} />;
      default:                return null;
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="flex flex-col p-6 h-full" style={{ backgroundColor: brand.mainBg }}>

      {/* Master collapsible card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden flex flex-col flex-1"
        style={{
          backgroundColor: brand.cardBg,
          border: `1px solid ${isOpen ? brand.primary : '#E2E8F0'}`,
          boxShadow: isOpen ? `0 8px 32px ${brand.primary}18` : '0 1px 4px #0000000a',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* ── Master Card Header ── */}
        <div className="flex items-center gap-4 px-6 py-5">

          {/* Icon + Title — clickable to open/close */}
          <button
            onClick={() => {
              if (!isOpen) { setIsOpen(true); return; }
              // if form open, close form first; else collapse master
              if (activeSection) { setActiveSection(null); } else { setIsOpen(false); }
            }}
            className="flex items-center gap-4 flex-grow text-left cursor-pointer group"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                background: isOpen
                  ? `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`
                  : brand.surface,
                color: isOpen ? '#ffffff' : brand.textPrimary,
              }}
            >
              {currentSection
                ? React.createElement(currentSection.icon, { className: 'w-5 h-5' })
                : <Settings2 className="w-5 h-5" />}
            </div>

            <div className="flex-grow min-w-0">
              <h1
                className="text-lg font-black tracking-tight transition-colors duration-200"
                style={{ color: isOpen ? brand.primary : brand.textPrimary }}
              >
                {currentSection ? currentSection.title : 'Settings'}
              </h1>
              <p className="text-[12px] font-medium text-slate-400 mt-0.5 truncate">
                {currentSection ? currentSection.desc : 'Configure your account preferences and application settings.'}
              </p>
            </div>
          </button>

          {/* Right side: × when form open, chevron otherwise */}
          <AnimatePresence mode="wait">
            {activeSection ? (
              <motion.button
                key="close"
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveSection(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-red-50"
                style={{ color: '#EF4444' }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                key="chevron"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(prev => !prev)}
                className="shrink-0 cursor-pointer"
                style={{ color: isOpen ? brand.primary : '#CBD5E1' }}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Collapsible Body ── */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="body"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div style={{ borderTop: `1px solid ${brand.border}`, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

                {/* ── Inner content: Grid OR Module Form ── */}
                <AnimatePresence mode="wait">

                  {/* MODULE FORM VIEW */}
                  {activeSection ? (
                    <motion.div
                      key={`form-${activeSection}`}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="p-6 pb-6 flex-1 flex flex-col overflow-hidden settings-module-container"
                      style={{ minHeight: 0 }}
                    >
                      {renderModule(activeSection)}
                    </motion.div>
                  ) : (

                  /* CARDS GRID VIEW */
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="p-5 flex-1 overflow-y-auto custom-scrollbar"
                      style={{ minHeight: 0 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sections.map((section, i) => {
                          const IconComponent = section.icon;
                          return (
                            <motion.button
                              key={section.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() => setActiveSection(section.id)}
                              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left cursor-pointer transition-all duration-200 group hover:scale-[1.01]"
                              style={{
                                backgroundColor: brand.surface,
                                border: `1px solid #E2E8F0`,
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                                style={{
                                  backgroundColor: brand.cardBg,
                                  color: brand.textSecondary,
                                  boxShadow: '0 1px 4px #0000000f',
                                }}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>

                              <div className="flex-grow min-w-0">
                                <h3
                                  className="text-[13px] font-bold transition-colors duration-200 group-hover:text-blue-600"
                                  style={{ color: brand.textPrimary }}
                                >
                                  {section.title}
                                </h3>
                                <p className="text-[11px] mt-0.5 truncate" style={{ color: brand.textSecondary }}>
                                  {section.desc}
                                </p>
                              </div>

                              <ChevronDown
                                className="w-3.5 h-3.5 shrink-0 -rotate-90"
                                style={{ color: '#CBD5E1' }}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default Settings;
