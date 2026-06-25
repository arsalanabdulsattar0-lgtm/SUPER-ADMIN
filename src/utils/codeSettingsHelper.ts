export interface EntityCodeSetting {
  mode: 'auto' | 'manual';
  prefix: string;
  nextNumber: number;
  padding: number;
  formatGrid?: {
    id: string;
    type: string;
    value: string;
    separator: string;
  }[];
  effectiveFrom?: string;
  effectiveTo?: string;
  allowManualEntry?: boolean;
  serialReset?: 'None' | 'Daily' | 'Monthly' | 'Yearly';

  // Draft settings
  draftFormatGrid?: {
    id: string;
    type: string;
    value: string;
    separator: string;
  }[];
  draftPrefix?: string;
  draftNextNumber?: number;
  draftPadding?: number;
  draftAllowManualEntry?: boolean;
  draftSerialReset?: 'None' | 'Daily' | 'Monthly' | 'Yearly';
  documentNoAsDraftNo?: boolean;
  taxType?: string;
  province?: string;
}

export interface BranchCodeSettings {
  sale_invoice: EntityCodeSetting;
  sale_return: EntityCodeSetting;
  service_invoice: EntityCodeSetting;
  digital_invoice: EntityCodeSetting;
  warehouse: EntityCodeSetting;
  salesperson: EntityCodeSetting;
  customer: EntityCodeSetting;
  product: EntityCodeSetting;
  branch: EntityCodeSetting;
  department: EntityCodeSetting;
  tax: EntityCodeSetting;

  quotation: EntityCodeSetting;
  delivery_challan: EntityCodeSetting;
  credit_note: EntityCodeSetting;
  debit_note: EntityCodeSetting;
  purchase_order: EntityCodeSetting;
  purchase_return: EntityCodeSetting;
  purchase_invoice: EntityCodeSetting;
  grn: EntityCodeSetting;
  supplier: EntityCodeSetting;
  stock_adjustment: EntityCodeSetting;
  employee: EntityCodeSetting;
  journal_voucher: EntityCodeSetting;
  receipt_voucher: EntityCodeSetting;
  payment_voucher: EntityCodeSetting;
  company: EntityCodeSetting;
  bp_adjustment: EntityCodeSetting;

  product_category: EntityCodeSetting;
  product_brand: EntityCodeSetting;
  product_unit: EntityCodeSetting;
  customer_group: EntityCodeSetting;
  customer_category: EntityCodeSetting;
  [key: string]: EntityCodeSetting;
}

export const DEFAULT_ENTITY_SETTINGS: Record<string, EntityCodeSetting> = {
  sale_invoice: { mode: 'auto', prefix: 'SI-', nextNumber: 1, padding: 5 },
  sale_return: { mode: 'auto', prefix: 'RTN-', nextNumber: 1, padding: 5 },
  service_invoice: { mode: 'auto', prefix: 'SRV-', nextNumber: 1, padding: 5 },
  digital_invoice: { mode: 'auto', prefix: 'DIG-', nextNumber: 1, padding: 5 },
  warehouse: { mode: 'auto', prefix: 'WH-', nextNumber: 1, padding: 5 },
  salesperson: { mode: 'auto', prefix: 'SP-', nextNumber: 1, padding: 5 },
  customer: { mode: 'auto', prefix: 'BP-', nextNumber: 1, padding: 5 },
  product: { mode: 'auto', prefix: 'PRD-', nextNumber: 1, padding: 5 },
  branch: { mode: 'auto', prefix: 'BR-', nextNumber: 1, padding: 5 },
  department: { mode: 'auto', prefix: 'HR', nextNumber: 1, padding: 5 },
  tax: { mode: 'auto', prefix: 'TX-', nextNumber: 1, padding: 5 },

  quotation: { mode: 'auto', prefix: 'QTN-', nextNumber: 1, padding: 5 },
  delivery_challan: { mode: 'auto', prefix: 'DC-', nextNumber: 1, padding: 5 },
  credit_note: { mode: 'auto', prefix: 'CN-', nextNumber: 1, padding: 5 },
  debit_note: { mode: 'auto', prefix: 'DN-', nextNumber: 1, padding: 5 },
  purchase_order: { mode: 'auto', prefix: 'PO-', nextNumber: 1, padding: 5 },
  purchase_return: { mode: 'auto', prefix: 'PRTN-', nextNumber: 1, padding: 5 },
  purchase_invoice: { mode: 'auto', prefix: 'PI-', nextNumber: 1, padding: 5 },
  grn: { mode: 'auto', prefix: 'GRN-', nextNumber: 1, padding: 5 },
  supplier: { mode: 'auto', prefix: 'SUP-', nextNumber: 1, padding: 5 },
  stock_adjustment: { mode: 'auto', prefix: 'SA-', nextNumber: 1, padding: 5 },
  employee: { mode: 'auto', prefix: 'EMP-', nextNumber: 1, padding: 5 },
  journal_voucher: { mode: 'auto', prefix: 'JV-', nextNumber: 1, padding: 5 },
  receipt_voucher: { mode: 'auto', prefix: 'RV-', nextNumber: 1, padding: 5 },
  payment_voucher: { mode: 'auto', prefix: 'PV-', nextNumber: 1, padding: 5 },
  company: { mode: 'auto', prefix: 'CO-', nextNumber: 1, padding: 5 },
  bp_adjustment: { mode: 'auto', prefix: 'BPA-', nextNumber: 1, padding: 5 },

  product_category: { mode: 'auto', prefix: 'CAT-', nextNumber: 1, padding: 5 },
  product_brand: { mode: 'auto', prefix: 'BRD-', nextNumber: 1, padding: 5 },
  product_unit: { mode: 'auto', prefix: 'UNT-', nextNumber: 1, padding: 5 },
  customer_group: { mode: 'auto', prefix: 'GRP-', nextNumber: 1, padding: 5 },
  customer_category: { mode: 'auto', prefix: 'CCAT-', nextNumber: 1, padding: 5 }
};

