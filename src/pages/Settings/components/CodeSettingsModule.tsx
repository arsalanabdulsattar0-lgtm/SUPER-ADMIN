import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { Input, Select, Toggle } from '../../../components/ui/FormControls';
import { Button } from '../../../components/ui/Button';
import { seedCompanies, seedBranches } from '../../../utils/settingsData';
import type { Company, Branch } from '../../../utils/settingsData';
import { DocumentSettingsModule } from './DocumentSettingsModule';
import {
  Check, Plus, Trash2, Settings2, Binary, User, Package,
  Edit2, X, Save, Info
} from 'lucide-react';
import type {
  BranchCodeSettings, EntityCodeSetting
} from '../../../utils/codeSettingsHelper';
import { DEFAULT_ENTITY_SETTINGS } from '../../../utils/codeSettingsHelper';

interface CodeSettingsModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
  onClose?: () => void;
}

const TAB_MODULES = {
  document: [
    { id: 'sales', label: 'Sales' }
  ],
  setup: [
    { id: 'salesperson', label: 'Salesperson' },
    { id: 'department', label: 'Department' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'customer', label: 'Customer' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'product', label: 'Product' },
    { id: 'branch', label: 'Branch' },
    { id: 'tax', label: 'Tax' }
  ],
  sales: [] as { id: string; label: string }[],
  purchases: [] as { id: string; label: string }[],
  customer: [
    { id: 'customer', label: 'Business Partner' }
  ],
  inventory: [
    { id: 'inventory', label: 'Inventory' }
  ]
} as const;

interface TypeItem {
  id: string;
  label: string;
  docType?: string;
}

const TAB_MODULE_TYPES: Record<string, TypeItem[]> = {
  sales: [
    { id: 'sale_invoice', label: 'Sale Invoice', docType: 'Sale Invoice' },
    { id: 'sale_return', label: 'Sale Return', docType: 'Sale Return' },
    { id: 'service_invoice', label: 'Service Invoice', docType: 'Service Invoice' },
    { id: 'digital_invoice', label: 'Digital Invoice', docType: 'Digital Invoice' }
  ],
  salesperson: [
    { id: 'salesperson', label: 'Salesperson' }
  ],
  department: [
    { id: 'department', label: 'Department' }
  ],
  warehouse: [
    { id: 'warehouse', label: 'Warehouse' }
  ],
  customer: [
    { id: 'customer', label: 'Customer', docType: 'Customer' }
  ],
  supplier: [
    { id: 'supplier', label: 'Supplier', docType: 'Supplier' }
  ],
  product: [
    { id: 'product', label: 'Product', docType: 'Inventory' }
  ],
  branch: [
    { id: 'branch', label: 'Branch' }
  ],
  tax: [
    { id: 'tax', label: 'Tax' }
  ],
  inventory: [
    { id: 'product', label: 'Product', docType: 'Inventory' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'stock_adjustment', label: 'Stock Adjustment' }
  ]
};

const FORMAT_TYPES = [
  { value: 'Document Type', label: 'Document Type' },
  { value: 'Prefix', label: 'Prefix' },
  { value: 'Serial', label: 'Serial' },
  { value: 'Branch Abbreviation', label: 'Branch Abbreviation' },
  { value: 'Company Abbreviation', label: 'Company Abbreviation' },
  { value: 'Month', label: 'Month' },
  { value: 'Year', label: 'Year' }
];

