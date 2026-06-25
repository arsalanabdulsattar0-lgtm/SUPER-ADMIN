import React, { useState } from 'react';
import { usePermissions, type ModuleId, type FunctionId } from '../context/PermissionContext';
import { seedCompanies } from '../utils/settingsData';
import { Select } from '../components/ui/FormControls';
import { AlertCircle, Package as PackageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CompanyModule } from './ManageCompany/CompanyModule';
import { PackagesModule } from './ManagePackages/PackagesModule';

interface Props {
  defaultTab?: 'dashboard' | 'companies' | 'packages' | 'company-module';
}

const SuperAdminDashboard: React.FC<Props> = ({ defaultTab = 'dashboard' }) => {
  const { brand } = useTheme();
  const { 
    packages, companyPermissions, 
    updateCompanyPackage, toggleCompanyModuleOverride, toggleCompanyFunctionOverride,
    isModuleEnabled
  } = usePermissions();

  const [activeTab, setActiveTab] = useState(defaultTab === 'dashboard' ? 'companies' : defaultTab);

  React.useEffect(() => {
    if (defaultTab !== 'dashboard') {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const allModules: { id: ModuleId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'customers', label: 'Business Partners' },
    { id: 'products', label: 'Inventory' },
    { id: 'purchases', label: 'Purchases' },
    { id: 'sales', label: 'Sales' },
    { id: 'settings', label: 'Settings' },
    { id: 'help', label: 'Help' },
    { id: 'ai_bar', label: 'AI Bar' }
  ];

  const allFunctions: { id: FunctionId; label: string; module: ModuleId }[] = [
    { id: 'bp_list', label: 'Business Partner List', module: 'customers' },
    { id: 'bp_ledger', label: 'Business Partner Ledger', module: 'customers' },
    { id: 'bp_adjustments', label: 'Business Partner Adjustment', module: 'customers' },
    { id: 'create_customer', label: 'Create Customer (Action)', module: 'customers' },
    { id: 'edit_customer', label: 'Edit Customer (Action)', module: 'customers' },
    { id: 'product_list', label: 'Product List', module: 'products' },
    { id: 'warehouses', label: 'Product Warehouses', module: 'products' },
    { id: 'product_batches', label: 'Product Batches', module: 'products' },
    { id: 'stock_adjustments', label: 'Stock Adjustment', module: 'products' },
    { id: 'create_product', label: 'Create Product (Action)', module: 'products' },
    { id: 'edit_product', label: 'Edit Product (Action)', module: 'products' },
    { id: 'purchase_list', label: 'Purchase List', module: 'purchases' },
    { id: 'add_purchase_invoice', label: 'Purchase Invoice', module: 'purchases' },
    { id: 'purchase_return', label: 'Purchase Return', module: 'purchases' },
    { id: 'create_purchase', label: 'Create Purchase (Action)', module: 'purchases' },
    { id: 'post_purchase', label: 'Post Purchase (Action)', module: 'purchases' },
    { id: 'sale_list', label: 'Sale List', module: 'sales' },
    { id: 'add_sale_invoice', label: 'Sale Invoice', module: 'sales' },
    { id: 'return_invoice', label: 'Sale Return', module: 'sales' },
    { id: 'add_service_invoice', label: 'Service Invoice', module: 'sales' },
    { id: 'add_digital_invoice', label: 'Digital Invoice', module: 'sales' },
    { id: 'create_sale', label: 'Create Sale (Action)', module: 'sales' },
    { id: 'post_sale', label: 'Post Sale (Action)', module: 'sales' },
    { id: 'default_dashboard', label: 'Default Dashboard', module: 'dashboard' },
    { id: 'inventory_dashboard', label: 'Inventory Operations Dashboard', module: 'dashboard' },
    { id: 'setting_profile', label: 'Profile Settings', module: 'settings' },
    { id: 'setting_billing', label: 'Billing & Plans', module: 'settings' },
    { id: 'setting_appearance', label: 'Appearance', module: 'settings' },
    { id: 'setting_tax', label: 'Tax Setup', module: 'settings' },
    { id: 'setting_salesperson', label: 'Salesperson', module: 'settings' },
    { id: 'setting_company', label: 'Company Profile', module: 'settings' },
    { id: 'setting_users', label: 'User Management', module: 'settings' },
    { id: 'setting_codes', label: 'Code Settings', module: 'settings' },
    { id: 'setting_products', label: 'Product Setup', module: 'settings' },
    { id: 'setting_warehouse', label: 'Warehouse Setup', module: 'settings' },
    { id: 'setting_department', label: 'Department Settings', module: 'settings' },
  ];

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(seedCompanies[0]?.id || '');

  const renderCompanies = () => {
    const cp = companyPermissions.find(p => p.companyId === selectedCompanyId);
    if (!cp) return null;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-300">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <PackageIcon className="w-6 h-6 text-blue-500" />
              Manage Companies
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage company access, module overrides, and subscription packages</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
            <Select 
              value={selectedCompanyId} 
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="w-full"
              options={seedCompanies.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Package</label>
            <Select 
              value={cp.packageId} 
              onChange={e => updateCompanyPackage(selectedCompanyId, e.target.value)}
              className="w-full"
              options={packages.map(p => ({ value: p.id, label: p.name }))}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Module & Function Overrides</h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> 
              Overrides bypass the assigned package
            </span>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {allModules.map(mod => {
              const packageAllows = packages.find(p => p.id === cp.packageId)?.allowedModules.includes(mod.id);
              const override = cp.moduleOverrides[mod.id];
              const isEnabled = isModuleEnabled(selectedCompanyId, mod.id);

              return (
                <div key={mod.id} className="border border-slate-300 rounded-lg p-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">{mod.label} Module</h4>
                    <div className="flex items-center gap-2">
                      <select 
                        className="text-xs border-gray-200 rounded px-2 py-1"
                        value={override === undefined ? 'default' : override ? 'force_on' : 'force_off'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'default') toggleCompanyModuleOverride(selectedCompanyId, mod.id, null);
                          else if (val === 'force_on') toggleCompanyModuleOverride(selectedCompanyId, mod.id, true);
                          else toggleCompanyModuleOverride(selectedCompanyId, mod.id, false);
                        }}
                      >
                        <option value="default">Default ({packageAllows ? 'ON' : 'OFF'})</option>
                        <option value="force_on">Force ON</option>
                        <option value="force_off">Force OFF</option>
                      </select>
                    </div>
                  </div>

                  {isEnabled && (
                    <div className="pl-4 border-l-2 border-slate-300 space-y-2 mt-2">
                      {allFunctions.filter(f => f.module === mod.id).map(func => {
                        const funcOverride = cp.functionOverrides[func.id];
                        const pkgFuncAllows = packages.find(p => p.id === cp.packageId)?.allowedFunctions.includes(func.id);
                        return (
                          <div key={func.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{func.label}</span>
                            <select 
                              className="text-xs border-gray-200 rounded px-1 py-0.5"
                              value={funcOverride === undefined ? 'default' : funcOverride ? 'force_on' : 'force_off'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'default') toggleCompanyFunctionOverride(selectedCompanyId, func.id, null);
                                else if (val === 'force_on') toggleCompanyFunctionOverride(selectedCompanyId, func.id, true);
                                else toggleCompanyFunctionOverride(selectedCompanyId, func.id, false);
                              }}
                            >
                              <option value="default">Def ({pkgFuncAllows ? 'ON' : 'OFF'})</option>
                              <option value="force_on">ON</option>
                              <option value="force_off">OFF</option>
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {!isEnabled && (
                    <div className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">
                      Module is disabled. All internal functions are hidden.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className={`w-full mx-auto ${activeTab === 'company-module' ? 'h-full' : 'space-y-6 pb-20'}`}>
      {defaultTab === 'dashboard' && activeTab !== 'company-module' && (
        <div className="flex gap-4 border-b border-gray-200">
          <button 
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'companies' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={{ borderColor: activeTab === 'companies' ? brand.primary : 'transparent', color: activeTab === 'companies' ? brand.primary : undefined }}
            onClick={() => setActiveTab('companies')}
          >
            Manage Companies
          </button>
          <button 
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'packages' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={{ borderColor: activeTab === 'packages' ? brand.primary : 'transparent', color: activeTab === 'packages' ? brand.primary : undefined }}
            onClick={() => setActiveTab('packages')}
          >
            Manage Packages
          </button>
        </div>
      )}

      {activeTab === 'company-module' ? (
        <CompanyModule brand={brand} />
      ) : activeTab === 'companies' ? renderCompanies() : <PackagesModule />}
    </div>
  );
};

export default SuperAdminDashboard;
