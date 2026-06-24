import React, { createContext, useContext, useState, useEffect } from 'react';
import { seedCompanies } from '../utils/settingsData';

export type ModuleId = 'dashboard' | 'customers' | 'products' | 'purchases' | 'sales' | 'settings' | 'help';

export type FunctionId = 
  | 'create_sale' | 'edit_sale' | 'delete_sale' | 'post_sale'
  | 'create_purchase' | 'edit_purchase' | 'delete_purchase' | 'post_purchase'
  | 'create_product' | 'edit_product'
  | 'create_customer' | 'edit_customer'
  | 'bp_list' | 'bp_ledger' | 'bp_adjustments'
  | 'product_list' | 'warehouses' | 'product_batches' | 'stock_adjustments'
  | 'purchase_list' | 'add_purchase_invoice' | 'purchase_return'
  | 'sale_list' | 'add_sale_invoice' | 'return_invoice' | 'add_service_invoice' | 'add_digital_invoice'
  | 'default_dashboard' | 'inventory_dashboard'
  | 'setting_profile' | 'setting_billing' | 'setting_appearance' | 'setting_tax' | 'setting_salesperson' 
  | 'setting_company' | 'setting_users' | 'setting_codes' | 'setting_products' | 'setting_warehouse' | 'setting_department';

export interface Package {
  id: string;
  name: string;
  allowedModules: ModuleId[];
  allowedFunctions: FunctionId[];
}

export interface CompanyPermission {
  companyId: string;
  packageId: string;
  moduleOverrides: Record<ModuleId, boolean>; // true = force enable, false = force disable
  functionOverrides: Record<FunctionId, boolean>;
}

interface PermissionContextType {
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  companyPermissions: CompanyPermission[];
  setCompanyPermissions: React.Dispatch<React.SetStateAction<CompanyPermission[]>>;
  
  // Helpers for main app
  isModuleEnabled: (companyId: string, moduleId: ModuleId) => boolean;
  isFunctionEnabled: (companyId: string, functionId: FunctionId) => boolean;
  
  // Helpers for super admin
  updateCompanyPackage: (companyId: string, packageId: string) => void;
  toggleCompanyModuleOverride: (companyId: string, moduleId: ModuleId, enabled: boolean | null) => void;
  toggleCompanyFunctionOverride: (companyId: string, functionId: FunctionId, enabled: boolean | null) => void;
}

const defaultPackages: Package[] = [
  {
    id: 'pkg-basic',
    name: 'Basic Plan',
    allowedModules: ['dashboard', 'customers', 'sales', 'settings', 'help'],
    allowedFunctions: ['create_sale', 'edit_sale', 'post_sale', 'create_customer', 'default_dashboard']
  },
  {
    id: 'pkg-standard',
    name: 'Standard Plan',
    allowedModules: ['dashboard', 'customers', 'sales', 'purchases', 'products', 'settings', 'help'],
    allowedFunctions: [
      'create_sale', 'edit_sale', 'post_sale', 'create_customer', 'edit_customer',
      'create_purchase', 'edit_purchase', 'post_purchase', 'create_product',
      'default_dashboard', 'inventory_dashboard'
    ]
  },
  {
    id: 'pkg-enterprise',
    name: 'Enterprise Plan',
    allowedModules: ['dashboard', 'customers', 'products', 'purchases', 'sales', 'settings', 'help'],
    allowedFunctions: [
      'create_sale', 'edit_sale', 'delete_sale', 'post_sale',
      'create_purchase', 'edit_purchase', 'delete_purchase', 'post_purchase',
      'create_product', 'edit_product',
      'create_customer', 'edit_customer',
      'bp_list', 'bp_ledger', 'bp_adjustments',
      'product_list', 'warehouses', 'product_batches', 'stock_adjustments',
      'purchase_list', 'add_purchase_invoice', 'purchase_return',
      'sale_list', 'add_sale_invoice', 'return_invoice', 'add_service_invoice', 'add_digital_invoice',
      'default_dashboard', 'inventory_dashboard',
      'setting_profile', 'setting_billing', 'setting_appearance', 'setting_tax', 'setting_salesperson',
      'setting_company', 'setting_users', 'setting_codes', 'setting_products', 'setting_warehouse', 'setting_department'
    ]
  }
];

export const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem('sa_packages');
    return saved ? JSON.parse(saved) : defaultPackages;
  });

  const [companyPermissions, setCompanyPermissions] = useState<CompanyPermission[]>(() => {
    const saved = localStorage.getItem('sa_company_permissions');
    if (saved) return JSON.parse(saved);
    
    // Default assignments: assign pkg-standard to all seed companies initially
    return seedCompanies.map(c => ({
      companyId: c.id,
      packageId: 'pkg-standard',
      moduleOverrides: {} as Record<ModuleId, boolean>,
      functionOverrides: {} as Record<FunctionId, boolean>
    }));
  });

  useEffect(() => {
    localStorage.setItem('sa_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('sa_company_permissions', JSON.stringify(companyPermissions));
  }, [companyPermissions]);

  const isModuleEnabled = (companyId: string, moduleId: ModuleId) => {
    const cp = companyPermissions.find(p => p.companyId === companyId);
    if (!cp) return false;

    // Check overrides first
    if (cp.moduleOverrides[moduleId] !== undefined && cp.moduleOverrides[moduleId] !== null) {
      return cp.moduleOverrides[moduleId];
    }

    // Fallback to package defaults
    const pkg = packages.find(p => p.id === cp.packageId);
    return pkg ? pkg.allowedModules.includes(moduleId) : false;
  };

  const isFunctionEnabled = (companyId: string, functionId: FunctionId) => {
    const cp = companyPermissions.find(p => p.companyId === companyId);
    if (!cp) return false;

    // Check overrides first
    if (cp.functionOverrides[functionId] !== undefined && cp.functionOverrides[functionId] !== null) {
      return cp.functionOverrides[functionId];
    }

    // Fallback to package defaults
    const pkg = packages.find(p => p.id === cp.packageId);
    return pkg ? pkg.allowedFunctions.includes(functionId) : false;
  };

  const updateCompanyPackage = (companyId: string, packageId: string) => {
    setCompanyPermissions(prev => prev.map(cp => 
      cp.companyId === companyId ? { ...cp, packageId, moduleOverrides: {} as any, functionOverrides: {} as any } : cp
    ));
  };

  const toggleCompanyModuleOverride = (companyId: string, moduleId: ModuleId, enabled: boolean | null) => {
    setCompanyPermissions(prev => prev.map(cp => {
      if (cp.companyId !== companyId) return cp;
      const newOverrides = { ...cp.moduleOverrides };
      if (enabled === null) delete newOverrides[moduleId];
      else newOverrides[moduleId] = enabled;
      return { ...cp, moduleOverrides: newOverrides };
    }));
  };

  const toggleCompanyFunctionOverride = (companyId: string, functionId: FunctionId, enabled: boolean | null) => {
    setCompanyPermissions(prev => prev.map(cp => {
      if (cp.companyId !== companyId) return cp;
      const newOverrides = { ...cp.functionOverrides };
      if (enabled === null) delete newOverrides[functionId];
      else newOverrides[functionId] = enabled;
      return { ...cp, functionOverrides: newOverrides };
    }));
  };

  return (
    <PermissionContext.Provider value={{
      packages, setPackages, companyPermissions, setCompanyPermissions,
      isModuleEnabled, isFunctionEnabled,
      updateCompanyPackage, toggleCompanyModuleOverride, toggleCompanyFunctionOverride
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within PermissionProvider');
  return context;
};