const getDefaultValueForType = (type: string, docType: string) => {
  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

  switch (type) {
    case 'Prefix':
      if (docType === 'sale_invoice') return 'SI';
      if (docType === 'sale_return') return 'RTN';
      if (docType === 'service_invoice') return 'SRV';
      if (docType === 'digital_invoice') return 'DIG';
      if (docType === 'purchase_invoice') return 'PI';
      if (docType === 'purchase_return') return 'PRTN';
      if (docType === 'tax') return 'TX';
      return 'PREFIX';
    case 'Document Type':
      if (docType === 'sale_invoice') return 'SI';
      if (docType === 'sale_return') return 'SR';
      if (docType === 'service_invoice') return 'SE';
      if (docType === 'digital_invoice') return 'DI';
      if (docType === 'purchase_invoice') return 'PI';
      if (docType === 'purchase_return') return 'PR';
      return 'DOC';
    case 'Branch Abbreviation':
      return 'LHR';
    case 'Company Abbreviation':
      return 'ABC';
    case 'Department Code':
      return 'HR';
    case 'Customer Code':
      return 'CUS001';
    case 'Supplier Code':
      return 'SUP001';
    case 'Product Code':
      return 'PRD001';
    case 'Month':
      return currentMonth;
    case 'Year':
      return currentYear;
    case 'Serial':
      return '00001';
    case 'Custom Text':
      return 'TEXT';
    default:
      return '';
  }
};

