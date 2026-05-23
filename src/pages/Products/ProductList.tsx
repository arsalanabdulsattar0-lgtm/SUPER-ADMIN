import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Plus, Search, DollarSign, Percent, Trash2, Edit2, LayoutGrid, List, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';

export interface Product {
  id: string;
  name: string;
  code: string;
  category_id: string;
  brand_id: string;
  make_id: string;
  model_id: string;
  size_id: string;
  uom_id: string;
  sale_price: number;
  cost: number;
  mrp_ex_tax: number;
  mrp_inc_tax: number;
  opening_qty: number;
  opening_rate: number;
  low_stock_level: number;
  weight: number;
  gst_rate: number;
  non_filer_gst_rate: number;
  adt_rate: number;
  sale_discount: number;
  purchase_discount: number;
  fbr_uom: string;
  sro_item_serial_no: string;
  sro_schedule_no: string;
  fbr_sale_rate: number;
  fbr_sale_type: string;
  hs_code: string;
  gst_tax_id: string;
  non_filer_tax_id: string;
  adt_tax_id: string;
  fbr_tax_id: string;
  description: string;
  notes: string;
  is_active: boolean;
}

interface Props {
  onAddProductClick: () => void;
}

export const ProductCategory = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Hardware' },
  { id: 'cat-3', name: 'Cabling' },
  { id: 'cat-4', name: 'Networking' },
  { id: 'cat-5', name: 'Software' },
  { id: 'cat-6', name: 'Services' },
];

export const ProductBrand = [
  { id: 'br-1', name: 'Intel' },
  { id: 'br-2', name: 'Logitech' },
  { id: 'br-3', name: 'ASUS' },
  { id: 'br-4', name: 'Cisco' },
  { id: 'br-5', name: 'TP-Link' },
  { id: 'br-6', name: 'Generic' },
];

export const ProductMake = [
  { id: 'mk-1', name: 'USA' },
  { id: 'mk-2', name: 'China' },
  { id: 'mk-3', name: 'Taiwan' },
  { id: 'mk-4', name: 'Japan' },
  { id: 'mk-5', name: 'Germany' },
];

export const ProductModel = [
  { id: 'md-1', name: 'Pro v4' },
  { id: 'md-2', name: 'Airflow AF' },
  { id: 'md-3', name: 'Gen4 PCIe' },
  { id: 'md-4', name: 'Enterprise Managed' },
  { id: 'md-5', name: 'Standard Edition' },
];

export const ProductSize = [
  { id: 'sz-1', name: 'Standard' },
  { id: 'sz-2', name: '1 Meter' },
  { id: 'sz-3', name: '2TB Storage' },
  { id: 'sz-4', name: '32GB Capacity' },
  { id: 'sz-5', name: '1500VA Power' },
];

export const ProductUOM = [
  { id: 'uom-1', name: 'Pcs' },
  { id: 'uom-2', name: 'Box' },
  { id: 'uom-3', name: 'Meter' },
  { id: 'uom-4', name: 'Pack' },
  { id: 'uom-5', name: 'Job' },
];

