import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import {
  Layout, Columns, Check, FileText, Undo2, Wrench, Globe, User, Package, Settings2, Plus, Trash2, Edit3, Eye, EyeOff
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { TextArea } from '../../../components/ui/TextArea';
import { Toggle } from '../../../components/ui/Toggle';

interface DocumentSettingsModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  hideTabs?: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  category: 'header' | 'column' | 'footer' | 'custom';
  type: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  width?: string;
  required?: boolean;
  readOnly?: boolean;
  showOnScreen?: boolean;
  showOnPrint?: boolean;
  active?: boolean;
  options?: string[];
}

export interface DocumentViewSettings {
  fields: { [key: string]: boolean };
  columns: { [key: string]: boolean };
  customFields?: CustomFieldDefinition[];
  standardOverrides?: { [fieldName: string]: Partial<CustomFieldDefinition> };
  deletedFields?: string[];
}

const DOC_TYPES = [
  'Sale Invoice',
  'Sale Return',
  'Service Invoice',
  'Digital Invoice',
  'Customer',
  'Inventory'
];

const DOC_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  'Sale Invoice': FileText,
  'Sale Return': Undo2,
  'Service Invoice': Wrench,
  'Digital Invoice': Globe,
  'Customer': User,
  'Inventory': Package
};

const DEFAULT_FIELDS: Record<string, string[]> = {
  'Sale Invoice':     ['Sales Person', 'Department', 'Due Date'],
  'Service Invoice':  ['Sales Person', 'Department', 'Due Date'],
  'Digital Invoice':  ['Sales Person', 'Department', 'Due Date'],
  'Sale Return':      ['Sales Person', 'Department', 'Due Date'],
  'Customer':  [],
  'Inventory':  []
};

const DEFAULT_FOOTER: Record<string, string[]> = {
  'Sale Invoice':    [],
  'Service Invoice': [],
  'Digital Invoice': [],
  'Sale Return':     [],
  'Customer':        [],
  'Inventory':       []
};

const DEFAULT_COLUMNS: Record<string, string[]> = {
  'Sale Invoice':    ['Details', 'Discount', 'Tax', 'Further Tax'],
  'Service Invoice': ['Details', 'Discount', 'Tax', 'Further Tax'],
  'Digital Invoice': ['Details', 'Discount', 'Tax', 'Further Tax'],
  'Sale Return':     ['Details', 'Discount', 'Tax', 'Further Tax'],
  'Customer':  [],
  'Inventory':  []
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  'Customer': 'Show customer details selector in header',
  'Issue Date': 'Show document date field in header',
  'Invoice ID': 'Show invoice number input in header',
  'Reference': 'Show reference PO number in header',
  'Customer Address': 'Show customer billing address in header',
  'Due Date': 'Show invoice due date in header',
  'Invoice Type': 'Show invoice document layout type in header',
  'Notes & Special Terms': 'Show payment terms and notes block in footer',
  'Document Attachments': 'Show file attachments card in footer',
  'Discount (%)': 'Show discount percentage input in summary',
  'Shipping Charges': 'Show shipping charges input in summary',
  'Round Off': 'Show round off adjust input in summary',
  'Return Invoice No.': 'Show return serial number in header',
  'Reference Invoice': 'Show original invoice reference in header',
  'Return Reason': 'Show reason description field in header',
  'Customer ID': 'Show customer selector in header',
  'Department': 'Show department field in header',
  'Sales Person': 'Show sales person field in header',
  'Email Address': 'Customer email address input field',
  'Phone Number': 'Customer landline phone number',
  'Mobile Number': 'Customer cell phone number',
  'Website Link': 'Customer company website URL',
  'Billing Address': 'Billing street, city, state and country',
  'Walk-in Customer': 'Allow walk-in retail customer setting',
  'Tax Filer': 'Filer/Non-Filer tax registration toggle',
  'Credit Limit': 'Maximum allowable credit balance',
  'Payment Terms': 'Default credit limit payment grace days',
  'Default Discount': 'Standard discount percentage for customer',
  'NTN Code': 'National Tax Number input field',
  'STRN Registry': 'Sales Tax Registration Number input field',
  'CNIC Number': 'National Identity Card number input field',
  'WHT Category': 'Withholding Tax category classification',
  'Total Balance': 'Customer opening or total balance',
  'Salesperson': 'Assigned sales representative link',
  'Category': 'Product group category picker',
  'Brand': 'Product manufacturer brand picker',
  'Model': 'Product hardware model designation',
  'Size': 'Product size / dimensions definition',
  'Unit Of Measure': 'Unit of measurement selection',
  'Weight (kg)': 'Product physical weight in kilograms',
  'Description': 'Product description/summary details',
  'Sale Price': 'Product standard selling retail price',
  'Cost Price': 'Product manufacturer cost price',
  'Stocks (qty)': 'Product standard opening stock quantity',
  'Low Stock Level': 'Low stock warning alert threshold level',
  'GST Rate': 'Standard GST tax rate percentage',
  'Non-Filer Rate': 'Tax rate percentage for non-filer clients',
  'HS Code': 'Harmonized System shipping code classification',
  'Serial Prefix': 'Auto-generated serial code prefix designation'
};

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  'Product Code': 'Show unique product/service code column',
  'Description': 'Show product title and summary details column',
  'Unit': 'Show packaging unit column (e.g. Box, Pcs)',
  'Details': 'Show extra specifications / description details column',
  'Qty': 'Show order quantity input column',
  'Returned Qty': 'Show return quantity input column',
  'Price': 'Show item unit price input column',
  'Discount': 'Show line-item discount input column',
  'Tax': 'Show Sales Tax percentage column',
  'Further Tax': 'Show Further Tax option column',
  'Total': 'Show computed line-item total price column',
  'Customer Details': 'Show Code & Name columns in client list',
  'Phone Number': 'Show client Email & Phone columns in list',
  'City': 'Show client city/province column',
  'Credit Limit (Rs.)': 'Show credit limit value column',
  'Total Balance (Rs.)': 'Show total balance value column',
  'Tax Status': 'Show filer/non-filer flag column',
  'Status': 'Show active/inactive state column',
  'Product Details': 'Show Code & Title details in product list',
  'In Stock': 'Show stock quantity levels column',
  'Price (Rs.)': 'Show selling price column',
  'Last Updated': 'Show last change/creation date column'
};

