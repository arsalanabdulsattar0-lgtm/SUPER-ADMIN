import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { Input, Select, Toggle } from '../../../components/ui/FormControls';
import { Button } from '../../../components/ui/Button';
import { seedCompanies, seedBranches } from '../../../utils/settingsData';
import type { Company, Branch } from '../../../utils/settingsData';
import { DocumentSettingsModule } from './DocumentSettingsModule';
import {
  Check, Plus, Trash2, ArrowUp, ArrowDown, AlertCircle
} from 'lucide-react';
import type {
  BranchCodeSettings, EntityCodeSetting
} from '../../../utils/codeSettingsHelper';
import { DEFAULT_ENTITY_SETTINGS } from '../../../utils/codeSettingsHelper';

interface CodeSettingsModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const MODULES = [
  { id: 'sales', label: 'Sales' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'customer', label: 'Customer' }
] as const;

interface ModuleTypeItem {
  id: string;
  label: string;
  docType?: string;
}

const MODULE_TYPES: Record<'sales' | 'inventory' | 'customer', ModuleTypeItem[]> = {
  sales: [
    { id: 'sale_invoice', label: 'Sale Invoice', docType: 'Sale Invoice' },
    { id: 'sale_return', label: 'Sale Return', docType: 'Sale Return' },
    { id: 'service_invoice', label: 'Service Invoice', docType: 'Service Invoice' },
    { id: 'digital_invoice', label: 'Digital Invoice', docType: 'Digital Invoice' }
  ],
  inventory: [
    { id: 'product', label: 'Product', docType: 'Inventory' },
    { id: 'product_category', label: 'Category' },
    { id: 'product_brand', label: 'Brand' },
    { id: 'product_unit', label: 'Unit' },
    { id: 'warehouse', label: 'Warehouse' }
  ],
  customer: [
    { id: 'customer', label: 'Customer', docType: 'Customer' },
    { id: 'customer_group', label: 'Customer Group' },
    { id: 'customer_category', label: 'Customer Category' }
  ]
};