export const CodeSettingsModule: React.FC<CodeSettingsModuleProps> = ({ brand }) => {
  const [activeTab, setActiveTab] = useState<'document' | 'setup' | 'sales' | 'purchases' | 'customer' | 'inventory'>('document');
  const [activeModule, setActiveModule] = useState<string>('sales');
  const [activeType, setActiveType] = useState<string>('sale_invoice');
  const [salesDocType, setSalesDocType] = useState<string>('Sale Invoice');
  const [purchasesDocType, setPurchasesDocType] = useState<string>('Purchase Invoice');

  const handleTabSwitch = (tab: 'document' | 'setup' | 'sales' | 'purchases' | 'customer' | 'inventory') => {
    setActiveTab(tab);
    if (tab === 'sales' || tab === 'purchases' || tab === 'inventory') return; // these tabs use direct layouts

    if (tab === 'customer') {
      setActiveModule('customer_settings');
      return;
    }

    const modules = TAB_MODULES[tab];
    if (modules && modules.length > 0) {
      const firstModule = (modules as ReadonlyArray<{ id: string; label: string }>)[0].id;
      setActiveModule(firstModule);
      const types = TAB_MODULE_TYPES[firstModule];
      if (types && types.length > 0) {
        setActiveType(types[0].id);
      }
    }
  };

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, Record<string, BranchCodeSettings>>>({});
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  // Reusable configuration states
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [grid, setGrid] = useState<{ id: string; type: string; value: string; separator: string }[]>([]);
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [effectiveTo, setEffectiveTo] = useState<string>('');
  const [allowManualEntry, setAllowManualEntry] = useState<boolean>(false);
  const [serialReset, setSerialReset] = useState<'None' | 'Daily' | 'Monthly' | 'Yearly'>('None');
  const [taxTypeVal, setTaxTypeVal] = useState<string>('GST');
  const [provinceVal, setProvinceVal] = useState<string>('Punjab');

  // Draft / Regular numbering settings states
  const [draftGrid, setDraftGrid] = useState<{ id: string; type: string; value: string; separator: string }[]>([]);
  const [draftAllowManualEntry, setDraftAllowManualEntry] = useState<boolean>(false);
  const [draftSerialReset, setDraftSerialReset] = useState<'None' | 'Daily' | 'Monthly' | 'Yearly'>('None');
  const [documentNoAsDraftNo, setDocumentNoAsDraftNo] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<{ type: string; value: string; separator: string } | null>(null);


  // Load companies
  const companies = useMemo<Company[]>(() => {
    try {
      const stored = localStorage.getItem('company_records');
      return stored ? JSON.parse(stored) : seedCompanies;
    } catch {
      return seedCompanies;
    }
  }, []);

  // Load branches
  const branches = useMemo<Branch[]>(() => {
    try {
      const stored = localStorage.getItem('branch_records');
      return stored ? JSON.parse(stored) : seedBranches;
    } catch {
      return seedBranches;
    }
  }, []);



  // Load initial settings and active context
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('code_generation_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (e) {
      console.error('Failed to load code settings from localstorage', e);
    }

    // Default to active contexts
    try {
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');

      const currentCoId = activeCo ? JSON.parse(activeCo).id : (companies[0]?.id || '');
      setSelectedCompanyId(currentCoId);

      const currentBrId = activeBr ? JSON.parse(activeBr).id : '';
      if (currentBrId) {
        setSelectedBranchId(currentBrId);
      } else {
        const firstBranch = branches.find(b => b.companyId === currentCoId);
        setSelectedBranchId(firstBranch?.id || '');
      }
    } catch {
      setSelectedCompanyId(companies[0]?.id || '');
      const firstBranch = branches.find(b => b.companyId === (companies[0]?.id || ''));
      setSelectedBranchId(firstBranch?.id || '');
    }
  }, [companies, branches]);

  // Get active branch settings
  const activeBranchSettings = useMemo((): BranchCodeSettings => {
    if (!selectedCompanyId || !selectedBranchId) {
      const defaults: any = {};
      Object.keys(DEFAULT_ENTITY_SETTINGS).forEach(k => {
        defaults[k] = { ...DEFAULT_ENTITY_SETTINGS[k] };
      });
      return defaults as BranchCodeSettings;
    }
    const companySettings = settings[selectedCompanyId] || {};
    const branchSettings = companySettings[selectedBranchId] || {};

    const resolved: any = {};
    Object.keys(DEFAULT_ENTITY_SETTINGS).forEach(k => {
      resolved[k] = { ...DEFAULT_ENTITY_SETTINGS[k], ...branchSettings[k] };
    });
    return resolved as BranchCodeSettings;
  }, [settings, selectedCompanyId, selectedBranchId]);

  // Fallback: build grid from existing prefix and nextNumber
  const getInitialGridForEntity = (typeKey: string, setting: EntityCodeSetting) => {
    if (setting.formatGrid && setting.formatGrid.length > 0) {
      return setting.formatGrid;
    }

    const initialRows = [];
    if (setting.prefix) {
      initialRows.push({
        id: `row-std-prefix-${typeKey}`,
        type: 'Prefix',
        value: setting.prefix.replace(/-$/, ''),
        separator: setting.prefix.endsWith('-') ? '-' : ''
      });
    }

    // Serial row
    initialRows.push({
      id: `row-std-serial-${typeKey}`,
      type: 'Serial',
      value: String(setting.nextNumber || 1).padStart(setting.padding || 5, '0'),
      separator: ''
    });

    return initialRows;
  };

  // Sync state on type switch
  useEffect(() => {
    if (!activeType) return;
    const setting = activeBranchSettings[activeType] || { mode: 'auto', prefix: '', nextNumber: 1, padding: 5 };
    setMode(setting.mode);
    setEffectiveFrom(setting.effectiveFrom || '');
    setEffectiveTo(setting.effectiveTo || '');
    setAllowManualEntry(!!setting.allowManualEntry);
    setSerialReset(setting.serialReset || 'None');
    setTaxTypeVal(setting.taxType || 'GST');
    setProvinceVal(setting.province || 'Punjab');

    // Initialize grid
    const initialGrid = getInitialGridForEntity(activeType, setting);
    setGrid(initialGrid);

    // Custom draft/regular settings
    setDraftAllowManualEntry(!!setting.draftAllowManualEntry);
    setDraftSerialReset(setting.draftSerialReset || 'None');
    setDocumentNoAsDraftNo(!!setting.documentNoAsDraftNo);
    
    if (setting.draftFormatGrid) {
      setDraftGrid(setting.draftFormatGrid);
    } else {
      setDraftGrid([
        { id: `draft-row-pref-${activeType}`, type: 'Prefix', value: 'AV', separator: '\\' },
        { id: `draft-row-doc-${activeType}`, type: 'Document Type', value: 'CSI', separator: '\\' },
        { id: `draft-row-ser-${activeType}`, type: 'Serial', value: '00001', separator: '' }
      ]);
    }
  }, [activeType, activeBranchSettings]);

  const prefixValue = useMemo(() => {
    const row = grid.find(r => r.type === 'Prefix');
    return row ? row.value : '';
  }, [grid]);

  const setPrefixValue = (val: string) => {
    setGrid(prev => {
      const existingIdx = prev.findIndex(r => r.type === 'Prefix');
      if (existingIdx > -1) {
        return prev.map((r, idx) => idx === existingIdx ? { ...r, value: val } : r);
      } else {
        return [
          { id: `row-std-prefix-${activeType}`, type: 'Prefix', value: val, separator: '' },
          ...prev
        ];
      }
    });
  };

  const serialValue = useMemo(() => {
    const row = grid.find(r => r.type === 'Serial');
    return row ? row.value : '00001';
  }, [grid]);

  const setSerialValue = (val: string) => {
    const numericOnly = val.replace(/\D/g, '');
    setGrid(prev => {
      const existingIdx = prev.findIndex(r => r.type === 'Serial');
      if (existingIdx > -1) {
        return prev.map((r, idx) => idx === existingIdx ? { ...r, value: numericOnly } : r);
      } else {
        return [
          ...prev,
          { id: `row-std-serial-${activeType}`, type: 'Serial', value: numericOnly, separator: '' }
        ];
      }
    });
  };



  // Compile code preview
  const livePreview = useMemo(() => {
    if (mode === 'manual') return 'Manual Entry';

    let result = '';
    grid.forEach(row => {
      result += (row.value || '') + (row.separator || '');
    });
    return result;
  }, [grid, mode]);



  // Save changes
  const handleSaveSettings = () => {
    if (!selectedCompanyId || !selectedBranchId || !activeType) return;

    const serialRow = grid.find(row => row.type === 'Serial');
    const padding = serialRow ? serialRow.value.length : 5;
    const nextNumber = serialRow ? (parseInt(serialRow.value.replace(/^0+/, '')) || 1) : 1;

    const prefixParts = grid.filter(row => row.type !== 'Serial');
    let prefix = '';
    prefixParts.forEach(row => {
      prefix += (row.value || '') + (row.separator || '');
    });

    const draftSerialRow = draftGrid.find(row => row.type === 'Serial');
    const draftPadding = draftSerialRow ? draftSerialRow.value.length : 5;
    const draftNextNumber = draftSerialRow ? (parseInt(draftSerialRow.value.replace(/^0+/, '')) || 1) : 1;

    const draftPrefixParts = draftGrid.filter(row => row.type !== 'Serial');
    let draftPrefix = '';
    draftPrefixParts.forEach(row => {
      draftPrefix += (row.value || '') + (row.separator || '');
    });

    const updatedSetting: EntityCodeSetting = {
      mode,
      prefix,
      nextNumber,
      padding,
      formatGrid: grid,
      effectiveFrom,
      effectiveTo,
      allowManualEntry,
      serialReset,

      // Draft settings
      draftFormatGrid: draftGrid,
      draftPrefix,
      draftNextNumber,
      draftPadding,
      draftAllowManualEntry,
      draftSerialReset,
      documentNoAsDraftNo,
      taxType: activeType === 'tax' ? taxTypeVal : undefined,
      province: activeType === 'tax' ? provinceVal : undefined
    };

    const newSettings = {
      ...settings,
      [selectedCompanyId]: {
        ...(settings[selectedCompanyId] || {}),
        [selectedBranchId]: {
          ...activeBranchSettings,
          [activeType]: updatedSetting
        }
      }
    };

    setSettings(newSettings);
    localStorage.setItem('code_generation_settings', JSON.stringify(newSettings));

    setSavedMessage(true);
    const timer = setTimeout(() => setSavedMessage(false), 1200);
    return () => clearTimeout(timer);
  };

  const renderGridTable = (gridMode: 'draft' | 'regular') => {
    const currentGrid = gridMode === 'draft' ? draftGrid : grid;
    const setCurrentGrid = gridMode === 'draft' ? setDraftGrid : setGrid;

    const startEdit = (row: any) => {
      setEditingRowId(row.id);
      setEditingRowData({ type: row.type, value: row.value, separator: row.separator });
    };

    const cancelEdit = () => {
      setEditingRowId(null);
      setEditingRowData(null);
    };

    const saveEdit = (rowId: string) => {
      if (!editingRowData) return;
      setCurrentGrid(prev => prev.map(row => {
        if (row.id === rowId) {
          return { ...row, ...editingRowData };
        }
        return row;
      }));
      setEditingRowId(null);
      setEditingRowData(null);
    };

    const addRow = () => {
      const newId = `row-${Date.now()}-${Math.random()}`;
      setCurrentGrid(prev => [
        ...prev,
        { id: newId, type: 'Custom Text', value: 'TEXT', separator: '\\' }
      ]);
      setEditingRowId(newId);
      setEditingRowData({ type: 'Custom Text', value: 'TEXT', separator: '\\' });
    };

    const deleteRow = (rowId: string) => {
      setCurrentGrid(prev => prev.filter(row => row.id !== rowId));
      if (editingRowId === rowId) {
        setEditingRowId(null);
        setEditingRowData(null);
      }
    };

    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <table className="w-full border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-12 border border-slate-200">Sr#</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-44 border border-slate-200">Number Format Type</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-48 border border-slate-200">Value</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-24 border border-slate-200">Separator</th>
              <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 w-20 border border-slate-200">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addRow}
                  icon={Plus}
                  style={{ backgroundColor: brand.primary }}
                >
                  Add
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentGrid.map((row, idx) => {
              const isEditing = editingRowId === row.id;
              const isSerial = isEditing ? editingRowData?.type === 'Serial' : row.type === 'Serial';
              const isAutoComputedValue = isEditing 
                ? ['Year', 'Month', 'Department Code', 'Customer Code', 'Supplier Code', 'Product Code'].includes(editingRowData?.type || '')
                : ['Year', 'Month', 'Department Code', 'Customer Code', 'Supplier Code', 'Product Code'].includes(row.type);

              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40"
                  style={isEditing ? { backgroundColor: '#e2f0d9' } : undefined}
                >
                  <td className="px-4 py-2 text-[12px] font-normal text-slate-600 border border-slate-200">{idx + 1}</td>
                  <td className="px-4 py-2 text-[12px] border border-slate-200">
                    {isEditing ? (
                      <Select
                        variant="compact"
                        value={editingRowData?.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setEditingRowData(prev => prev ? {
                            ...prev,
                            type: newType,
                            value: getDefaultValueForType(newType, activeType),
                            separator: newType === 'Serial' ? '' : '\\'
                          } : null);
                        }}
                        options={FORMAT_TYPES}
                        className="w-full"
                      />
                    ) : (
                      row.type
                    )}
                  </td>
                  <td className="px-4 py-2 text-[12px] border border-slate-200">
                    {isEditing ? (
                      <Input
                        variant="compact"
                        value={editingRowData?.value}
                        onChange={(e) => setEditingRowData(prev => prev ? { ...prev, value: e.target.value } : null)}
                        disabled={isAutoComputedValue}
                        placeholder={isSerial ? 'e.g. 00001' : 'e.g. TEXT'}
                        className="w-full"
                      />
                    ) : (
                      row.value
                    )}
                  </td>
                  <td className="px-4 py-2 text-[12px] border border-slate-200">
                    {isEditing ? (
                      <Select
                        variant="compact"
                        value={editingRowData?.separator}
                        onChange={(e) => setEditingRowData(prev => prev ? { ...prev, separator: e.target.value } : null)}
                        disabled={isSerial}
                        options={[
                          { value: '', label: 'None' },
                          { value: '\\', label: '\\' },
                          { value: '/', label: '/' },
                          { value: '-', label: '-' },
                          { value: '_', label: '_' }
                        ]}
                        className="w-full"
                      />
                    ) : (
                      row.separator || 'None'
                    )}
                  </td>
                  <td className="px-4 py-2 text-center border border-slate-200">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => saveEdit(row.id)}
                          className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 border-none cursor-pointer flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1 rounded bg-red-500 text-white hover:bg-red-600 border-none cursor-pointer flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="p-1 bg-transparent text-slate-400 hover:text-slate-600 border-none cursor-pointer flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(row.id)}
                          className="p-1 bg-transparent text-red-400 hover:text-red-600 border-none cursor-pointer flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {currentGrid.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-slate-400 font-medium border border-slate-200">
                  No numbering segments configured. Click + to add.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };



  const handleModuleSwitch = (moduleId: string) => {
    setActiveModule(moduleId);
    const types = TAB_MODULE_TYPES[moduleId];
    if (types && types.length > 0) {
      setActiveType(types[0].id);
    }
  };



  return (
    <div className="h-[calc(100vh-190px)] min-h-[550px] max-h-[850px] flex flex-col overflow-hidden space-y-4 font-sans text-slate-700">

      {/* ── Sub Tabs Switcher ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50 backdrop-blur-sm self-start shrink-0">
        <button
          onClick={() => handleTabSwitch('document')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-none outline-none ${activeTab === 'document' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          style={activeTab === 'document' ? { color: brand.primary } : undefined}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Document Code Settings
        </button>
        <button
          onClick={() => handleTabSwitch('setup')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-none outline-none ${activeTab === 'setup' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          style={activeTab === 'setup' ? { color: brand.primary } : undefined}
        >
          <Binary className="w-3.5 h-3.5" />
          Setup Code Settings
        </button>
        <button
          onClick={() => handleTabSwitch('sales')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-none outline-none ${activeTab === 'sales' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          style={activeTab === 'sales' ? { color: brand.primary } : undefined}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Sales
        </button>
        <button
          onClick={() => handleTabSwitch('purchases')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-none outline-none ${activeTab === 'purchases' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          style={activeTab === 'purchases' ? { color: brand.primary } : undefined}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Purchases
        </button>
        <button
          onClick={() => handleTabSwitch('customer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-none outline-none ${activeTab === 'customer' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          style={activeTab === 'customer' ? { color: brand.primary } : undefined}
        >
          <User className="w-3.5 h-3.5" />
          Business Partner
        </button>
        <button
          onClick={() => handleTabSwitch('inventory')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer border-none outline-none ${activeTab === 'inventory' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          style={activeTab === 'inventory' ? { color: brand.primary } : undefined}
        >
          <Package className="w-3.5 h-3.5" />
          Inventory
        </button>
      </div>

      {/* ── Tab Panels ── */}
      {activeTab === 'purchases' ? (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side Panel */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Screen Types</h4>
            <div className="space-y-1">
              {[
                { id: 'Purchase Invoice', label: 'Purchase Invoice' },
                { id: 'Purchase Return', label: 'Purchase Return' }
              ].map(mod => {
                const isActive = purchasesDocType === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setPurchasesDocType(mod.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer ${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side Settings Panel */}
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">
              <DocumentSettingsModule
                brand={brand}
                activeTab={purchasesDocType}
                hideTabs={true}
              />
            </div>
          </div>
        </div>
      ) : activeTab === 'sales' ? (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side Panel */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Screen Types</h4>
            <div className="space-y-1">
              {[
                { id: 'Sale Invoice', label: 'Sale Invoice' },
                { id: 'Sale Return', label: 'Sale Return' },
                { id: 'Service Invoice', label: 'Service Invoice' },
                { id: 'Digital Invoice', label: 'Digital Invoice' }
              ].map(mod => {
                const isActive = salesDocType === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSalesDocType(mod.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer ${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side Settings Panel */}
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">
              <DocumentSettingsModule
                brand={brand}
                activeTab={salesDocType}
                hideTabs={true}
              />
            </div>
          </div>
        </div>
      ) : activeTab === 'customer' ? (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side Panel */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Partner Types</h4>
            <div className="space-y-1">
              {[
                { id: 'customer_settings', label: 'Customer' },
                { id: 'supplier_settings', label: 'Supplier' }
              ].map(mod => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer ${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side Settings Panel */}
          <div className="w-3/4 flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">
              <DocumentSettingsModule
                brand={brand}
                activeTab={activeModule === 'supplier_settings' ? 'Supplier' : 'Customer'}
                hideTabs={true}
              />
            </div>
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        // Inventory tab: Document Settings visibility cards for Inventory (no dropdown needed)
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">
          <DocumentSettingsModule brand={brand} activeTab="Inventory" hideTabs={true} />
        </div>
      ) : activeTab === 'document' ? (
        // Document tab: Custom full-width numbering editor, no left side panel!
        <Card className="w-full flex flex-col flex-grow border border-[#E2E8F0] shadow-sm rounded-2xl overflow-hidden bg-white p-0 min-h-0">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable content area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
              
              {/* Screen Type & Effective Dates in a single row */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Screen Type</span>
                  <div className="w-52">
                    <Select
                      variant="compact"
                      value={activeType}
                      onChange={(e) => {
                        setActiveType(e.target.value);
                        setEditingRowId(null);
                        setEditingRowData(null);
                      }}
                      options={[
                        { value: 'sale_invoice', label: 'Sale Invoice' },
                        { value: 'sale_return', label: 'Sale Return' },
                        { value: 'service_invoice', label: 'Service Invoice' },
                        { value: 'digital_invoice', label: 'Digital Invoice' },
                        { value: 'purchase_invoice', label: 'Purchase Invoice' },
                        { value: 'purchase_return', label: 'Purchase Return' }
                      ]}
                    />
                  </div>
                </div>

              </div>

              {/* Grid Table */}
              <div className="relative">
                {renderGridTable('regular')}
              </div>

              {/* Example + Toggle — column stacked, flush below table */}
              <div className="flex flex-col gap-1">
                <div className="text-xs text-slate-500">
                  Example: <span className="font-mono text-xs text-slate-600 ml-1">{livePreview}</span>
                </div>
                <div className="flex items-center gap-6">
                  <Toggle
                    checked={allowManualEntry}
                    onChange={(checked) => setAllowManualEntry(checked)}
                    label="Allow Manual Entry"
                    compact={true}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Serial Number Reset</span>
                    <div className="w-28">
                      <Select
                        variant="compact"
                        value={serialReset}
                        onChange={(e) => setSerialReset(e.target.value as any)}
                        options={[
                          { value: 'None', label: 'None' },
                          { value: 'Monthly', label: 'Monthly' },
                          { value: 'Yearly', label: 'Yearly' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Bar */}
            <div className="px-6 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex gap-2 items-center">
                {savedMessage && (
                  <div className="text-[12px] font-black text-emerald-600 flex items-center gap-1.5 font-sans">
                    <Check className="w-4 h-4" /> Settings saved successfully
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSettings}
                  icon={Save}
                  style={{ backgroundColor: brand.primary }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">

          {/* Left Side: Module Navigation */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Modules</h4>
            <div className="space-y-1">
              {TAB_MODULES[activeTab]?.map(mod => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleModuleSwitch(mod.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer ${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side: Reusable Configuration Area */}
          <Card className="flex-1 p-0 flex flex-col border border-[#E2E8F0] shadow-sm bg-white overflow-hidden">

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="space-y-5">

                {/* Code Setup Guidelines box — 60% width */}
                <div className="w-[75%] flex gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: brand.primary }} />
                  <div className="space-y-1.5">
                    <p className="text-[12px] font-black" style={{ color: brand.dark }}>Code setup guidelines</p>
                    <ul className="space-y-1">
                      {[
                        'Prefix is used to identify document codes. Maximum 4 characters allowed.',
                        'Start Serial defines the starting number for generated codes. Maximum 7 digits allowed.',
                      ].map((line) => (
                        <li key={line} className="flex items-start gap-1.5">
                          <span className="text-[10px] font-black mt-0.5" style={{ color: brand.primary }}>•</span>
                          <span className="text-[11px] font-normal text-slate-500 leading-relaxed">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Form fields + Example + Toggle — grouped tightly */}
                <div className="flex flex-col gap-1">
                  {/* Fields */}
                  <div className={`flex gap-3 transition-opacity duration-200 ${
                    mode === 'manual' ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'
                  }`}>
                    <div className="w-36">
                      <Input
                        label="Prefix"
                        variant="compact"
                        value={prefixValue}
                        onChange={(e) => setPrefixValue(e.target.value)}
                        placeholder="e.g. SP-"
                        disabled={mode === 'manual'}
                      />
                    </div>
                    <div className="w-36">
                      <Input
                        label="Start serial"
                        variant="compact"
                        value={serialValue}
                        onChange={(e) => setSerialValue(e.target.value)}
                        placeholder="e.g. 00001"
                        disabled={mode === 'manual'}
                      />
                    </div>
                    {activeType === 'tax' && (
                      <>
                        <div className="w-36">
                          <Select
                            label="Tax Type"
                            variant="compact"
                            value={taxTypeVal}
                            onChange={(e) => setTaxTypeVal(e.target.value)}
                            options={[
                              { value: 'GST', label: 'GST' },
                              { value: 'SST', label: 'SST' },
                              { value: 'WHT', label: 'WHT' },
                              { value: 'FED', label: 'FED' }
                            ]}
                          />
                        </div>
                        <div className="w-36">
                          <Select
                            label="Province"
                            variant="compact"
                            value={provinceVal}
                            onChange={(e) => setProvinceVal(e.target.value)}
                            options={[
                              { value: 'Punjab', label: 'Punjab' },
                              { value: 'Sindh', label: 'Sindh' },
                              { value: 'KPK', label: 'KPK' },
                              { value: 'Federal', label: 'Federal' }
                            ]}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Example */}
                  <div className="text-xs text-slate-500">
                    Example: <span className="font-mono text-xs text-slate-600 ml-1">{livePreview}</span>
                  </div>

                  {/* Allow Manual Entry toggle */}
                  <Toggle
                    checked={mode === 'manual'}
                    onChange={(val) => setMode(val ? 'manual' : 'auto')}
                    label="Allow Manual Entry"
                    compact={true}
                  />
                </div>

                {/* Tips box */}
                <div className="w-[75%] flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/60">
                  <span className="text-sm leading-none shrink-0">💡</span>
                  <span className="text-[11px] font-normal text-slate-500 leading-relaxed">
                    <span className="font-medium text-slate-600">Tips: </span>After the first transaction is created, these settings cannot be modified.
                  </span>
                </div>

              </div>
            </div>

            {/* Standard footer bar */}
            <div className="px-6 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex gap-2 items-center">
                {savedMessage && (
                  <div className="text-[12px] font-black text-emerald-600 flex items-center gap-1.5 font-sans">
                    <Check className="w-4 h-4" /> Settings saved successfully
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSettings}
                  icon={Save}
                  style={{ backgroundColor: brand.primary }}
                >
                  Save
                </Button>
              </div>
            </div>

          </Card>

        </div>
      )}
    </div>
  );
};