const ProductList: React.FC<Props> = ({ onAddProductClick }) => {
  const { brand } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('products_view_mode');
      return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('products_view_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryName = (catId: string) => {
    return ProductCategory.find(c => c.id === catId)?.name || 'Uncategorized';
  };

  const getBrandName = (brandId: string) => {
    return ProductBrand.find(b => b.id === brandId)?.name || 'Generic';
  };

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products_list');
      const seededFlag = localStorage.getItem('products_seeded_v5');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.length > 0 && seededFlag === 'true') {
        setProducts(parsed);
      } else {
        // Seed 30 sample enterprise products
        const seededProducts: Product[] = Array.from({ length: 30 }, (_, i) => ({
          id: crypto.randomUUID(),
          name: `Enterprise Product ${i + 1}`,
          code: `PROD-${1000 + i}`,
          category_id: `cat-${(i % 6) + 1}`,
          brand_id: `br-${(i % 6) + 1}`,
          make_id: `mk-${(i % 5) + 1}`,
          model_id: `md-${(i % 5) + 1}`,
          size_id: `sz-${(i % 5) + 1}`,
          uom_id: `uom-${(i % 5) + 1}`,
          sale_price: 150 + i * 20,
          cost: 100 + i * 12,
          mrp_ex_tax: 140 + i * 18,
          mrp_inc_tax: 165 + i * 21,
          opening_qty: 50 + i,
          opening_rate: 100 + i * 12,
          low_stock_level: 10,
          weight: 1.5 + (i * 0.1),
          gst_rate: 18,
          non_filer_gst_rate: 24,
          adt_rate: 2,
          sale_discount: 5,
          purchase_discount: 8,
          fbr_uom: 'PCS',
          sro_item_serial_no: `SRO-SR-${100 + i}`,
          sro_schedule_no: `SCH-N-${200 + i}`,
          fbr_sale_rate: 150 + i * 20,
          fbr_sale_type: 'Taxable',
          hs_code: `HS-${8500 + i}`,
          gst_tax_id: 'tax-gst-18',
          non_filer_tax_id: 'tax-nf-4',
          adt_tax_id: 'tax-adt-1',
          fbr_tax_id: 'tax-fbr-active',
          description: `High-quality industrial standard enterprise grade product. Model-${(i % 5) + 1}.`,
          notes: 'Keep in dry place.',
          is_active: true
        }));

        setProducts(seededProducts);
        localStorage.setItem('products_list', JSON.stringify(seededProducts));
        localStorage.setItem('products_seeded_v5', 'true');
        window.dispatchEvent(new CustomEvent('ai-sync-data'));
      }
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleSync = () => loadProducts();
    window.addEventListener('ai-sync-data', handleSync);
    return () => window.removeEventListener('ai-sync-data', handleSync);
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const newProducts = products.filter(p => p.id !== id);
      localStorage.setItem('products_list', JSON.stringify(newProducts));
      setProducts(newProducts);
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
    }
  };

  const handleEditClick = (p: Product) => {
    window.dispatchEvent(new CustomEvent('open-product-form', { detail: { product: p } }));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans pb-32" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>Products</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage your enterprise inventory and compliant tax linking</p>
          </div>

          {/* Action elements on the far right */}
          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">
            {/* Search Input */}
            <div className="relative group w-full md:w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm font-medium text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none transition-all"
                style={{ borderColor: brand.dark + '20' }}
              />
            </div>

            <button
              onClick={onAddProductClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:opacity-90 cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: brand.primary }}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-white p-1 rounded-xl border shadow-sm flex-shrink-0" style={{ borderColor: brand.dark + '15' }}>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                style={viewMode === 'grid' ? { backgroundColor: brand.primary } : undefined}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                style={viewMode === 'list' ? { backgroundColor: brand.primary } : undefined}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid / List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
              <Box className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery ? "We couldn't find any products matching your search criteria." : "Your inventory is currently empty."}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddProductClick}
                className="text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                style={{ color: brand.primary, backgroundColor: `${brand.primary}15` }}
              >
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
          }>
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {viewMode === 'grid' ? (
                    <Card className="h-full flex flex-col hover:-translate-y-1 transition-all cursor-pointer group border-transparent hover:border-slate-200" onClick={() => handleEditClick(product)} style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          <Box className="w-5 h-5" style={{ color: brand.primary }} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(product); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id, product.name); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{product.code}</span>
                        {!product.is_active && <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-red-50 text-red-500">Inactive</span>}
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-1">{product.name}</h3>
                      <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                        <span>{getCategoryName(product.category_id)}</span>
                        <span>•</span>
                        <span>{getBrandName(product.brand_id)}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 h-8">{product.description || 'No description provided'}</p>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-black text-slate-800">{(product.sale_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs font-bold text-slate-500">
                          <Percent className="w-3 h-3" />
                          {product.gst_rate}% GST
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="hover:translate-x-1 transition-all cursor-pointer group border-transparent hover:border-slate-200" onClick={() => handleEditClick(product)} style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Icon & Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform flex-shrink-0">
                            <Box className="w-5 h-5" style={{ color: brand.primary }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{product.code}</span>
                              <h3 className="text-base font-bold text-slate-800 truncate">{product.name}</h3>
                              {!product.is_active && <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-red-50 text-red-500">Inactive</span>}
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              Category: {getCategoryName(product.category_id)} • Brand: {getBrandName(product.brand_id)} • {product.description || 'No description'}
                            </p>
                          </div>
                        </div>

                        {/* Right: Price, Tax & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                          {/* Price */}
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-base font-black text-slate-800">
                              {(product.sale_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Tax */}
                          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 min-w-[70px] justify-center">
                            <Percent className="w-3 h-3" />
                            <span>{product.gst_rate}% GST</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditClick(product); }}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(product.id, product.name); }}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