const FORMAT_TYPES = [
  { value: 'Prefix', label: 'Prefix' },
  { value: 'Document Type', label: 'Document type' },
  { value: 'Branch Abbreviation', label: 'Branch abbreviation' },
  { value: 'Company Abbreviation', label: 'Company abbreviation' },
  { value: 'Department Code', label: 'Department code' },
  { value: 'Customer Code', label: 'Customer code' },
  { value: 'Supplier Code', label: 'Supplier code' },
  { value: 'Product Code', label: 'Product code' },
  { value: 'Month', label: 'Month' },
  { value: 'Year', label: 'Year' },
  { value: 'Serial', label: 'Serial' },
  { value: 'Custom Text', label: 'Custom text' }
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
      return 'PREFIX';
    case 'Document Type':
      if (docType === 'sale_invoice') return 'SI';
      if (docType === 'sale_return') return 'SR';
      if (docType === 'service_invoice') return 'SE';
      if (docType === 'digital_invoice') return 'DI';
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
  const [activeModule, setActiveModule] = useState<'sales' | 'inventory' | 'customer'>('sales');
  const [activeType, setActiveType] = useState<string>('sale_invoice');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, Record<string, BranchCodeSettings>>>({});
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  // Configuration grid states
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [grid, setGrid] = useState<{ id: string; type: string; value: string; separator: string }[]>([]);
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [effectiveTo, setEffectiveTo] = useState<string>('');
  const [allowManualEntry, setAllowManualEntry] = useState<boolean>(false);
  const [serialReset, setSerialReset] = useState<'None' | 'Daily' | 'Monthly' | 'Yearly'>('None');

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

  // Available branches for active company
  const availableBranches = useMemo(() => {
    return branches.filter(b => b.companyId === selectedCompanyId);
  }, [branches, selectedCompanyId]);

  // Load active contexts
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('code_generation_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (e) {
      console.error('Failed to load code settings', e);
    }

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

  // Resolve active branch settings
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

  // Fallback: build grid format from existing prefix & nextNumber values
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
    
    initialRows.push({
      id: `row-std-serial-${typeKey}`,
      type: 'Serial',
      value: String(setting.nextNumber || 1).padStart(setting.padding || 5, '0'),
      separator: ''
    });
    
    return initialRows;
  };

  // Sync state on active document type change
  useEffect(() => {
    const setting = activeBranchSettings[activeType] || { mode: 'auto', prefix: '', nextNumber: 1, padding: 5 };
    setMode(setting.mode);
    setEffectiveFrom(setting.effectiveFrom || '');
    setEffectiveTo(setting.effectiveTo || '');
    setAllowManualEntry(!!setting.allowManualEntry);
    setSerialReset(setting.serialReset || 'None');
    
    const initialGrid = getInitialGridForEntity(activeType, setting);
    setGrid(initialGrid);
  }, [activeType, activeBranchSettings]);

  // Reorder builder row
  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newGrid = [...grid];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGrid.length) return;
    
    const temp = newGrid[index];
    newGrid[index] = newGrid[targetIndex];
    newGrid[targetIndex] = temp;
    
    setGrid(newGrid);
  };

  // Add row
  const addRow = () => {
    const newGrid = [...grid];
    newGrid.push({
      id: `row-${Date.now()}-${Math.random()}`,
      type: 'Custom Text',
      value: 'TEXT',
      separator: '-'
    });
    setGrid(newGrid);
  };

  // Delete row
  const deleteRow = (index: number) => {
    const newGrid = grid.filter((_, idx) => idx !== index);
    setGrid(newGrid);
  };

  // Update row text/value/separator
  const updateRowField = (index: number, fieldName: 'value' | 'separator', val: string) => {
    const newGrid = [...grid];
    newGrid[index] = {
      ...newGrid[index],
      [fieldName]: val
    };
    setGrid(newGrid);
  };

  // Handle format type selection
  const changeRowType = (index: number, newType: string) => {
    const newGrid = [...grid];
    newGrid[index] = {
      ...newGrid[index],
      type: newType,
      value: getDefaultValueForType(newType, activeType),
      separator: newType === 'Serial' ? '' : '-'
    };
    setGrid(newGrid);
  };

  // Compiled live preview
  const livePreview = useMemo(() => {
    if (mode === 'manual') return 'Manual entry';
    
    let result = '';
    grid.forEach(row => {
      result += (row.value || '') + (row.separator || '');
    });
    return result;
  }, [grid, mode]);

  // Save changes
  const handleSaveSettings = () => {
    if (!selectedCompanyId || !selectedBranchId) return;

    const serialRow = grid.find(row => row.type === 'Serial');
    const padding = serialRow ? serialRow.value.length : 5;
    const nextNumber = serialRow ? (parseInt(serialRow.value.replace(/^0+/, '')) || 1) : 1;
    
    const prefixParts = grid.filter(row => row.type !== 'Serial');
    let prefix = '';
    prefixParts.forEach(row => {
      prefix += (row.value || '') + (row.separator || '');
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
      serialReset
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

  const selectedTypeObj = useMemo(() => {
    const list = MODULE_TYPES[activeModule];
    return list.find(t => t.id === activeType) || list[0];
  }, [activeModule, activeType]);

  return (
    <div className="h-[calc(100vh-190px)] min-h-[550px] max-h-[850px] flex flex-col overflow-hidden space-y-4 font-sans text-slate-700">
      
      {/* ── Top SAP-Style Module Tabs ── */}
      <div className="flex border-b border-slate-200 bg-slate-100 p-1 rounded-t-xl overflow-x-auto whitespace-nowrap divide-x divide-white shrink-0 scrollbar-none select-none">
        {MODULES.map(tab => {
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveModule(tab.id);
                const types = MODULE_TYPES[tab.id];
                if (types.length > 0) {
                  setActiveType(types[0].id);
                }
              }}
              className={`px-4 py-2 text-[11px] font-black border-none transition-all cursor-pointer rounded-t-lg outline-none whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-800 border-t-4'
                  : 'bg-[#6FA8D6] text-white hover:bg-[#5E97C9]'
              }`}
              style={isActive ? { borderTopColor: brand.primary } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Dynamic Split Panel Layout ── */}
      <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
        
        {/* Left Sidebar: Dynamic Type List */}
        <Card className="w-1/4 p-4 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-xs shrink-0 select-none">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Document types
          </span>
          <div className="space-y-1">
            {MODULE_TYPES[activeModule].map(type => {
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-slate-50 border-l-4 text-slate-800'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  style={isActive ? { borderLeftColor: brand.primary, color: brand.primary } : undefined}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Details Panel */}
        <Card className="w-3/4 p-6 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-xs min-h-0">
          <div className="space-y-6 flex flex-col h-full">
            
            {/* Header: selected type label and branch selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-[13px] font-black text-slate-800">
                  {selectedTypeObj.label} settings
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Configure document layout fields visibility and numbering sequence rules.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="w-48">
                  <Select
                    label="Select branch"
                    variant="compact"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    options={[
                      { value: 'all', label: 'Overall company (all branches)' },
                      ...availableBranches.map(b => ({ value: b.id, label: b.name }))
                    ]}
                  />
                </div>
                <div className="flex items-center pt-5">
                  <Toggle
                    checked={mode === 'auto'}
                    onChange={(val) => setMode(val ? 'auto' : 'manual')}
                    label="Auto generate code"
                  />
                </div>
              </div>
            </div>

            {/* Inner Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-8 custom-scrollbar">
              
              {/* 1. Document Settings (if applicable) */}
              {selectedTypeObj.docType && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b pb-1">
                    Document settings
                  </h4>
                  <DocumentSettingsModule
                    brand={brand}
                    activeTab={selectedTypeObj.docType}
                    hideTabs={true}
                  />
                </div>
              )}

              {/* 2. Code Settings */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b pb-1">
                  Code settings
                </h4>

                {mode === 'manual' ? (
                  <div className="p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-400 mb-2 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700">Manual code entry</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto">
                      Numbering sequences are entered manually. Code generation rules are disabled for this type.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Format Grid Builder */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-700">Format grid</h4>
                        <Button
                          variant="white"
                          size="xs"
                          icon={Plus}
                          onClick={addRow}
                          className="border border-slate-200"
                        >
                          Add row
                        </Button>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-12">Sr#</th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-44">Format type</th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-48">Value</th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-24">Separator</th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-28">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grid.map((row, idx) => {
                              const isSerial = row.type === 'Serial';
                              const isAutoComputedValue = ['Year', 'Month', 'Department Code', 'Customer Code', 'Supplier Code', 'Product Code'].includes(row.type);
                              return (
                                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40">
                                  <td className="px-4 py-2 text-[12px] font-normal text-slate-600">{idx + 1}</td>
                                  <td className="px-4 py-2">
                                    <Select
                                      variant="compact"
                                      value={row.type}
                                      onChange={(e) => changeRowType(idx, e.target.value)}
                                      options={FORMAT_TYPES}
                                      className="w-full min-w-[140px]"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <Input
                                      variant="compact"
                                      value={row.value}
                                      onChange={(e) => updateRowField(idx, 'value', e.target.value)}
                                      disabled={isAutoComputedValue}
                                      placeholder={isSerial ? 'e.g. 00001' : 'e.g. TEXT'}
                                      className="w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <Input
                                      variant="compact"
                                      value={row.separator}
                                      onChange={(e) => updateRowField(idx, 'separator', e.target.value)}
                                      placeholder="None"
                                      disabled={isSerial}
                                      maxLength={2}
                                      className="w-full text-center"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-0.5">
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        icon={ArrowUp}
                                        onClick={() => moveRow(idx, 'up')}
                                        disabled={idx === 0}
                                        className="hover:bg-slate-100"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        icon={ArrowDown}
                                        onClick={() => moveRow(idx, 'down')}
                                        disabled={idx === grid.length - 1}
                                        className="hover:bg-slate-100"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        icon={Trash2}
                                        onClick={() => deleteRow(idx)}
                                        className="!text-red-500 hover:bg-red-50"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {grid.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-slate-400 font-medium">
                                  No formatting rows configured. Add a row to begin.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Common Settings Builder */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-700">Common settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Effective from"
                          variant="compact"
                          type="date"
                          value={effectiveFrom}
                          onChange={(e) => setEffectiveFrom(e.target.value)}
                        />
                        <Input
                          label="Effective to"
                          variant="compact"
                          type="date"
                          value={effectiveTo}
                          onChange={(e) => setEffectiveTo(e.target.value)}
                        />
                        <Select
                          label="Serial reset"
                          variant="compact"
                          value={serialReset}
                          onChange={(e) => setSerialReset(e.target.value as any)}
                          options={[
                            { value: 'None', label: 'None' },
                            { value: 'Daily', label: 'Daily' },
                            { value: 'Monthly', label: 'Monthly' },
                            { value: 'Yearly', label: 'Yearly' }
                          ]}
                        />
                        <div className="flex flex-col justify-end">
                          <Toggle
                            checked={allowManualEntry}
                            onChange={(val) => setAllowManualEntry(val)}
                            label="Allow manual entry override"
                            className="mb-1.5"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Sticky/Fixed Live Preview & Save Actions Footer */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 mt-auto">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Live preview</span>
                  <h3 className="text-sm font-black text-slate-800 tracking-wide mt-0.5">
                    {livePreview || '—'}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {savedMessage && (
                    <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1 animate-fade-in-out">
                      <Check className="w-3.5 h-3.5" /> Settings saved
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveSettings}
                    style={{ backgroundColor: brand.primary }}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </Card>

      </div>

    </div>
  );
};