// Seed print templates (used for fallback template references)
const seedPrintTemplates = [
  { template_id: 'si-1', document_type: 'Sales Invoice' },
  { template_id: 'si-3', document_type: 'Sales Invoice' },
  { template_id: 'si-4', document_type: 'Sales Invoice' },
  { template_id: 'srt-1', document_type: 'Sales Return' }
];

const FIELD_TYPE_OPTIONS = [
  { value: 'Text', label: 'Text' },
  { value: 'Textarea', label: 'Textarea' },
  { value: 'Number', label: 'Number' },
  { value: 'Checkbox', label: 'Checkbox' },
  
  { value: 'Dropdown', label: 'Dropdown' },
];

const SECTION_OPTIONS = [
  { value: 'header', label: 'Header Fields' },
  { value: 'column', label: 'Items Table Columns' },
  { value: 'footer', label: 'Footer Fields' },
  { value: 'custom', label: 'Custom Sections' }
];

const WIDTH_OPTIONS = [
  { value: '25%', label: '25% (1/4 Width)' },
  { value: '33%', label: '33% (1/3 Width)' },
  { value: '50%', label: '50% (1/2 Width)' },
  { value: '66%', label: '66% (2/3 Width)' },
  { value: '75%', label: '75% (3/4 Width)' },
  { value: '100%', label: '100% (Full Width)' }
];

interface UnifiedField {
  id: string;
  name: string;
  label: string;
  category: 'header' | 'column' | 'footer' | 'custom';
  type: string;
  isCustom: boolean;
  description: string;
  placeholder: string;
  defaultValue: string;
  width: string;
  required: boolean;
  readOnly: boolean;
  showOnScreen: boolean;
  showOnPrint: boolean;
  active: boolean;
  optionsText?: string;
}

interface CustomFieldForm {
  id?: string;
  label: string;
  type: string;
  section: 'header' | 'column' | 'footer' | 'custom';
  description: string;
  placeholder: string;
  defaultValue: string;
  width: string;
  required: boolean;
  readOnly: boolean;
  showOnScreen: boolean;
  showOnPrint: boolean;
  active: boolean;
  optionsText?: string;
}

const mapDocTypeToTemplateDocType = (docType: string): string[] => {
  if (docType === 'Sale Invoice') return ['Sales Invoice', 'Sale Invoice'];
  if (docType === 'Sale Return') return ['Sales Return', 'Sale Return'];
  if (docType === 'Service Invoice') return ['Service Invoice'];
  if (docType === 'Digital Invoice') return ['Digital Invoice'];
  return [docType];
};

