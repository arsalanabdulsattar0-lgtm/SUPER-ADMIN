import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, Percent, ChevronLeft, ChevronRight, Package, Tag, Layers, CreditCard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Input, TextArea, ComboBox, Toggle } from './FormControls';
import Card from './Card';
import { Button } from './Button';
import { SectionHeader, ModalHeader } from './Typography';
import type { Product } from '../../pages/Products/ProductList';
import { AlertModal } from './AlertModal';
import { Toast } from './Toast';
import { getCodeSettingsForBranch, generateNextCode, incrementNextCode } from '../../utils/codeSettingsHelper';
import {
  ProductCategory,
  ProductBrand,
  ProductMake,
  ProductModel,
  ProductSize,
  ProductUOM,
  ProductSupplier,
  SalesAccountOptions,
  SalesDiscountAccountOptions,
  SalesReturnAccountOptions,
  ExpenseCOGSAccountOptions,
  PurchaseDiscountAccountOptions,
  StockAccountOptions
} from '../../utils/productData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Product>;
}

// Option lists for dropdowns
const TaxOptions = [
  { id: 'tax-gst-18', name: 'GST 18% (Standard)' },
  { id: 'tax-gst-17', name: 'GST 17%' },
  { id: 'tax-gst-10', name: 'GST 10% (Reduced)' },
  { id: 'tax-gst-0', name: 'GST 0% (Zero Rated)' },
];

const NonFilerTaxOptions = [
  { id: 'tax-nf-4', name: 'Non-Filer 4%' },
  { id: 'tax-nf-8', name: 'Non-Filer 8%' },
  { id: 'tax-nf-0', name: 'Non-Filer 0%' },
];

const AdtTaxOptions = [
  { id: 'tax-adt-1', name: 'ADT 1%' },
  { id: 'tax-adt-2', name: 'ADT 2%' },
  { id: 'tax-adt-0', name: 'ADT 0%' },
];

const FbrTaxOptions = [
  { id: 'tax-fbr-active', name: 'FBR Active' },
  { id: 'tax-fbr-exempt', name: 'FBR Exempt' },
];

const FbrUomOptions = [
  { id: 'PCS', name: 'PCS - Pieces' },
  { id: 'BOX', name: 'BOX - Boxes' },
  { id: 'MTR', name: 'MTR - Meters' },
  { id: 'JOB', name: 'JOB - Jobs' },
];

const FbrSaleTypeOptions = [
  { id: 'Taxable', name: 'Taxable Goods / Services' },
  { id: 'Exempt', name: 'Exempt Goods' },
  { id: 'Zero-Rated', name: 'Zero-Rated' },
];

