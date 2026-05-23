import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Input, TextArea, ComboBox } from './FormControls';
import type { Product } from '../../pages/Products/ProductList';
import {
  ProductCategory,
  ProductBrand,
  ProductMake,
  ProductModel,
  ProductSize,
  ProductUOM
} from '../../pages/Products/ProductList';

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

const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}> = ({ checked, onChange, label }) => {
  const { brand } = useTheme();
  const toggleClasses = `relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none`;
  const thumb = checked ? `translate-x-4` : `translate-x-0`;
  return (
    <label className="inline-flex items-center space-x-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <span
        className={toggleClasses}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          backgroundColor: checked ? brand.primary : '#D1D5DB',
          width: '40px',
          height: '24px',
          padding: '2px',
        }}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ${thumb}`}
        />
      </span>
    </label>
  );
};

const InlineProductForm: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { brand } = useTheme();
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
    is_active: true
  });

  // Reset or populate form when it opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || '',
        code: initialData?.code || '',
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
        is_active: initialData?.is_active ?? true
      });
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert("Product name is required");
      return;
    }
    if (!formData.code?.trim()) {
      alert("Product code is required");
      return;
    }

    try {
      const stored = localStorage.getItem('products_list');
      const products: Product[] = stored ? JSON.parse(stored) : [];
      
      const newProduct: Product = {
        id: initialData?.id || crypto.randomUUID(),
        name: formData.name,
        code: formData.code,
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
        is_active: formData.is_active ?? true
      };

      if (initialData?.id) {
        const index = products.findIndex(p => p.id === initialData.id);
        if (index > -1) products[index] = newProduct;
        else products.push(newProduct);
      } else {
        products.push(newProduct);
      }

      localStorage.setItem('products_list', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save product.");
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
      <h3 className="text-[11px] font-black uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-4xl bg-white border shadow-2xl rounded-3xl overflow-hidden"
            style={{ borderColor: brand.dark + '20' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100">
                  <Box className="w-5 h-5" style={{ color: brand.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {initialData?.id ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Specify complete classification, pricing, tax and compliance rules</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body containing 9 Sections */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: '70vh' }}>
              
              {/* 1. BASIC INFO */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="1. Basic Info" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Logic Board Pro v4" />
                  <Input label="Product Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. PROD-1001" />
                </div>
              </div>

              {/* 2. CLASSIFICATION */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="2. Classification" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComboBox label="Category" value={formData.category_id || ''} onChange={(val) => setFormData({ ...formData, category_id: val })} options={ProductCategory} placeholder="Select Category" />
                  <ComboBox label="Brand" value={formData.brand_id || ''} onChange={(val) => setFormData({ ...formData, brand_id: val })} options={ProductBrand} placeholder="Select Brand" />
                  <ComboBox label="Make" value={formData.make_id || ''} onChange={(val) => setFormData({ ...formData, make_id: val })} options={ProductMake} placeholder="Select Make" />
                  <ComboBox label="Model" value={formData.model_id || ''} onChange={(val) => setFormData({ ...formData, model_id: val })} options={ProductModel} placeholder="Select Model" />
                  <ComboBox label="Size" value={formData.size_id || ''} onChange={(val) => setFormData({ ...formData, size_id: val })} options={ProductSize} placeholder="Select Size" />
                  <ComboBox label="UOM (Unit of Measure)" value={formData.uom_id || ''} onChange={(val) => setFormData({ ...formData, uom_id: val })} options={ProductUOM} placeholder="Select UOM" />
                </div>
              </div>

              {/* 3. PRICING */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="3. Pricing" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input label="Sale Price" type="number" value={formData.sale_price || ''} onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  <Input label="Cost" type="number" value={formData.cost || ''} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  <Input label="MRP Ex Tax" type="number" value={formData.mrp_ex_tax || ''} onChange={(e) => setFormData({ ...formData, mrp_ex_tax: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  <Input label="MRP Inc Tax" type="number" value={formData.mrp_inc_tax || ''} onChange={(e) => setFormData({ ...formData, mrp_inc_tax: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                </div>
              </div>

              {/* 4. STOCK INFO */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="4. Stock Info" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input label="Opening Qty" type="number" value={formData.opening_qty || ''} onChange={(e) => setFormData({ ...formData, opening_qty: parseFloat(e.target.value) || 0 })} placeholder="0" />
                  <Input label="Opening Rate" type="number" value={formData.opening_rate || ''} onChange={(e) => setFormData({ ...formData, opening_rate: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  <Input label="Low Stock Level" type="number" value={formData.low_stock_level || ''} onChange={(e) => setFormData({ ...formData, low_stock_level: parseFloat(e.target.value) || 0 })} placeholder="0" />
                  <Input label="Weight (kg)" type="number" value={formData.weight || ''} onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                </div>
              </div>

              {/* 5. TAX CONFIGURATION */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="5. Tax Configuration" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="GST %" type="number" value={formData.gst_rate || ''} onChange={(e) => setFormData({ ...formData, gst_rate: parseFloat(e.target.value) || 0 })} placeholder="0" />
                  <Input label="Non-Filer GST %" type="number" value={formData.non_filer_gst_rate || ''} onChange={(e) => setFormData({ ...formData, non_filer_gst_rate: parseFloat(e.target.value) || 0 })} placeholder="0" />
                  <Input label="ADT %" type="number" value={formData.adt_rate || ''} onChange={(e) => setFormData({ ...formData, adt_rate: parseFloat(e.target.value) || 0 })} placeholder="0" />
                </div>
              </div>

              {/* 6. DISCOUNT SETTINGS */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="6. Discount Settings" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Sale Discount %" type="number" value={formData.sale_discount || ''} onChange={(e) => setFormData({ ...formData, sale_discount: parseFloat(e.target.value) || 0 })} placeholder="0" />
                  <Input label="Purchase Discount %" type="number" value={formData.purchase_discount || ''} onChange={(e) => setFormData({ ...formData, purchase_discount: parseFloat(e.target.value) || 0 })} placeholder="0" />
                </div>
              </div>

              {/* 7. FBR / COMPLIANCE (ADVANCED) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="7. FBR / Compliance (Advanced)" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComboBox label="FBR UOM" value={formData.fbr_uom || ''} onChange={(val) => setFormData({ ...formData, fbr_uom: val })} options={FbrUomOptions} placeholder="Select FBR UOM" />
                  <Input label="SRO Item Serial No" value={formData.sro_item_serial_no} onChange={(e) => setFormData({ ...formData, sro_item_serial_no: e.target.value })} placeholder="SRO Serial No" />
                  <Input label="SRO Schedule No" value={formData.sro_schedule_no} onChange={(e) => setFormData({ ...formData, sro_schedule_no: e.target.value })} placeholder="SRO Schedule No" />
                  <Input label="FBR Sale Rate" type="number" value={formData.fbr_sale_rate || ''} onChange={(e) => setFormData({ ...formData, fbr_sale_rate: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  <ComboBox label="FBR Sale Type" value={formData.fbr_sale_type || ''} onChange={(val) => setFormData({ ...formData, fbr_sale_type: val })} options={FbrSaleTypeOptions} placeholder="Select Sale Type" />
                  <Input label="HS Code" value={formData.hs_code} onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })} placeholder="HS Code" />
                </div>
              </div>

              {/* 8. TAX LINKING */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="8. Tax Linking" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComboBox label="GST Tax Linking" value={formData.gst_tax_id || ''} onChange={(val) => setFormData({ ...formData, gst_tax_id: val })} options={TaxOptions} placeholder="Select GST Link" />
                  <ComboBox label="Non-Filer Tax Linking" value={formData.non_filer_tax_id || ''} onChange={(val) => setFormData({ ...formData, non_filer_tax_id: val })} options={NonFilerTaxOptions} placeholder="Select Non-Filer Link" />
                  <ComboBox label="ADT Tax Linking" value={formData.adt_tax_id || ''} onChange={(val) => setFormData({ ...formData, adt_tax_id: val })} options={AdtTaxOptions} placeholder="Select ADT Link" />
                  <ComboBox label="FBR Tax Linking" value={formData.fbr_tax_id || ''} onChange={(val) => setFormData({ ...formData, fbr_tax_id: val })} options={FbrTaxOptions} placeholder="Select FBR Link" />
                </div>
              </div>

              {/* 9. ADDITIONAL INFO */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader title="9. Additional Info" />
                <div className="p-5 space-y-4">
                  <TextArea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional description..." />
                  <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Internal notes..." />
                  <div className="pt-2">
                    <Toggle checked={!!formData.is_active} onChange={(val) => setFormData({ ...formData, is_active: val })} label="Product is Active" />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200/50 flex justify-end gap-2 bg-slate-50/50">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-90 hover:scale-102 active:scale-98"
                style={{ backgroundColor: brand.primary }}
              >
                <Save className="w-3.5 h-3.5" />
                {initialData?.id ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InlineProductForm;