export const getCodeSettingsForBranch = (companyId: string, branchId: string): BranchCodeSettings => {
  const result: any = {};
  
  Object.keys(DEFAULT_ENTITY_SETTINGS).forEach(key => {
    result[key] = { ...DEFAULT_ENTITY_SETTINGS[key] };
  });

  try {
    const stored = localStorage.getItem('code_generation_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[companyId]) {
        const branchSettings = parsed[companyId][branchId] || {};
        const companyLevelSettings = parsed[companyId]['all'] || {};
        
        Object.keys(DEFAULT_ENTITY_SETTINGS).forEach(key => {
          result[key] = {
            ...result[key],
            ...(companyLevelSettings[key] || {}),
            ...(branchSettings[key] || {})
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to load code settings', e);
  }
  
  return result as BranchCodeSettings;
};

export const generateNextCode = (
  entityType: keyof BranchCodeSettings,
  companyId: string,
  branchId: string
): string => {
  const branchSettings = getCodeSettingsForBranch(companyId, branchId);
  const setting = branchSettings[entityType];
  if (!setting || setting.mode === 'manual') {
    return '';
  }
  const formattedNum = String(setting.nextNumber).padStart(setting.padding || 1, '0');
  return `${setting.prefix || ''}${formattedNum}`;
};

export const incrementNextCode = (
  entityType: keyof BranchCodeSettings,
  companyId: string,
  branchId: string
): void => {
  try {
    const stored = localStorage.getItem('code_generation_settings');
    const parsed = stored ? JSON.parse(stored) : {};
    
    if (!parsed[companyId]) parsed[companyId] = {};
    
    const hasBranchSpecific = parsed[companyId][branchId] && parsed[companyId][branchId][entityType];
    const hasCompanyLevel = parsed[companyId]['all'] && parsed[companyId]['all'][entityType];
    
    const targetBranchId = hasBranchSpecific ? branchId : (hasCompanyLevel ? 'all' : branchId);
    
    if (!parsed[companyId][targetBranchId]) {
      parsed[companyId][targetBranchId] = {};
    }
    
    const activeSetting = getCodeSettingsForBranch(companyId, branchId)[entityType];
    if (activeSetting) {
      activeSetting.nextNumber = Number(activeSetting.nextNumber || 1) + 1;
      parsed[companyId][targetBranchId][entityType] = activeSetting;
      localStorage.setItem('code_generation_settings', JSON.stringify(parsed));
    }
  } catch (e) {
    console.error('Failed to increment next code', e);
  }
};
