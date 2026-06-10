import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Palette, Receipt, Users, Building2, Shield, Package, Warehouse,
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

// Re-export types imported from separate modules (for settingsData.ts and other consumers)
export type { TaxSetup } from './components/TaxSetupModule';
export type { SalesPerson } from './components/SalesPersonModule';
export type { Company } from './components/CompanyModule';
export type { Warehouse } from './components/WarehouseModule';

// ─── Main Settings component ──────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { theme: activeTheme, setTheme, brand } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'profile', title: 'Profile Settings', desc: 'Manage your public profile and avatar.', icon: User },
    { id: 'billing', title: 'Billing & Plans', desc: 'Manage your subscription and payment methods.', icon: CreditCard },
    { id: 'appearance', title: 'Appearance', desc: 'Customize the look and feel of the app.', icon: Palette },
    { id: 'tax', title: 'Tax Setup', desc: 'Manage tax codes, types, rates, and provinces.', icon: Receipt },
    { id: 'sales', title: 'Salesperson', desc: 'Manage salespersons, targets, and commissions.', icon: Users },
    { id: 'company', title: 'Company', desc: 'Manage company profiles, NTN, STN, PRAL tokens and contacts.', icon: Building2 },
    { id: 'users', title: 'User Management', desc: 'Manage user access, roles, allowed IPs, and company assignments.', icon: Shield },
    { id: 'product', title: 'Product Setup', desc: 'Configure product setup types, serial prefixes, and lookup values.', icon: Package },
    { id: 'warehouse', title: 'Warehouse', desc: 'Manage warehouses, storage locations and inventory distribution.', icon: Warehouse },
  ];

  const toggle = (id: string) =>
    setActiveSection(prev => (prev === id ? null : id));

  return (
    <div className="min-h-full p-6 space-y-5" style={{ backgroundColor: brand.mainBg }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>
            Settings
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            Configure your account preferences and application settings.
          </p>
        </div>
      </motion.div>

      {/* Grid of section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => {
          const isActive = activeSection === section.id;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(section.id)}
              className="flex items-center gap-6 p-6 rounded-xl transition-all cursor-pointer group"
              style={{
                backgroundColor: brand.cardBg,
                border: `1px solid ${isActive ? brand.primary : '#E2E8F0'}`,
                boxShadow: 'none',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  backgroundColor: isActive ? brand.primary : brand.surface,
                  color: isActive ? '#FFFFFF' : '#000000',
                }}
              >
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold transition-colors" style={{ color: isActive ? brand.primary : '#000000' }}>
                  {section.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: '#475569' }}>{section.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Active Panel Display ── */}
      <AnimatePresence mode="wait">
        {activeSection && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: brand.cardBg, border: '1px solid #E2E8F0', boxShadow: 'none' }}
          >
            {/* Header portion dynamically based on active section */}
            {(() => {
              const currentSection = sections.find(s => s.id === activeSection);
              if (!currentSection) return null;
              const IconComponent = currentSection.icon;

              // Override title and desc for appearance to preserve original branding wording
              const title = currentSection.id === 'appearance' ? 'Theme & Branding Selector' : currentSection.title;
              const desc = currentSection.id === 'appearance' ? 'Select a palette to instantly style the entire application.' : currentSection.desc;

              return (
                <div className="px-6 py-5 border-b" style={{ borderColor: brand.border, background: `linear-gradient(135deg, ${brand.surface}, ${brand.cardBg})` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: brand.primary }}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: brand.textPrimary }}>{title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: brand.textSecondary }}>{desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Content portion */}
            <div className="p-6">
              {activeSection === 'profile' && <ProfileModule brand={brand} />}
              {activeSection === 'billing' && <BillingModule brand={brand} />}
              {activeSection === 'appearance' && (
                <AppearanceModule
                  brand={brand}
                  activeTheme={activeTheme}
                  setTheme={setTheme}
                />
              )}
              {activeSection === 'tax' && <TaxSetupModule brand={brand} />}
              {activeSection === 'sales' && <SalesPersonModule brand={brand} />}
              {activeSection === 'company' && <CompanyModule brand={brand} />}
              {activeSection === 'users' && <UserManagementModule brand={brand} />}
              {activeSection === 'product' && <ProductSetupModule brand={brand} />}
              {activeSection === 'warehouse' && <WarehouseModule brand={brand} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;
