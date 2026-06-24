import React, { useState } from 'react';
import { usePermissions, type ModuleId, type FunctionId } from '../context/PermissionContext';
import { seedCompanies } from '../utils/settingsData';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/FormControls';
import { Input } from '../components/ui/Input';
import { Plus, AlertCircle, Package as PackageIcon, CheckCircle2, Box, Settings, Building2, User, Lock, Mail, Phone, MapPin, Shield, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  defaultTab?: 'dashboard' | 'companies' | 'packages' | 'add-company';
}

const SuperAdminDashboard: React.FC<Props> = ({ defaultTab = 'dashboard' }) => {
  const { brand } = useTheme();
  const { 
    packages, companyPermissions, 
    updateCompanyPackage, toggleCompanyModuleOverride, toggleCompanyFunctionOverride,
    isModuleEnabled
  } = usePermissions();

  const [activeTab, setActiveTab] = useState(defaultTab === 'dashboard' ? 'companies' : defaultTab === 'add-company' ? 'companies' : defaultTab);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(seedCompanies[0]?.id || '');
  const [isCreatingCompany, setIsCreatingCompany] = useState(defaultTab === 'add-company');

  React.useEffect(() => {
    if (defaultTab === 'add-company') {
      setIsCreatingCompany(true);
      setActiveTab('companies');
    } else if (defaultTab === 'companies') {
      setIsCreatingCompany(false);
      setActiveTab('companies');
    } else if (defaultTab !== 'dashboard') {
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
    { id: 'help', label: 'Help' }
  ];

  const allFunctions: { id: FunctionId; label: string; module: ModuleId }[] = [
    // Customers
    { id: 'bp_list', label: 'Business Partner List', module: 'customers' },
    { id: 'bp_ledger', label: 'Business Partner Ledger', module: 'customers' },
    { id: 'bp_adjustments', label: 'Business Partner Adjustment', module: 'customers' },
    { id: 'create_customer', label: 'Create Customer (Action)', module: 'customers' },
    { id: 'edit_customer', label: 'Edit Customer (Action)', module: 'customers' },
    
    // Products
    { id: 'product_list', label: 'Product List', module: 'products' },
    { id: 'warehouses', label: 'Product Warehouses', module: 'products' },
    { id: 'product_batches', label: 'Product Batches', module: 'products' },
    { id: 'stock_adjustments', label: 'Stock Adjustment', module: 'products' },
    { id: 'create_product', label: 'Create Product (Action)', module: 'products' },
    { id: 'edit_product', label: 'Edit Product (Action)', module: 'products' },

    // Purchases
    { id: 'purchase_list', label: 'Purchase List', module: 'purchases' },
    { id: 'add_purchase_invoice', label: 'Purchase Invoice', module: 'purchases' },
    { id: 'purchase_return', label: 'Purchase Return', module: 'purchases' },
    { id: 'create_purchase', label: 'Create Purchase (Action)', module: 'purchases' },
    { id: 'post_purchase', label: 'Post Purchase (Action)', module: 'purchases' },

    // Sales
    { id: 'sale_list', label: 'Sale List', module: 'sales' },
    { id: 'add_sale_invoice', label: 'Sale Invoice', module: 'sales' },
    { id: 'return_invoice', label: 'Sale Return', module: 'sales' },
    { id: 'add_service_invoice', label: 'Service Invoice', module: 'sales' },
    { id: 'add_digital_invoice', label: 'Digital Invoice', module: 'sales' },
    { id: 'create_sale', label: 'Create Sale (Action)', module: 'sales' },
    { id: 'post_sale', label: 'Post Sale (Action)', module: 'sales' },
    
    // Dashboard
    { id: 'default_dashboard', label: 'Default Dashboard', module: 'dashboard' },
    { id: 'inventory_dashboard', label: 'Inventory Operations Dashboard', module: 'dashboard' },
    
    // Settings
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

  const renderCompanies = () => {
    const cp = companyPermissions.find(p => p.companyId === selectedCompanyId);
    if (!cp) return null;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-300">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-500" />
              Manage Companies
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage company access, module overrides, and subscription packages</p>
          </div>
          <Button variant="primary" icon={Plus} className="" onClick={() => setIsCreatingCompany(true)}>Add New Company</Button>
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

                  {/* Functions for this module */}
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

  const renderCreateCompanyForm = () => {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCreatingCompany(false)}
            className="p-2 bg-white border border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-500" />
              Create New Company
            </h2>
            <p className="text-slate-500 text-sm mt-1">Setup a new company profile, initial admin user, and subscription package.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Details */}
          <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-300 bg-slate-50/50 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Company Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input label="Company Name" placeholder="Enter company name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                  <Select className="w-full" options={[
                    { value: 'retail', label: 'Retail' },
                    { value: 'wholesale', label: 'Wholesale' },
                    { value: 'manufacturing', label: 'Manufacturing' },
                    { value: 'services', label: 'Services' }
                  ]} />
                </div>
                <div>
                  <Input label="NTN Number" placeholder="1234567-8" />
                </div>
                <div>
                  <Input label="Contact Number" placeholder="+92 300 1234567" icon={Phone} />
                </div>
                <div>
                  <Input label="Company Email" type="email" placeholder="info@company.com" icon={Mail} />
                </div>
                <div className="col-span-2">
                  <Input label="Business Address" placeholder="Enter full address" icon={MapPin} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Admin User Details */}
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-300 bg-slate-50/50 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800">Initial Admin Account</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 mb-4 bg-emerald-50 text-emerald-700 p-2 rounded-md border border-emerald-100 flex items-start gap-1.5">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  This user will have full access to all assigned modules for this company. They can later create additional users.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input label="Admin Full Name" placeholder="e.g. John Doe" />
                  </div>
                  <div className="col-span-2">
                    <Input label="Email Address" type="email" placeholder="admin@company.com" icon={Mail} />
                  </div>
                  <div>
                    <Input label="Username" placeholder="admin_user" />
                  </div>
                  <div>
                    <Input label="Password" type="password" placeholder="••••••••" icon={Lock} />
                  </div>
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden relative group">
              <div className="px-6 py-4 border-b border-slate-300 bg-slate-50/50 flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-slate-800">Subscription Package</h3>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Initial Package</label>
                <Select 
                  className="w-full"
                  options={packages.map(p => ({ value: p.id, label: p.name }))}
                />
                <p className="text-xs text-slate-500 mt-3">
                  This will determine which modules and functions the company can access initially. You can override specific functions from the 'Manage Companies' view later.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/10 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 mt-6">
          <Button variant="outline" onClick={() => setIsCreatingCompany(false)}>Cancel</Button>
          <Button variant="primary" icon={Plus}>Create Company & Admin</Button>
        </div>
      </div>
    );
  };

  const renderPackages = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-300">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <PackageIcon className="w-6 h-6 text-violet-500" />
              Subscription Packages
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage pricing tiers, module access, and system features</p>
          </div>
          <Button variant="primary" icon={Plus} className="">Create Package</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white p-6 rounded-xl border border-slate-300 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-100">
                    <PackageIcon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{pkg.name}</h3>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Box className="w-3.5 h-3.5" />
                      {pkg.allowedModules.length} Modules Included
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow mb-6 mt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Enabled Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.allowedModules.map(m => (
                    <span key={m} className="px-2.5 py-1 bg-slate-50 text-slate-700 text-[13px] font-medium rounded border border-slate-300/60">
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" icon={Settings} className="w-full text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50">Edit Package</Button>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Tab Navigation if accessed as 'dashboard' */}
      {defaultTab === 'dashboard' && !isCreatingCompany && (
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

      {isCreatingCompany ? (
        renderCreateCompanyForm()
      ) : (
        <>
          {activeTab === 'companies' || defaultTab === 'companies' ? renderCompanies() : null}
          {activeTab === 'packages' || defaultTab === 'packages' ? renderPackages() : null}
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