export const DocumentSettingsModule: React.FC<DocumentSettingsModuleProps> = ({
  brand,
  activeTab: controlledActiveTab,
  onTabChange,
  hideTabs = false
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<string>('Sale Invoice');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
  const setActiveTab = onTabChange !== undefined ? onTabChange : setLocalActiveTab;

  const [settings, setSettings] = useState<Record<string, DocumentViewSettings>>({});
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  // Custom field modal form states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; field: UnifiedField | null }>({ isOpen: false, field: null });
  const [formState, setFormState] = useState<CustomFieldForm>({
    label: '',
    type: 'Text',
    section: 'header',
    description: '',
    placeholder: '',
    defaultValue: '',
    width: '100%',
    required: false,
    readOnly: false,
    showOnScreen: true,
    showOnPrint: true,
    active: true
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('document_view_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load document settings', e);
    }
  }, []);

  const triggerSavedIndicator = () => {
    setSavedMessage(true);
    const timer = setTimeout(() => setSavedMessage(false), 1200);
    return () => clearTimeout(timer);
  };

  const getUnifiedFields = (docType: string): UnifiedField[] => {
    const docTypeSettings = settings[docType] || { fields: {}, columns: {}, customFields: [], standardOverrides: {}, deletedFields: [] };
    const customFields = docTypeSettings.customFields || [];
    const overrides = docTypeSettings.standardOverrides || {};
    const deleted = docTypeSettings.deletedFields || [];

    const list: UnifiedField[] = [];

    const addStandard = (name: string, category: 'header' | 'footer' | 'column') => {
      if (deleted.includes(name)) return;
      const override = overrides[name] || {};
      
      let defaultType = 'Text';
      if (name.includes('Date')) defaultType = 'Date';
      else if (name.includes('Price') || name.includes('Total') || name.includes('Charges') || name.includes('Amount') || name.includes('Balance')) defaultType = 'Currency';
      else if (name.includes('Discount') || name.includes('Rate')) defaultType = 'Percentage';
      else if (name.includes('Address') || name.includes('Terms') || name.includes('Notes') || name.includes('Description') || name.includes('Details')) defaultType = 'Textarea';
      else if (name.includes('Phone') || name.includes('Mobile')) defaultType = 'Phone';
      else if (name.includes('Email')) defaultType = 'Email';
      else if (name.includes('Customer') || name.includes('Category') || name.includes('Brand') || name.includes('Unit')) defaultType = 'Dropdown';
      else if (name === 'Walk-in Customer' || name === 'Tax Filer' || name === 'Status') defaultType = 'Switch';
      else if (name.includes('Qty') || name.includes('Number') || name.includes('Stocks') || name.includes('Limit') || name.includes('Level')) defaultType = 'Number';

      const isVisibleInSettings = category === 'column' 
        ? (docTypeSettings.columns?.[name] !== false)
        : (docTypeSettings.fields?.[name] !== false);

      list.push({
        id: `std-${category}-${name}`,
        name,
        label: override.label || name,
        category,
        type: override.type || defaultType,
        isCustom: false,
        description: override.description || FIELD_DESCRIPTIONS[name] || COLUMN_DESCRIPTIONS[name] || '',
        placeholder: override.placeholder || '',
        defaultValue: override.defaultValue || '',
        width: override.width || '100%',
        required: override.required || false,
        readOnly: override.readOnly || false,
        showOnScreen: override.showOnScreen !== undefined ? override.showOnScreen : isVisibleInSettings,
        showOnPrint: override.showOnPrint !== undefined ? override.showOnPrint : isVisibleInSettings,
        active: override.active !== false && isVisibleInSettings,
      });
    };

    const standardsHeader = DEFAULT_FIELDS[docType] || [];
    standardsHeader.forEach(f => addStandard(f, 'header'));

    const standardsFooter = DEFAULT_FOOTER[docType] || [];
    standardsFooter.forEach(f => addStandard(f, 'footer'));

    const standardsColumns = DEFAULT_COLUMNS[docType] || [];
    standardsColumns.forEach(c => addStandard(c, 'column'));

    customFields.forEach(cf => {
      if (deleted.includes(cf.name)) return;
      
      let optionsText = '';
      if (cf.options) {
        optionsText = cf.options.join(', ');
      }

      list.push({
        id: cf.id,
        name: cf.name,
        label: cf.label || cf.name,
        category: cf.category,
        type: cf.type || 'Text',
        isCustom: true,
        description: cf.description || '',
        placeholder: cf.placeholder || '',
        defaultValue: cf.defaultValue || '',
        width: cf.width || '100%',
        required: !!cf.required,
        readOnly: !!cf.readOnly,
        showOnScreen: cf.showOnScreen !== false,
        showOnPrint: cf.showOnPrint !== false,
        active: cf.active !== false,
        optionsText
      });
    });

    return list;
  };

  const syncCustomFieldsToTemplateDesigner = (
    docType: string,
    customFields: CustomFieldDefinition[],
    deletedFields: string[]
  ) => {
    let templates: any[] = [];
    try {
      const stored = localStorage.getItem('print_templates');
      templates = stored ? JSON.parse(stored) : seedPrintTemplates;
    } catch {
      templates = seedPrintTemplates;
    }

    const templateDocTypes = mapDocTypeToTemplateDocType(docType);
    const targetTemplates = templates.filter(t => 
      templateDocTypes.some(tdt => t.document_type?.toLowerCase() === tdt.toLowerCase())
    );

    if (targetTemplates.length === 0) return;

    let allCustomFields: any[] = [];
    try {
      const stored = localStorage.getItem('print_template_custom_fields');
      allCustomFields = stored ? JSON.parse(stored) : [];
    } catch {}

    let allColumns: any[] = [];
    try {
      const stored = localStorage.getItem('print_template_columns');
      allColumns = stored ? JSON.parse(stored) : [];
    } catch {}

    const mapToTemplateFieldType = (t: string): string => {
      const typeLower = t.toLowerCase();
      if (typeLower === 'formula field') return 'formula';
      if (typeLower === 'number' || typeLower === 'decimal' || typeLower === 'percentage') return 'number';
      if (typeLower === 'currency') return 'currency';
      if (typeLower === 'date' || typeLower === 'date time' || typeLower === 'time') return 'date';
      if (typeLower === 'checkbox') return 'checkbox';
      if (typeLower === 'switch') return 'boolean';
      if (typeLower === 'dropdown' || typeLower === 'multi select') return 'dropdown';
      if (typeLower === 'radio button') return 'radio';
      if (typeLower === 'textarea' || typeLower === 'signature' || typeLower === 'file upload' || typeLower === 'image') return 'multiline';
      return 'text';
    };

    const mapCategoryToPrintSection = (cat: string): string => {
      if (cat === 'header') return 'Invoice Information';
      if (cat === 'footer') return 'Footer';
      return 'Custom Fields';
    };

    allCustomFields = allCustomFields.filter(cf => {
      const isTargetTemplate = targetTemplates.some(t => t.template_id === cf.template_id);
      if (!isTargetTemplate) return true;
      return !deletedFields.some(df => df.toLowerCase() === cf.field_name.toLowerCase());
    });

    allColumns = allColumns.filter(col => {
      const isTargetTemplate = targetTemplates.some(t => t.template_id === col.template_id);
      if (!isTargetTemplate) return true;
      return !deletedFields.some(df => df.toLowerCase() === col.column_name.toLowerCase());
    });

    targetTemplates.forEach(t => {
      customFields.forEach((cf, idx) => {
        if (deletedFields.includes(cf.name)) return;
        const slug = cf.name.toLowerCase().replace(/\s+/g, '_');

        if (cf.category === 'column') {
          const colId = `col-${t.template_id}-${slug}`;
          const existingColIdx = allColumns.findIndex(col => col.column_id === colId || (col.template_id === t.template_id && col.column_name.toLowerCase() === cf.label.toLowerCase()));

          const newCol = {
            column_id: colId,
            template_id: t.template_id,
            column_name: cf.label || cf.name,
            display_order: 10 + idx,
            is_visible: cf.active !== false && cf.showOnPrint !== false,
            is_custom: true
          };

          if (existingColIdx >= 0) {
            allColumns[existingColIdx] = { ...allColumns[existingColIdx], ...newCol };
          } else {
            allColumns.push(newCol);
          }
        } else {
          const cfId = `cf-${t.template_id}-${slug}`;
          const existingFieldIdx = allCustomFields.findIndex(field => field.custom_field_id === cfId || (field.template_id === t.template_id && field.field_name.toLowerCase() === cf.label.toLowerCase()));

          const newField = {
            custom_field_id: cfId,
            template_id: t.template_id,
            field_name: cf.label || cf.name,
            field_type: mapToTemplateFieldType(cf.type),
            default_value: cf.defaultValue || '',
            display_order: 1 + idx,
            is_visible: cf.active !== false && cf.showOnPrint !== false,
            section_name: mapCategoryToPrintSection(cf.category),
            required: !!cf.required,
            font_size: 10,
            alignment: 'left',
            is_bold: false,
            color: '#000000',
            border: 'none',
            background: 'transparent',
            padding: '0px',
            width_percent: cf.width ? parseInt(cf.width) || 50 : 50,
            options: cf.options
          };

          if (existingFieldIdx >= 0) {
            allCustomFields[existingFieldIdx] = { ...allCustomFields[existingFieldIdx], ...newField };
          } else {
            allCustomFields.push(newField);
          }
        }
      });
    });

    localStorage.setItem('print_template_custom_fields', JSON.stringify(allCustomFields));
    localStorage.setItem('print_template_columns', JSON.stringify(allColumns));
  };

  const handleOpenEditModal = (field: UnifiedField) => {
    setFormState({
      id: field.id,
      label: field.label,
      type: field.type,
      section: field.category,
      description: field.description,
      placeholder: field.placeholder,
      defaultValue: field.defaultValue,
      width: field.width,
      required: field.required,
      readOnly: field.readOnly,
      showOnScreen: field.showOnScreen,
      showOnPrint: field.showOnPrint,
      active: field.active,
      optionsText: field.optionsText
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveField = () => {
    if (!formState.label.trim()) {
      setFormError('Field label is required');
      return;
    }

    const label = formState.label.trim();
    const current = settings[activeTab] || { fields: {}, columns: {}, customFields: [], standardOverrides: {}, deletedFields: [] };
    const customFields = current.customFields || [];
    const overrides = current.standardOverrides || {};
    const deletedFields = current.deletedFields || [];

    const isEdit = !!formState.id;
    const isCustom = formState.id ? !formState.id.startsWith('std-') : true;

    const options = formState.optionsText 
      ? formState.optionsText.split(',').map(o => o.trim()).filter(Boolean) 
      : undefined;

    if (isCustom) {
      const name = label;
      
      let originalName: string | null = null;
      if (isEdit && formState.id) {
        const found = customFields.find(cf => cf.id === formState.id);
        if (found) originalName = found.name;
      }

      const exists = customFields.some(cf => 
        cf.name.toLowerCase() === name.toLowerCase() && cf.name !== originalName
      );

      if (exists) {
        setFormError('A custom field with this name already exists!');
        return;
      }

      let updatedCustom = [...customFields];
      const newField: CustomFieldDefinition = {
        id: formState.id || `cf-${Date.now()}`,
        name,
        label,
        category: formState.section,
        type: formState.type,
        description: formState.description.trim() || undefined,
        placeholder: formState.placeholder.trim() || undefined,
        defaultValue: formState.defaultValue.trim() || undefined,
        width: formState.width || undefined,
        required: formState.required,
        readOnly: formState.readOnly,
        showOnScreen: formState.showOnScreen,
        showOnPrint: formState.showOnPrint,
        active: formState.active,
        options
      };

      if (isEdit && originalName) {
        updatedCustom = customFields.map(cf => cf.name === originalName ? newField : cf);
      } else {
        updatedCustom.push(newField);
      }

      const updatedFields = { ...current.fields, [name]: formState.active && formState.showOnScreen };
      const updatedColumns = { ...current.columns, [name]: formState.active && formState.showOnScreen };

      // Clean up old name if renamed
      if (originalName && originalName !== name) {
        delete updatedFields[originalName];
        delete updatedColumns[originalName];
      }

      const newSettings = {
        ...settings,
        [activeTab]: {
          ...current,
          fields: updatedFields,
          columns: updatedColumns,
          customFields: updatedCustom
        }
      };

      setSettings(newSettings);
      localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
      syncCustomFieldsToTemplateDesigner(activeTab, updatedCustom, deletedFields);
    } else {
      const originalName = formState.id!.replace(/^std-(header|footer|column)-/, '');
      const updatedOverrides = {
        ...overrides,
        [originalName]: {
          label,
          type: formState.type,
          category: formState.section,
          description: formState.description.trim() || undefined,
          placeholder: formState.placeholder.trim() || undefined,
          defaultValue: formState.defaultValue.trim() || undefined,
          width: formState.width || undefined,
          required: formState.required,
          readOnly: formState.readOnly,
          showOnScreen: formState.showOnScreen,
          showOnPrint: formState.showOnPrint,
          active: formState.active,
        }
      };

      const updatedFields = { ...current.fields, [originalName]: formState.active && formState.showOnScreen };
      const updatedColumns = { ...current.columns, [originalName]: formState.active && formState.showOnScreen };

      const newSettings = {
        ...settings,
        [activeTab]: {
          ...current,
          fields: updatedFields,
          columns: updatedColumns,
          standardOverrides: updatedOverrides
        }
      };

      setSettings(newSettings);
      localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
    }

    setShowModal(false);
    triggerSavedIndicator();
  };

  // handleDuplicateField is unused and commented out to satisfy tsc

  const handleConfirmDelete = (field: UnifiedField) => {
    setDeleteConfirm({ isOpen: true, field });
  };

  const doConfirmDelete = () => {
    const field = deleteConfirm.field;
    if (!field) return;

    const current = settings[activeTab] || { fields: {}, columns: {}, customFields: [], standardOverrides: {}, deletedFields: [] };
    const customFields = current.customFields || [];
    const deletedFields = current.deletedFields || [];

    let updatedCustom = [...customFields];
    if (field.isCustom) {
      updatedCustom = customFields.filter(cf => cf.name !== field.name);
    }

    const updatedDeleted = [...deletedFields];
    if (!updatedDeleted.includes(field.name)) {
      updatedDeleted.push(field.name);
    }

    const updatedFields = { ...current.fields };
    delete updatedFields[field.name];
    const updatedColumns = { ...current.columns };
    delete updatedColumns[field.name];

    const newSettings = {
      ...settings,
      [activeTab]: {
        ...current,
        fields: updatedFields,
        columns: updatedColumns,
        customFields: updatedCustom,
        deletedFields: updatedDeleted
      }
    };

    setSettings(newSettings);
    localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
    syncCustomFieldsToTemplateDesigner(activeTab, updatedCustom, updatedDeleted);
    triggerSavedIndicator();
  };

  const handleToggleHide = (field: UnifiedField) => {
    const current = settings[activeTab] || { fields: {}, columns: {}, customFields: [], standardOverrides: {}, deletedFields: [] };
    const customFields = current.customFields || [];
    const overrides = current.standardOverrides || {};
    const deletedFields = current.deletedFields || [];
    
    const newShowOnScreen = !field.showOnScreen;
    const newActive = newShowOnScreen;

    if (field.isCustom) {
      const updatedCustom = customFields.map(cf => {
        if (cf.name === field.name) {
          return { ...cf, showOnScreen: newShowOnScreen, active: newActive };
        }
        return cf;
      });

      const updatedFields = { ...current.fields, [field.name]: newShowOnScreen };
      const updatedColumns = { ...current.columns, [field.name]: newShowOnScreen };

      const newSettings = {
        ...settings,
        [activeTab]: {
          ...current,
          fields: updatedFields,
          columns: updatedColumns,
          customFields: updatedCustom
        }
      };

      setSettings(newSettings);
      localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
      syncCustomFieldsToTemplateDesigner(activeTab, updatedCustom, deletedFields);
    } else {
      const updatedOverrides = {
        ...overrides,
        [field.name]: {
          ...(overrides[field.name] || {}),
          showOnScreen: newShowOnScreen,
          active: newActive
        }
      };

      const updatedFields = { ...current.fields, [field.name]: newShowOnScreen };
      const updatedColumns = { ...current.columns, [field.name]: newShowOnScreen };

      const newSettings = {
        ...settings,
        [activeTab]: {
          ...current,
          fields: updatedFields,
          columns: updatedColumns,
          standardOverrides: updatedOverrides
        }
      };

      setSettings(newSettings);
      localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
    }
    triggerSavedIndicator();
  };

  // handleToggleActive and handleToggleAll are unused and commented out to satisfy tsc

  const renderSectionCard = (title: string, category: 'header' | 'column' | 'footer' | 'custom', IconComponent: any) => {
    const list = getUnifiedFields(activeTab).filter(f => f.category === category);
    
    return (
      <Card className="rounded-2xl overflow-hidden p-0 flex flex-col h-[260px]" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-black text-slate-700 tracking-wide">{title}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {category === 'custom' && (
              <button
                type="button"
                onClick={() => {
                  setFormState({
                    label: '',
                    type: 'Text',
                    section: category,
                    description: '',
                    placeholder: '',
                    defaultValue: '',
                    width: '100%',
                    required: false,
                    readOnly: false,
                    showOnScreen: true,
                    showOnPrint: true,
                    active: true,
                    optionsText: ''
                  });
                  setFormError('');
                  setShowModal(true);
                }}
                className="ml-1.5 flex items-center gap-0.5 text-[9px] font-black text-white px-2.5 py-1 rounded hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: brand.primary }}
              >
                <Plus className="w-2.5 h-2.5" /> Add
              </button>
            )}
          </div>
        </div>

        <div className="p-2 overflow-y-auto flex-1 custom-scrollbar space-y-1.5">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-4">
              <span className="text-[10px] font-bold">No fields in this section</span>
            </div>
          ) : (
            list.map(field => {
              return (
                <div
                  key={field.id}
                  className={`flex flex-col gap-0.5 py-1.5 px-2 rounded-lg border border-slate-200 bg-white ${!field.active ? 'opacity-55' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col min-w-0 flex-grow justify-center">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700 truncate max-w-[180px]" title={field.label}>
                          {field.label}
                        </span>
                        {field.isCustom && (
                          <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1 py-0.2 rounded border border-blue-100">
                            Custom
                          </span>
                        )}
                        {field.required && (
                          <span className="text-[8px] font-black bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-100">
                            Req
                          </span>
                        )}
                        {!field.active && (
                          <span className="text-[8px] font-black bg-red-50 text-red-600 px-1 py-0.2 rounded border border-red-100">
                            Off
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                      {/* Hide/Unhide */}
                      <button
                        type="button"
                        onClick={() => handleToggleHide(field)}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${field.showOnScreen ? 'text-slate-500' : 'text-slate-300'}`}
                        title={field.showOnScreen ? 'Hide Field' : 'Show Field'}
                      >
                        {field.showOnScreen ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit (Only for Custom Fields) */}
                      {field.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(field)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Field"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete (Only for Custom Fields) */}
                      {field.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(field)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-550 transition-colors cursor-pointer"
                          title="Delete Field"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Document Types Horizontal Tabs ── */}
      {!hideTabs && (
        <div className="flex flex-nowrap items-center gap-1 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 backdrop-blur-sm w-full">
          {DOC_TYPES.map(type => {
            const Icon = DOC_TYPE_ICONS[type] || FileText;
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTab(type)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
                style={{
                  backgroundColor: isActive ? brand.primary : 'transparent',
                }}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{type}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="space-y-6">
        <div className="flex justify-between items-center h-5">
          <p className="text-[11px] text-slate-400 font-medium font-sans">
            Configure visible fields and columns for <strong className="text-slate-600">{activeTab}</strong>. Changes save automatically.
          </p>
          {savedMessage && (
            <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1 animate-fade-in-out font-sans">
              <Check className="w-3.5 h-3.5" /> Settings Saved
            </div>
          )}
        </div>

        {(() => {
          const unifiedFields = getUnifiedFields(activeTab);
          const hasHeader = (DEFAULT_FIELDS[activeTab] && DEFAULT_FIELDS[activeTab].length > 0) || unifiedFields.some(f => f.category === 'header');
          const hasColumn = (DEFAULT_COLUMNS[activeTab] && DEFAULT_COLUMNS[activeTab].length > 0) || unifiedFields.some(f => f.category === 'column');
          const hasFooter = (DEFAULT_FOOTER[activeTab] && DEFAULT_FOOTER[activeTab].length > 0) || unifiedFields.some(f => f.category === 'footer');

          const onlyCustom = !hasHeader && !hasColumn && !hasFooter;

          if (onlyCustom) {
            return (
              <div className="flex">
                <div className="w-full lg:w-1/3">
                  {renderSectionCard('Custom sections', 'custom', Settings2)}
                </div>
              </div>
            );
          }

          const visibleCardsCount = (hasHeader ? 1 : 0) + (hasColumn ? 1 : 0) + (hasFooter ? 1 : 0) + 1;
          const gridClass = visibleCardsCount === 4
            ? "grid grid-cols-1 lg:grid-cols-4 gap-6"
            : visibleCardsCount === 3
              ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
              : visibleCardsCount === 2
                ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                : "grid grid-cols-1 gap-6";

          return (
            <div className={gridClass}>
              {hasHeader && renderSectionCard('Header fields', 'header', Layout)}
              {hasColumn && renderSectionCard('Items table columns', 'column', Columns)}
              {hasFooter && renderSectionCard('Footer fields', 'footer', FileText)}
              {renderSectionCard('Custom sections', 'custom', Settings2)}
            </div>
          );
        })()}
      </div>

      {/* Add / Edit Custom Field Dialog Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formState.id ? `✨ Edit Field: ${formState.label}` : '✨ Create Custom Field'}
        style={{ width: '600px', maxWidth: '90%' }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="white" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveField}
              style={{ backgroundColor: brand.primary }}
            >
              Save Field
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1 py-2">
          {/* Left Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b pb-1">Field Info</h4>
            <Input
              label={<span>Field Label <span className="text-red-500">*</span></span>}
              variant="compact"
              placeholder="e.g. Purchase Order"
              value={formState.label}
              onChange={e => setFormState({ ...formState, label: e.target.value })}
              error={formError}
            />
            
            <Select
              label="Field Type *"
              variant="compact"
              options={FIELD_TYPE_OPTIONS}
              value={formState.type}
              onChange={e => setFormState({ ...formState, type: e.target.value })}
            />

            <Select
              label="Section *"
              variant="compact"
              options={SECTION_OPTIONS}
              value={formState.section}
              onChange={e => setFormState({ ...formState, section: e.target.value as any })}
              disabled={true}
            />

            <TextArea
              label="Description"
              placeholder="Brief explanation of the field"
              value={formState.description}
              onChange={e => setFormState({ ...formState, description: e.target.value })}
              rows={3}
            />

            {['Dropdown', 'Multi Select', 'Radio Button', 'Checkbox'].includes(formState.type) && (
              <Input
                label="Options (Comma separated)"
                variant="compact"
                placeholder="e.g. Yes, No, Maybe"
                value={formState.optionsText || ''}
                onChange={e => setFormState({ ...formState, optionsText: e.target.value })}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b pb-1">Default & Constraints</h4>
            <Input
              label="Placeholder"
              variant="compact"
              placeholder="e.g. Enter order number"
              value={formState.placeholder}
              onChange={e => setFormState({ ...formState, placeholder: e.target.value })}
            />

            <Input
              label="Default Value"
              variant="compact"
              placeholder="e.g. PO-100"
              value={formState.defaultValue}
              onChange={e => setFormState({ ...formState, defaultValue: e.target.value })}
            />

            <Select
              label="Width"
              variant="compact"
              options={WIDTH_OPTIONS}
              value={formState.width}
              onChange={e => setFormState({ ...formState, width: e.target.value })}
            />

            <div className="pt-2 space-y-2.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b pb-1">Toggles</h4>
              <div className="flex flex-col gap-2">
                <Toggle
                  checked={formState.required}
                  onChange={val => setFormState({ ...formState, required: val })}
                  label="Required Field"
                  compact
                />
                <Toggle
                  checked={formState.readOnly}
                  onChange={val => setFormState({ ...formState, readOnly: val })}
                  label="Read Only Field"
                  compact
                />
                <Toggle
                  checked={formState.showOnScreen}
                  onChange={val => setFormState({ ...formState, showOnScreen: val })}
                  label="Show On Screen"
                  compact
                />
                <Toggle
                  checked={formState.showOnPrint}
                  onChange={val => setFormState({ ...formState, showOnPrint: val })}
                  label="Show On Print"
                  compact
                />
                <Toggle
                  checked={formState.active}
                  onChange={val => setFormState({ ...formState, active: val })}
                  label="Active Status"
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, field: null })}
        onConfirm={doConfirmDelete}
        title={deleteConfirm.field?.isCustom ? "Delete Custom Field?" : "Delete Standard Field?"}
        message={
          deleteConfirm.field?.isCustom
            ? `Are you sure you want to permanently delete custom field "${deleteConfirm.field.label}"?`
            : `Are you sure you want to delete standard field "${deleteConfirm.field?.label || ''}"? (You can add it back later if needed).`
        }
        confirmLabel="Yes, Delete"
        variant="danger"
      />
    </div>
  );
};