const InlineProductForm: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { brand } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'tax'>('general');
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessageData, setToastMessageData] = useState<{ isOpen: boolean; messages: string[] }>({ isOpen: false, messages: [] });

  const validateForm = () => {
    const errs: Record<string, string> = {};
    const toastMsgs: string[] = [];
    if (!formData.name?.trim()) {
      errs.name = 'This field is required';
      toastMsgs.push('Product Name is required');
    }
    if (!formData.code?.trim()) {
      errs.code = 'This field is required';
      toastMsgs.push('Product Code is required');
    }
    setFormErrors(errs);
    if (toastMsgs.length > 0) {
      setToastMessageData({
        isOpen: true,
        messages: toastMsgs
      });
      setTimeout(() => {
        const firstInvalid = document.querySelector('[data-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = firstInvalid.querySelector('input, select, textarea') || firstInvalid;
          if (inputEl instanceof HTMLElement) {
            inputEl.focus();
          }
        }
      }, 100);
    }
    return Object.keys(errs).length === 0;
  };

  const codeSetting = useMemo(() => {
    try {
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      return getCodeSettingsForBranch(currentCoId, currentBrId).product;
    } catch {
      return { mode: 'auto' as const, prefix: 'PRD-', nextNumber: 1, padding: 4 };
    }
  }, [isOpen]);

  const docSettings = useMemo(() => {
    try {
      const stored = localStorage.getItem('document_view_settings');
      const allSettings = stored ? JSON.parse(stored) : {};
      const settingsForType = allSettings['Inventory'] || {};
      
      const defaultFields = {
        'Category': true,
        'Brand': true,
        'Model': true,
        'Size': true,
        'Unit Of Measure': true,
        'Weight (kg)': true,
        'Description': true,
        'Sale Price': true,
        'Cost Price': true,
        'Stocks (qty)': true,
        'Low Stock Level': true,
        'GST Rate': true,
        'Non-Filer Rate': true,
        'HS Code': true,
        'Serial Prefix': true
      };
      
      return { ...defaultFields, ...settingsForType.fields };
    } catch (e) {
      console.error('Failed to parse document view settings', e);
      return {
        'Category': true, 'Brand': true, 'Model': true, 'Size': true, 'Unit Of Measure': true,
        'Weight (kg)': true, 'Description': true, 'Sale Price': true, 'Cost Price': true,
        'Stocks (qty)': true, 'Low Stock Level': true, 'GST Rate': true, 'Non-Filer Rate': true,
        'HS Code': true, 'Serial Prefix': true
      };
    }
  }, [isOpen]);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category_id: '',
    brand_id: '',
    make_id: '',
    model_id: '',
    size_id: '',
    uom_id: '',
    sale_price: 0,
    cost: 0,
    mrp_ex_tax: 0,
    mrp_inc_tax: 0,
    opening_qty: 0,
    opening_rate: 0,
    low_stock_level: 0,
    weight: 0,
    gst_rate: 0,
    non_filer_gst_rate: 0,
    adt_rate: 0,
    sale_discount: 0,
    purchase_discount: 0,
    fbr_uom: '',
    sro_item_serial_no: '',
    sro_schedule_no: '',
    fbr_sale_rate: 0,
    fbr_sale_type: '',
    hs_code: '',
    gst_tax_id: '',
    non_filer_tax_id: '',
    adt_tax_id: '',
    fbr_tax_id: '',
    description: '',
    notes: '',
    is_active: true,
    length: 0,
    width: 0,
    preferred_supplier_id: '',
    sales_account: '',
    sales_discount_account: '',
    sales_return_account: '',
    expense_cogs_account: '',
    purchase_discount_account: '',
    stock_account: ''
  });

  // Reset or populate form when it opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('general');
      setFormErrors({});
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      
      const settings = getCodeSettingsForBranch(currentCoId, currentBrId).product;
      let nextCode = '';
      if (settings.mode === 'auto') {
        nextCode = generateNextCode('product', currentCoId, currentBrId);
      }

      setFormData({
        name: initialData?.name || '',
        code: initialData?.code || nextCode,
        category_id: initialData?.category_id || '',
        brand_id: initialData?.brand_id || '',
        make_id: initialData?.make_id || '',
        model_id: initialData?.model_id || '',
        size_id: initialData?.size_id || '',
        uom_id: initialData?.uom_id || '',
        sale_price: initialData?.sale_price || 0,
        cost: initialData?.cost || 0,
        mrp_ex_tax: initialData?.mrp_ex_tax || 0,
        mrp_inc_tax: initialData?.mrp_inc_tax || 0,
        opening_qty: initialData?.opening_qty || 0,
        opening_rate: initialData?.opening_rate || 0,
        low_stock_level: initialData?.low_stock_level || 0,
        weight: initialData?.weight || 0,
        gst_rate: initialData?.gst_rate || 0,
        non_filer_gst_rate: initialData?.non_filer_gst_rate || 0,
        adt_rate: initialData?.adt_rate || 0,
        sale_discount: initialData?.sale_discount || 0,
        purchase_discount: initialData?.purchase_discount || 0,
        fbr_uom: initialData?.fbr_uom || '',
        sro_item_serial_no: initialData?.sro_item_serial_no || '',
        sro_schedule_no: initialData?.sro_schedule_no || '',
        fbr_sale_rate: initialData?.fbr_sale_rate || 0,
        fbr_sale_type: initialData?.fbr_sale_type || '',
        hs_code: initialData?.hs_code || '',
        gst_tax_id: initialData?.gst_tax_id || '',
        non_filer_tax_id: initialData?.non_filer_tax_id || '',
        adt_tax_id: initialData?.adt_tax_id || '',
        fbr_tax_id: initialData?.fbr_tax_id || '',
        description: initialData?.description || '',
        notes: initialData?.notes || '',
        is_active: initialData?.is_active ?? true,
        length: initialData?.length || 0,
        width: initialData?.width || 0,
        preferred_supplier_id: initialData?.preferred_supplier_id || '',
        sales_account: initialData?.sales_account || '',
        sales_discount_account: initialData?.sales_discount_account || '',
        sales_return_account: initialData?.sales_return_account || '',
        expense_cogs_account: initialData?.expense_cogs_account || '',
        purchase_discount_account: initialData?.purchase_discount_account || '',
        stock_account: initialData?.stock_account || ''
      });
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!validateForm()) {
      setActiveTab('general');
      return;
    }

    try {
      const stored = localStorage.getItem('products_list');
      const products: Product[] = stored ? JSON.parse(stored) : [];

      const newProduct: Product = {
        id: initialData?.id || crypto.randomUUID(),
        name: formData.name || '',
        code: formData.code || '',
        category_id: formData.category_id || '',
        brand_id: formData.brand_id || '',
        make_id: formData.make_id || '',
        model_id: formData.model_id || '',
        size_id: formData.size_id || '',
        uom_id: formData.uom_id || '',
        sale_price: formData.sale_price || 0,
        cost: formData.cost || 0,
        mrp_ex_tax: formData.mrp_ex_tax || 0,
        mrp_inc_tax: formData.mrp_inc_tax || 0,
        opening_qty: formData.opening_qty || 0,
        opening_rate: formData.opening_rate || 0,
        low_stock_level: formData.low_stock_level || 0,
        weight: formData.weight || 0,
        gst_rate: formData.gst_rate || 0,
        non_filer_gst_rate: formData.non_filer_gst_rate || 0,
        adt_rate: formData.adt_rate || 0,
        sale_discount: formData.sale_discount || 0,
        purchase_discount: formData.purchase_discount || 0,
        fbr_uom: formData.fbr_uom || '',
        sro_item_serial_no: formData.sro_item_serial_no || '',
        sro_schedule_no: formData.sro_schedule_no || '',
        fbr_sale_rate: formData.fbr_sale_rate || 0,
        fbr_sale_type: formData.fbr_sale_type || '',
        hs_code: formData.hs_code || '',
        gst_tax_id: formData.gst_tax_id || '',
        non_filer_tax_id: formData.non_filer_tax_id || '',
        adt_tax_id: formData.adt_tax_id || '',
        fbr_tax_id: formData.fbr_tax_id || '',
        description: formData.description || '',
        notes: formData.notes || '',
        is_active: formData.is_active ?? true,
        length: formData.length || 0,
        width: formData.width || 0,
        created_at: initialData?.created_at || new Date().toISOString().split('T')[0],
        preferred_supplier_id: formData.preferred_supplier_id || '',
        sales_account: formData.sales_account || '',
        sales_discount_account: formData.sales_discount_account || '',
        sales_return_account: formData.sales_return_account || '',
        expense_cogs_account: formData.expense_cogs_account || '',
        purchase_discount_account: formData.purchase_discount_account || '',
        stock_account: formData.stock_account || ''
      };

      if (initialData?.id) {
        const index = products.findIndex(p => p.id === initialData.id);
        if (index > -1) products[index] = newProduct;
        else products.push(newProduct);
      } else {
        products.push(newProduct);

        // Increment sequence count if auto coding is enabled
        const activeCo = sessionStorage.getItem('active_company');
        const activeBr = sessionStorage.getItem('active_branch');
        const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
        const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
        
        const settings = getCodeSettingsForBranch(currentCoId, currentBrId).product;
        if (settings.mode === 'auto' && formData.code) {
          incrementNextCode('product', currentCoId, currentBrId);
        }
      }

      localStorage.setItem('products_list', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
      onClose();
    } catch (e) {
      console.error(e);
      setAlertModal({ isOpen: true, title: 'Save failed', message: 'Failed to save product. Please try again.' });
    }
  };



  const getStepStyles = (step: 'general' | 'tax' | 'pricing') => {
    const order = { general: 0, tax: 1, pricing: 2 };
    const activeOrder = order[activeTab];
    const stepOrder = order[step];

    if (activeOrder === stepOrder) {
      // Active
      return {
        circle: {
          borderColor: brand.primary,
          backgroundColor: brand.primary,
          color: '#ffffff',
        },
        label: {
          color: brand.primary,
          fontWeight: '600' as const,
        }
      };
    } else if (activeOrder > stepOrder) {
      // Completed
      return {
        circle: {
          borderColor: brand.primary,
          backgroundColor: '#ffffff',
          color: brand.primary,
        },
        label: {
          color: '#475569', // slate-600
          fontWeight: '500' as const,
        }
      };
    } else {
      // Pending
      return {
        circle: {
          borderColor: '#E2E8F0', // slate-200
          backgroundColor: '#ffffff',
          color: '#94A3B8', // slate-400
        },
        label: {
          color: '#94A3B8', // slate-400
          fontWeight: '400' as const,
        }
      };
    }
  };

  const handleNext = () => {
    if (activeTab === 'general') {
      if (!validateForm()) return;
      setActiveTab('tax');
    } else if (activeTab === 'tax') {
      setActiveTab('pricing');
    }
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Floating Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-4xl bg-white border shadow-none rounded-3xl h-[650px] max-h-[90vh] flex flex-col overflow-hidden"
            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
          >
            {/* Header */}
            <ModalHeader
              title={initialData?.id ? `Edit Product: ${formData.name || ''}` : 'Create New Product'}
              onClose={onClose}
            />

            {/* Stepper Wizard Progression */}
            <div className="px-6 pb-6 flex justify-center flex-shrink-0 bg-white">
              <div className="relative w-full max-w-xl flex items-center justify-between">

                {/* Connecting lines */}
                <div className="absolute left-6 right-6 top-6 h-[1px] bg-slate-200" style={{ zIndex: 0 }} />

                {/* Active connecting progress line */}
                <div
                  className="absolute left-6 top-6 h-[1px] transition-all duration-300"
                  style={{
                    zIndex: 0,
                    backgroundColor: brand.primary,
                    width: activeTab === 'general' ? '0%' : activeTab === 'tax' ? '50%' : '100%'
                  }}
                />

                {/* Step 1: Basic Info */}
                <div className="flex flex-col items-center" style={{ zIndex: 1 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-none"
                    style={getStepStyles('general').circle}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <span
                    className="text-xs mt-2 tracking-wide transition-colors duration-300"
                    style={getStepStyles('general').label}
                  >
                    Basic Info
                  </span>
                </div>

                {/* Step 2: Tax & Compliance */}
                <div className="flex flex-col items-center" style={{ zIndex: 1 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!validateForm()) {
                        setActiveTab('general');
                        return;
                      }
                      setActiveTab('tax');
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-none"
                    style={getStepStyles('tax').circle}
                  >
                    <Percent className="w-5 h-5" />
                  </button>
                  <span
                    className="text-xs mt-2 tracking-wide transition-colors duration-300"
                    style={getStepStyles('tax').label}
                  >
                    Tax & Compliance
                  </span>
                </div>

                {/* Step 3: Details */}
                <div className="flex flex-col items-center" style={{ zIndex: 1 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!validateForm()) {
                        setActiveTab('general');
                        return;
                      }
                      setActiveTab('pricing');
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-none"
                    style={getStepStyles('pricing').circle}
                  >
                    <Package className="w-5 h-5" />
                  </button>
                  <span
                    className="text-xs mt-2 tracking-wide transition-colors duration-300"
                    style={getStepStyles('pricing').label}
                  >
                    Accounts
                  </span>
                </div>

              </div>
            </div>

            {/* Scrollable Body containing Tabbed Sections */}
            <div className="flex-1 px-8 py-6 space-y-4 overflow-y-auto custom-scrollbar">

              {activeTab === 'general' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <SectionHeader title="Basic Information" icon={Tag} />
                    <Card className="p-4 shadow-none" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          variant="compact"
                          label="Product Name *"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, name: '' }));
                          }}
                          error={formErrors.name}
                          placeholder="e.g. Logic board pro v4"
                        />
                        <Input
                          variant="compact"
                          label="Product Code *"
                          value={formData.code}
                          onChange={(e) => {
                            setFormData({ ...formData, code: e.target.value });
                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, code: '' }));
                          }}
                          error={formErrors.code}
                          placeholder="e.g. PRD-0001"
                          readOnly={codeSetting.mode === 'auto'}
                        />
                        {docSettings['Unit Of Measure'] && (
                          <ComboBox variant="compact" label="UOM" value={formData.uom_id || ''} onChange={(val) => setFormData({ ...formData, uom_id: val })} options={ProductUOM} placeholder="Select UOM" />
                        )}
                        {docSettings['Sale Price'] && (
                          <Input variant="compact" label="Sale Price" type="number" value={formData.sale_price || ''} onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        )}
                        {docSettings['Cost Price'] && (
                          <Input variant="compact" label="Cost" type="number" value={formData.cost || ''} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        )}
                        <Input variant="compact" label="MRP ex tax" type="number" value={formData.mrp_ex_tax || ''} onChange={(e) => setFormData({ ...formData, mrp_ex_tax: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        <Input variant="compact" label="MRP inc tax" type="number" value={formData.mrp_inc_tax || ''} onChange={(e) => setFormData({ ...formData, mrp_inc_tax: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                      </div>
                    </Card>
                  </div>

                  {/* Card 2: Classification & Description */}
                  <div className="space-y-1.5">
                    <SectionHeader title="Classification & Details" icon={Layers} />
                    <Card className="p-4 shadow-none" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {docSettings['Category'] && (
                            <ComboBox variant="compact" label="Category" value={formData.category_id || ''} onChange={(val) => setFormData({ ...formData, category_id: val })} options={ProductCategory} placeholder="Select Category" />
                          )}
                          {docSettings['Brand'] && (
                            <ComboBox variant="compact" label="Brand" value={formData.brand_id || ''} onChange={(val) => setFormData({ ...formData, brand_id: val })} options={ProductBrand} placeholder="Select Brand" />
                          )}
                          <ComboBox variant="compact" label="Make" value={formData.make_id || ''} onChange={(val) => setFormData({ ...formData, make_id: val })} options={ProductMake} placeholder="Select Make" />
                          {docSettings['Model'] && (
                            <ComboBox variant="compact" label="Model" value={formData.model_id || ''} onChange={(val) => setFormData({ ...formData, model_id: val })} options={ProductModel} placeholder="Select Model" />
                          )}
                          {docSettings['Size'] && (
                            <ComboBox variant="compact" label="Size" value={formData.size_id || ''} onChange={(val) => setFormData({ ...formData, size_id: val })} options={ProductSize} placeholder="Select Size" />
                          )}
                          <ComboBox variant="compact" label="Preferred Supplier" value={formData.preferred_supplier_id || ''} onChange={(val) => setFormData({ ...formData, preferred_supplier_id: val })} options={ProductSupplier} placeholder="Select Supplier" />
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {docSettings['Description'] && (
                              <TextArea className="!rounded-lg text-[11px] py-1.5 px-3 h-14" label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional description..." />
                            )}
                            <TextArea className="!rounded-lg text-[11px] py-1.5 px-3 h-14" label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Internal notes..." />
                          </div>
                          <div className="pt-1">
                            <Toggle checked={!!formData.is_active} onChange={(val) => setFormData({ ...formData, is_active: val })} label="Product Is Active" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <SectionHeader title="Accounts" icon={CreditCard} />
                  <Card className="p-4 shadow-none" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <ComboBox
                        variant="compact"
                        label="Sales Account"
                        value={formData.sales_account || ''}
                        onChange={(val) => setFormData({ ...formData, sales_account: val })}
                        options={SalesAccountOptions}
                        placeholder="Select Sales Account"
                      />
                      <ComboBox
                        variant="compact"
                        label="Sales Discount Account"
                        value={formData.sales_discount_account || ''}
                        onChange={(val) => setFormData({ ...formData, sales_discount_account: val })}
                        options={SalesDiscountAccountOptions}
                        placeholder="Select Sales Discount Account"
                      />
                      <ComboBox
                        variant="compact"
                        label="Sales Return Account"
                        value={formData.sales_return_account || ''}
                        onChange={(val) => setFormData({ ...formData, sales_return_account: val })}
                        options={SalesReturnAccountOptions}
                        placeholder="Select Sales Return Account"
                      />
                      <ComboBox
                        variant="compact"
                        label="Expense/COGS Account"
                        value={formData.expense_cogs_account || ''}
                        onChange={(val) => setFormData({ ...formData, expense_cogs_account: val })}
                        options={ExpenseCOGSAccountOptions}
                        placeholder="Select Expense/COGS Account"
                      />
                      <ComboBox
                        variant="compact"
                        label="Purchase Discount Account"
                        value={formData.purchase_discount_account || ''}
                        onChange={(val) => setFormData({ ...formData, purchase_discount_account: val })}
                        options={PurchaseDiscountAccountOptions}
                        placeholder="Select Purchase Discount Account"
                      />
                      <ComboBox
                        variant="compact"
                        label="Stock Account"
                        value={formData.stock_account || ''}
                        onChange={(val) => setFormData({ ...formData, stock_account: val })}
                        options={StockAccountOptions}
                        placeholder="Select Stock Account"
                      />
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'tax' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <SectionHeader title="Tax Compliance & FBR Linking" icon={Percent} />
                  <Card className="p-4 shadow-none" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    <div className="space-y-4">
                      {/* Tax Configuration Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {docSettings['GST Rate'] && (
                          <Input variant="compact" label="GST %" type="number" value={formData.gst_rate || ''} onChange={(e) => setFormData({ ...formData, gst_rate: parseFloat(e.target.value) || 0 })} placeholder="0" />
                        )}
                        {docSettings['Non-Filer Rate'] && (
                          <Input variant="compact" label="Non-Filer GST %" type="number" value={formData.non_filer_gst_rate || ''} onChange={(e) => setFormData({ ...formData, non_filer_gst_rate: parseFloat(e.target.value) || 0 })} placeholder="0" />
                        )}
                        <Input variant="compact" label="ADT %" type="number" value={formData.adt_rate || ''} onChange={(e) => setFormData({ ...formData, adt_rate: parseFloat(e.target.value) || 0 })} placeholder="0" />
                      </div>

                      {/* FBR / Compliance Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <ComboBox variant="compact" label="FBR UOM" value={formData.fbr_uom || ''} onChange={(val) => setFormData({ ...formData, fbr_uom: val })} options={FbrUomOptions} placeholder="Select FBR UOM" />
                        <Input variant="compact" label="SRO Item Serial No" value={formData.sro_item_serial_no} onChange={(e) => setFormData({ ...formData, sro_item_serial_no: e.target.value })} placeholder="SRO Serial No" />
                        <Input variant="compact" label="SRO Schedule No" value={formData.sro_schedule_no} onChange={(e) => setFormData({ ...formData, sro_schedule_no: e.target.value })} placeholder="SRO Schedule No" />
                        <Input variant="compact" label="FBR Sale Rate" type="number" value={formData.fbr_sale_rate || ''} onChange={(e) => setFormData({ ...formData, fbr_sale_rate: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        <ComboBox variant="compact" label="FBR Sale Type" value={formData.fbr_sale_type || ''} onChange={(val) => setFormData({ ...formData, fbr_sale_type: val })} options={FbrSaleTypeOptions} placeholder="Select Sale Type" />
                        {docSettings['HS Code'] && (
                          <Input variant="compact" label="HS Code" value={formData.hs_code} onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })} placeholder="HS Code" />
                        )}
                      </div>

                      {/* Tax Linking Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {docSettings['GST Rate'] && (
                          <ComboBox variant="compact" label="GST Tax Linking" value={formData.gst_tax_id || ''} onChange={(val) => setFormData({ ...formData, gst_tax_id: val })} options={TaxOptions} placeholder="Select GST Link" />
                        )}
                        {docSettings['Non-Filer Rate'] && (
                          <ComboBox variant="compact" label="Non-Filer Tax Linking" value={formData.non_filer_tax_id || ''} onChange={(val) => setFormData({ ...formData, non_filer_tax_id: val })} options={NonFilerTaxOptions} placeholder="Select Non-Filer Link" />
                        )}
                        <ComboBox variant="compact" label="ADT Tax Linking" value={formData.adt_tax_id || ''} onChange={(val) => setFormData({ ...formData, adt_tax_id: val })} options={AdtTaxOptions} placeholder="Select ADT Link" />
                        <ComboBox variant="compact" label="FBR Tax Linking" value={formData.fbr_tax_id || ''} onChange={(val) => setFormData({ ...formData, fbr_tax_id: val })} options={FbrTaxOptions} placeholder="Select FBR Link" />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#E2E8F0] flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              {/* Left action (Back button) */}
              <div>
                {activeTab !== 'general' && (
                  <Button
                    type="button"
                    variant="white"
                    size="md"
                    icon={ChevronLeft}
                    onClick={() => {
                      if (activeTab === 'tax') setActiveTab('general');
                      else if (activeTab === 'pricing') setActiveTab('tax');
                    }}
                  >
                    Back
                  </Button>
                )}
              </div>

              {/* Right actions (Cancel + Next/Save buttons) */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="white"
                  size="md"
                  onClick={onClose}
                >
                  Cancel
                </Button>

                {activeTab !== 'pricing' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    icon={ChevronRight}
                    iconPosition="right"
                    onClick={handleNext}
                    style={{ backgroundColor: brand.primary }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    icon={Save}
                    onClick={handleSave}
                    className="bg-emerald-500 hover:bg-emerald-600 shadow-none text-white"
                  >
                    {initialData?.id ? 'Save Changes' : 'Add Product'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <AlertModal
      isOpen={alertModal.isOpen}
      onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      title={alertModal.title}
      message={alertModal.message}
      variant="warning"
    />
    <Toast
      isOpen={toastMessageData.isOpen}
      onClose={() => setToastMessageData(prev => ({ ...prev, isOpen: false }))}
      messages={toastMessageData.messages}
    />
    </>
  );
};

export default InlineProductForm;
