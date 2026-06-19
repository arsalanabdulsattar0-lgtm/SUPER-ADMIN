import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Plus, Search, Trash2, Edit2, LayoutGrid, List,
  SlidersHorizontal, ArrowUpDown, X, Eye,
  FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight,
  CreditCard, ShieldCheck, Printer, QrCode
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getQRCodeSvgPath, formatExpiryDate } from '../../utils/qrCode';
import { PageHeader, SectionHeader, TableHeader, CardTitle, ModalHeader } from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import { ScrollArea, Input } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { ProductFilterDrawer } from '../../components/ui/ProductFilterDrawer';
import { ActiveChip, InactiveChip } from '../../components/ui/Chip';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  ProductCategory,
  ProductBrand,
  ProductModel,
  ProductSize,
  ProductUOM
} from '../../utils/productData';

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
  length?: number;
  width?: number;
  created_at?: string;
  preferred_supplier_id?: string;
  sales_account?: string;
  sales_discount_account?: string;
  sales_return_account?: string;
  expense_cogs_account?: string;
  purchase_discount_account?: string;
  stock_account?: string;
  expiry_date?: string;
}

interface Props {
  onAddProductClick: () => void;
}

type SortKey = 'name' | 'code' | 'price' | 'qty' | 'status' | 'category_id' | 'expiry_date';
type SortDir = 'asc' | 'desc';

const ProductList: React.FC<Props> = ({ onAddProductClick }) => {
  const { brand } = useTheme();

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
      
      const defaultColumns = {
        'Product Details': true,
        'Category': true,
        'In Stock': true,
        'Price (Rs.)': true,
        'Expiry Date': true,
        'Status': true,
        'Last Updated': true
      };
      
      return {
        fields: { ...defaultFields, ...settingsForType.fields },
        columns: { ...defaultColumns, ...settingsForType.columns }
      };
    } catch (e) {
      console.error('Failed to parse document view settings', e);
      return {
        fields: {
          'Category': true, 'Brand': true, 'Model': true, 'Size': true, 'Unit Of Measure': true,
          'Weight (kg)': true, 'Description': true, 'Sale Price': true, 'Cost Price': true,
          'Stocks (qty)': true, 'Low Stock Level': true, 'GST Rate': true, 'Non-Filer Rate': true,
          'HS Code': true, 'Serial Prefix': true
        },
        columns: {
          'Product Details': true, 'Category': true, 'In Stock': true, 'Price (Rs.)': true,
          'Expiry Date': true, 'Status': true, 'Last Updated': true
        }
      };
    }
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  // Interactive Filters & Sorting States
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-1');
  const [priceOperator, setPriceOperator] = useState<string>('all');
  const [priceValue, setPriceValue] = useState<string>('');
  const [stockOperator, setStockOperator] = useState<string>('all');
  const [stockValue, setStockValue] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [fromProductId, setFromProductId] = useState<string>('All');
  const [toProductId, setToProductId] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Panel Open States
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [openAction, setOpenAction] = useState<string | null>(null);

  // Layout View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('products_view_mode');
      return saved === 'grid' ? 'grid' : 'list'; // default to list view (table)
    } catch {
      return 'list';
    }
  });

  // Selected Products for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Viewing detail product modal
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewingQrProduct, setViewingQrProduct] = useState<Product | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [bulkConfirmModal, setBulkConfirmModal] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const perPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setShowSortPanel(false);
      }
      if (openAction && !target.closest('.action-menu-container')) {
        setOpenAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openAction]);

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

  const getUOMName = (uomId: string) => {
    return ProductUOM.find(u => u.id === uomId)?.name || 'Pcs';
  };

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products_list');
      const seededFlag = localStorage.getItem('products_seeded_v7');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.length > 0 && seededFlag === 'true') {
        setProducts(parsed);
      } else {
        // Seed 30 sample enterprise products
        const seededProducts: Product[] = Array.from({ length: 30 }, (_, i) => ({
          id: crypto.randomUUID(),
          name: i === 0 ? 'Droop Shoulder T-shirt'
            : i === 1 ? 'T-shirt Slim-fit'
              : i === 2 ? 'Winter Hoodie'
                : i === 3 ? 'Casual Hoodie'
                  : i === 4 ? 'Printed Hoodie'
                    : i === 5 ? 'Hoodie Slim-fit'
                      : i === 6 ? 'Winter Sweet Hoodie'
                        : i === 7 ? 'Olives Hoodie'
                          : i === 8 ? 'Paracetamol 500mg'
                            : `Enterprise Product ${i + 1}`,
          code: i === 8 ? 'PRD-0001' : `GD${36457 + i}`,
          expiry_date: i === 8 ? '31-Dec-2027'
            : i % 3 === 0 ? '30-Jun-2028'
              : i % 3 === 1 ? '31-Dec-2026'
                : '15-Aug-2027',
          category_id: `cat-${(i % 6) + 1}`,
          brand_id: `br-${(i % 6) + 1}`,
          make_id: `mk-${(i % 5) + 1}`,
          model_id: `md-${(i % 5) + 1}`,
          size_id: `sz-${(i % 5) + 1}`,
          uom_id: `uom-${(i % 5) + 1}`,
          sale_price: 50 + (i * 12.5),
          cost: 30 + (i * 8.5),
          mrp_ex_tax: 45 + (i * 11.5),
          mrp_inc_tax: 53.1 + (i * 13.57),
          opening_qty: 30 + (i * 4) > 100 ? 50 : 30 + (i * 4),
          opening_rate: 30 + (i * 8.5),
          low_stock_level: 10,
          weight: 0.5 + (i * 0.05),
          gst_rate: 18,
          non_filer_gst_rate: 24,
          adt_rate: 2,
          sale_discount: 5,
          purchase_discount: 8,
          fbr_uom: 'PCS',
          sro_item_serial_no: `SRO-SR-${100 + i}`,
          sro_schedule_no: `SCH-N-${200 + i}`,
          fbr_sale_rate: 50 + (i * 12.5),
          fbr_sale_type: 'Taxable',
          hs_code: `HS-${8500 + i}`,
          gst_tax_id: 'tax-gst-18',
          non_filer_tax_id: 'tax-nf-4',
          adt_tax_id: 'tax-adt-1',
          fbr_tax_id: 'tax-fbr-active',
          description: i < 8 ? `${i % 2 === 0 ? 'Comfortable cotton blend stylish hoodie for winter.' : 'Casual lightweight daily wear slim-fit clothing.'}` : `High-quality industrial standard enterprise grade product. Model-${(i % 5) + 1}.`,
          notes: 'Wash with similar colors.',
          is_active: i % 3 !== 2,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_supplier_id: `sup-${(i % 5) + 1}`
        }));

        setProducts(seededProducts);
        localStorage.setItem('products_list', JSON.stringify(seededProducts));
        localStorage.setItem('products_seeded_v7', 'true');
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
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    const newProducts = products.filter(p => p.id !== deleteModal.id);
    localStorage.setItem('products_list', JSON.stringify(newProducts));
    setProducts(newProducts);
    setSelectedProductIds(prev => prev.filter(x => x !== deleteModal.id));
    window.dispatchEvent(new CustomEvent('ai-sync-data'));
  };

  const handleEditClick = (p: Product) => {
    window.dispatchEvent(new CustomEvent('open-product-form', { detail: { product: p } }));
  };

  const handleToggleActive = (id: string) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products_list', JSON.stringify(updatedProducts));
    window.dispatchEvent(new CustomEvent('ai-sync-data'));
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setBulkConfirmModal(true);
  };

  const doBulkDelete = () => {
    const newProducts = products.filter(p => !selectedProductIds.includes(p.id));
    localStorage.setItem('products_list', JSON.stringify(newProducts));
    setProducts(newProducts);
    setSelectedProductIds([]);
    window.dispatchEvent(new CustomEvent('ai-sync-data'));
  };

  const handleBulkToggleActive = (active: boolean) => {
    const updatedProducts = products.map(p =>
      selectedProductIds.includes(p.id) ? { ...p, is_active: active } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products_list', JSON.stringify(updatedProducts));
    setSelectedProductIds([]);
    window.dispatchEvent(new CustomEvent('ai-sync-data'));
  };

  const handleResetFilters = () => {
    setSelectedCategory('cat-1');
    setPriceOperator('all');
    setPriceValue('');
    setStockOperator('all');
    setStockValue('');
    setSelectedStatus('All');
    setSelectedSupplier('all');
    setFromProductId('All');
    setToProductId('All');
    setSortKey('name');
    setSortDir('asc');
    setSearch('');
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortPanel(false);
  };

  const productCodes = useMemo(() => {
    const codes = products.map(p => p.code).filter(Boolean);
    return Array.from(new Set(codes)).sort();
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchQuery =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory = p.category_id === selectedCategory;

      const matchStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && p.is_active) ||
        (selectedStatus === 'Inactive' && !p.is_active);

      let matchPrice = true;
      if (priceOperator !== 'all' && priceValue !== '') {
        const val = parseFloat(priceValue);
        const price = p.sale_price || 0;
        if (!isNaN(val)) {
          if (priceOperator === '=') matchPrice = price === val;
          else if (priceOperator === '!=') matchPrice = price !== val;
          else if (priceOperator === '<') matchPrice = price < val;
          else if (priceOperator === '>') matchPrice = price > val;
          else if (priceOperator === '<=') matchPrice = price <= val;
          else if (priceOperator === '>=') matchPrice = price >= val;
        }
      }

      let matchStock = true;
      if (stockOperator !== 'all' && stockValue !== '') {
        const val = parseFloat(stockValue);
        const qty = p.opening_qty || 0;
        if (!isNaN(val)) {
          if (stockOperator === '=') matchStock = qty === val;
          else if (stockOperator === '!=') matchStock = qty !== val;
          else if (stockOperator === '<') matchStock = qty < val;
          else if (stockOperator === '>') matchStock = qty > val;
          else if (stockOperator === '<=') matchStock = qty <= val;
          else if (stockOperator === '>=') matchStock = qty >= val;
        }
      }

      const matchSupplier = selectedSupplier === 'all' || p.preferred_supplier_id === selectedSupplier;

      let matchFromProduct = true;
      if (fromProductId && fromProductId !== 'All') {
        matchFromProduct = p.code >= fromProductId;
      }

      let matchToProduct = true;
      if (toProductId && toProductId !== 'All') {
        matchToProduct = p.code <= toProductId;
      }

      return matchQuery && matchCategory && matchStatus && matchPrice && matchStock && matchSupplier && matchFromProduct && matchToProduct;
    });

    result = [...result].sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'price') { av = a.sale_price; bv = b.sale_price; }
      else if (sortKey === 'qty') { av = a.opening_qty; bv = b.opening_qty; }
      else if (sortKey === 'status') { av = a.is_active ? 1 : 0; bv = b.is_active ? 1 : 0; }
      else if (sortKey === 'expiry_date') { av = a.expiry_date || ''; bv = b.expiry_date || ''; }
      else {
        av = a[sortKey as keyof Product] as string | number || '';
        bv = b[sortKey as keyof Product] as string | number || '';
      }

      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [products, search, selectedCategory, priceOperator, priceValue, stockOperator, stockValue, selectedStatus, selectedSupplier, fromProductId, toProductId, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  // KPI calculations
  const totalProducts = products.length;
  const totalSalesProducts = products.filter(p => p.sale_price > 0 && p.is_active).length;
  const availableProducts = products.filter(p => p.opening_qty > 0).length;
  const returnProducts = products.filter(p => !p.is_active).length;

  const stats = [
    { label: 'Total Products', value: totalProducts.toString(), sub: `${totalProducts} catalog items`, icon: FileText, color: brand.primary, bg: brand.surface },
    { label: 'Active Products', value: totalSalesProducts.toString(), sub: `${totalProducts > 0 ? ((totalSalesProducts / totalProducts) * 100).toFixed(0) : 0}% of catalog`, icon: CheckCircle, color: '#15803D', bg: '#F0FDF4' },
    { label: 'In Stock Items', value: availableProducts.toString(), sub: `${availableProducts} items active`, icon: Box, color: '#C2410C', bg: '#FFF7ED' },
    { label: 'Inactive / Return', value: returnProducts.toString(), sub: 'Requires review', icon: AlertCircle, color: '#BE123C', bg: '#FFF1F2' },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Product Name' },
    { key: 'code', label: 'Product Code' },
    { key: 'price', label: 'Price' },
    { key: 'qty', label: 'In Stocks' },
    { key: 'status', label: 'Status' },
    { key: 'expiry_date', label: 'Expiry Date' },
  ];

  const viewQrModalContent = (viewingQrProduct: Product | null, brand: any) => {
    if (!viewingQrProduct) return null;
    const qrText = `Product Code : ${viewingQrProduct.code}\nProduct Name : ${viewingQrProduct.name}\nExpiry Date : ${viewingQrProduct.expiry_date || '31-Dec-2027'}`;
    const { size, path } = getQRCodeSvgPath(qrText);

    const handleDownloadPng = () => {
      const svgElement = document.getElementById('qr-code-svg') as SVGGraphicsElement & HTMLElement;
      if (!svgElement) return;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 340;
        const context = canvas.getContext('2d');
        if (context) {
          // Fill white background
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, 300, 340);
          
          // Draw QR Code centered
          context.drawImage(image, 50, 20, 200, 200);
          
          // Set text alignment
          context.textAlign = 'center';
          
          // Product Code Label
          context.font = '10px sans-serif';
          context.fillStyle = '#94A3B8';
          context.fillText('Product Code', 150, 245);
          
          // Product Code Value
          context.font = 'bold 13px sans-serif';
          context.fillStyle = '#1E293B';
          context.fillText(viewingQrProduct.code, 150, 262);
          
          // Expiry Date Label
          context.font = '10px sans-serif';
          context.fillStyle = '#94A3B8';
          context.fillText('Expiry Date', 150, 290);
          
          // Expiry Date Value
          context.font = 'bold 13px sans-serif';
          context.fillStyle = '#1E293B';
          context.fillText(viewingQrProduct.expiry_date || '31-Dec-2027', 150, 307);
          
          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `QR_${viewingQrProduct.code}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    };

    const handlePrintLabel = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const svgElement = document.getElementById('qr-code-svg');
        const svgOuterHtml = svgElement ? svgElement.outerHTML : '';
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Label - ${viewingQrProduct.code}</title>
              <style>
                html, body {
                  height: 100%;
                  margin: 0;
                  padding: 0;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  background: white;
                }
                .label-card {
                  border: 1px dashed #94a3b8;
                  padding: 20px;
                  border-radius: 12px;
                  background: white;
                  display: inline-block;
                }
                .qr-container {
                  width: 150px;
                  height: 150px;
                  margin: 0 auto 10px auto;
                }
                .qr-container svg {
                  width: 100%;
                  height: 100%;
                }
                .info-text {
                  font-size: 12px;
                  font-weight: bold;
                  color: #1e293b;
                  margin: 4px 0;
                }
                .subtitle {
                  font-size: 10px;
                  color: #64748b;
                }
                @media print {
                  html, body {
                    height: 100vh;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                  }
                  .label-card {
                    border: none !important;
                    padding: 0 !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="label-card">
                <div class="qr-container">
                  ${svgOuterHtml}
                </div>
                <div class="info-text">Product Code: ${viewingQrProduct.code}</div>
                <div class="subtitle">Expiry Date: ${viewingQrProduct.expiry_date || '31-Dec-2027'}</div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    };

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-sm w-full border overflow-hidden flex flex-col"
          style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
        >
          {/* Modal Header */}
          <ModalHeader
            title="Generate QR Code"
            onClose={() => setViewingQrProduct(null)}
          />

          {/* Modal Body */}
          <div className="px-6 py-8 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-100 flex-grow">
            
            {/* QR Label Card */}
            <Card className="p-6 bg-white flex flex-col items-center w-64 shadow-sm border border-slate-200/60 rounded-2xl">
              
              {/* SVG QR Code */}
              <div className="w-40 h-40 bg-white flex items-center justify-center p-1 border border-slate-100 rounded-xl mb-4">
                <svg
                  id="qr-code-svg"
                  className="w-full h-full text-slate-900"
                  viewBox={`0 0 ${size} ${size}`}
                  shapeRendering="crispEdges"
                >
                  <path fill="#FFFFFF" d={`M0,0h${size}v${size}H0z`} />
                  <path fill="currentColor" d={path} />
                </svg>
              </div>

              {/* Metadata below QR */}
              <div className="text-center space-y-1.5 w-full">
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Product Code</div>
                  <div className="text-[12px] font-bold text-slate-800">{viewingQrProduct.code}</div>
                </div>
                
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Expiry Date</div>
                  <div className="text-[12px] font-bold text-slate-800">
                    {viewingQrProduct.expiry_date || '31-Dec-2027'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 bg-white flex-shrink-0">
            <Button
              variant="white"
              size="md"
              onClick={handleDownloadPng}
            >
              Download PNG
            </Button>
            <Button
              variant="white"
              size="md"
              onClick={handlePrintLabel}
            >
              Print Label
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setViewingQrProduct(null)}
              style={{ backgroundColor: brand.primary }}
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };








  return (
    <div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>

      {/* ── Page Header (InvoiceList Style) ── */}
      <PageHeader
        title="Product List"
        subtitle={`${filteredProducts.length} products found · Last updated just now`}
        actions={
          <>
            <Button
              variant="white"
              size="md"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              variant="white"
              size="md"
              icon={SlidersHorizontal}
              onClick={() => setShowFilterDrawer(true)}
              className="relative"
            >
              Filter
              {(selectedCategory !== 'cat-1' || fromProductId !== 'All' || toProductId !== 'All' || priceOperator !== 'all' || stockOperator !== 'all' || selectedStatus !== 'All' || selectedSupplier !== 'all' || search !== '') && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                  style={{ background: brand.accent || '#EF4444' }}>!</span>
              )}
            </Button>
            <Button
              onClick={onAddProductClick}
              variant="primary"
              size="md"
              icon={Plus}
              className="bg-emerald-500 hover:bg-emerald-600 shadow-none"
            >
              Add Product
            </Button>
          </>
        }
      />

      {/* ── Stats Cards (InvoiceList Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-hidden">
        {stats.map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card
              className="p-4 transition-all group cursor-default"
              style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-black tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>{stat.value}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: stat.bg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Table Card (InvoiceList Style) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>

        {/* ── Solid Header Bar (InvoiceList Style) ── */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}>
          <CardTitle title="Product Records" count={filteredProducts.length} countLabel="products" />

          {/* Search inside header bar */}
          <div className="flex items-center gap-2 print-hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search Products..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSortPanel(p => !p); }}
                className={`border ${showSortPanel ? 'bg-white/25 border-white/25' : 'bg-white/10 border-white/20'} text-white hover:bg-white/20`}
                icon={ArrowUpDown}
              >
                Sort
              </Button>
              <AnimatePresence>
                {showSortPanel && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-9 z-30 bg-white rounded-xl border overflow-hidden w-44"
                    style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    {sortOptions.map(opt => (
                      <button key={opt.key} onClick={() => handleSort(opt.key)}
                        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-all"
                        style={{ color: sortKey === opt.key ? brand.primary : brand.dark }}>
                        {opt.label}
                        {sortKey === opt.key && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-1 rounded transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-1 rounded transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>


        {/* Bulk Actions Floating Bar */}
        <AnimatePresence>
          {selectedProductIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-slate-900 text-white px-6 py-3 border-t border-slate-800 flex items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-400">
                <strong className="text-white text-sm mr-1">{selectedProductIds.length}</strong> products selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Inactive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table Mode / Scroll Area (InvoiceList Style) ── */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${selectedCategory}-${priceOperator}-${priceValue}-${stockOperator}-${stockValue}-${selectedStatus}-${sortKey}-${sortDir}-${currentPage}-${search}`}
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <AnimatePresence mode="wait">
              {viewMode === 'list' ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="w-full max-w-full" maxHeight="450px" style={{ overscrollBehavior: 'contain' }}>
                    <table className="w-full">
                      <thead className="sticky top-0 z-10 bg-white">
                        <tr className="border-b border-[#E2E8F0]">
                          <th className="px-4 py-2.5 text-center w-12 border-b border-[#E2E8F0]">
                            <input
                              type="checkbox"
                              checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                              onChange={handleSelectAll}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
                            />
                          </th>
                          {([
                            { label: 'Product Details', key: 'name', width: 'w-[31%]' },
                            { label: 'Category', key: 'category_id', width: 'w-[13%]' },
                            { label: 'In Stock', key: 'qty', width: 'w-[10%]' },
                            { label: 'Price (Rs.)', key: 'price', width: 'w-[12%]' },
                            { label: 'Expiry Date', key: 'expiry_date', width: 'w-[12%]' },
                            { label: 'Status', key: 'status', width: 'w-[10%]' },
                            { label: 'Last Updated', key: null, width: 'w-[12%]' },
                            { label: 'Actions', key: null, width: 'w-28' },
                          ] as { label: string; key: SortKey | null; width: string }[])
                          .filter(h => h.label === 'Actions' || docSettings.columns[h.label])
                          .map((h) => (
                            <TableHeader
                              key={h.label}
                              label={h.label}
                              sortKey={h.key || undefined}
                              activeSortKey={sortKey}
                              sortDir={sortDir}
                              onSort={(key) => handleSort(key)}
                              width={h.width}
                              borderLeft={false}
                            />
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product, i) => {
                          const isSelected = selectedProductIds.includes(product.id);

                          return (
                            <motion.tr key={product.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 30, delay: i * 0.03 }}
                              className={`group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0 ${isSelected ? 'bg-blue-50/15' : ''}`}
                            >
                              {/* Checkbox */}
                              <td className="px-4 py-3 text-center w-12">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(product.id)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
                                />
                              </td>

                              {/* Product Details (Name + UOM + Code) */}
                              {docSettings.columns['Product Details'] && (
                                <td className="px-4 py-3">
                                  <div className="min-w-0">
                                    <h4 className="text-[12px] font-normal truncate max-w-[200px]" style={{ color: brand.dark }}>{product.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[9px] font-medium font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                                        {product.code}
                                      </span>
                                      <span className="text-[10px] font-medium text-slate-400">
                                        · {getUOMName(product.uom_id)}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              )}

                              {/* Category */}
                              {docSettings.columns['Category'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-slate-600">
                                  {getCategoryName(product.category_id)}
                                </td>
                              )}

                              {/* Stocks */}
                              {docSettings.columns['In Stock'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-slate-600">
                                  {product.opening_qty}
                                </td>
                              )}

                              {/* Price */}
                              {docSettings.columns['Price (Rs.)'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-slate-600">
                                  {(product.sale_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              )}

                              {/* Expiry Date */}
                              {docSettings.columns['Expiry Date'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-slate-500">
                                  {formatExpiryDate(product.expiry_date)}
                                </td>
                              )}

                              {/* Status */}
                              {docSettings.columns['Status'] && (
                                <td className="px-4 py-3">
                                  {product.is_active
                                    ? <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(product.id)} />
                                    : <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(product.id)} />
                                  }
                                </td>
                              )}

                              {/* Last Updated */}
                              {docSettings.columns['Last Updated'] && (
                                <td className="px-4 py-3 text-[12px] font-normal text-slate-500">
                                  {product.created_at || '2026-05-30'}
                                </td>
                              )}

                              {/* Actions */}
                              <td className="px-1 py-3 w-28 whitespace-nowrap">
                                <div className="flex items-center gap-0">
                                  <Button onClick={() => setViewingProduct(product)}
                                    variant="ghost" size="xs" icon={Eye} title="View"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => handleEditClick(product)}
                                    variant="ghost" size="xs" icon={Edit2} title="Edit"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => setViewingQrProduct(product)}
                                    variant="ghost" size="xs" icon={QrCode} title="QR Code"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => handleDelete(product.id, product.name)}
                                    variant="ghost" size="xs" icon={Trash2} title="Delete"
                                    className="!px-1 !text-red-500" />
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}

                        {paginatedProducts.length === 0 && (
                          <tr>
                            <td colSpan={2 + Object.values(docSettings.columns).filter(Boolean).length} className="py-16 text-center">
                              <Box className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                              <p className="text-[13px] font-medium text-slate-400">No products found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </ScrollArea>
                </motion.div>
              ) : (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="w-full max-w-full p-4 bg-slate-50/50" maxHeight="450px" style={{ overscrollBehavior: 'contain' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                      {paginatedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="h-full flex flex-col hover:-translate-y-1 transition-all cursor-pointer group p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }} onClick={() => setViewingProduct(product)}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 tracking-wider">{product.code}</span>
                                {!product.is_active && <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-500 tracking-wider">Inactive</span>}
                              </div>

                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setViewingQrProduct(product)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
                                  title="QR Code"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditClick(product)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-1.5 rounded-lg text-red-500 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <h3 className="text-[12px] font-normal text-slate-800 mb-0.5 line-clamp-1">{product.name}</h3>
                            <p className="text-[10px] font-medium text-slate-400 mb-2">{getCategoryName(product.category_id)} • {getBrandName(product.brand_id)}</p>

                            <p className="text-[11px] text-slate-500 font-normal line-clamp-2 h-8 mb-4">{product.description || 'No description provided.'}</p>

                            <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Rs. {(product.sale_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Qty: {product.opening_qty} {getUOMName(product.uom_id)}</span>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Pagination (InvoiceList Style) */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between print-hidden"
            style={{ borderColor: '#E2E8F0', background: brand.surface + '60' }}>
            <p className="text-[11px] font-medium text-black">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredProducts.length)} of {filteredProducts.length}
            </p>
            <div className="flex items-center gap-1">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white" size="xs" icon={ChevronLeft}
                className="w-8 h-8 px-0" />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'} size="xs"
                  className="w-8 h-8 px-0 border-none"
                >
                  {p}
                </Button>
              ))}
              <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white" size="xs" icon={ChevronRight}
                className="w-8 h-8 px-0" />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── View Product Detail Modal ── */}
      <AnimatePresence>
        {viewingProduct && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border"
              style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
            >
              {/* Modal Header */}
              <ModalHeader
                title={`Product: ${viewingProduct.name}`}
                subtitle={viewingProduct.code}
                onClose={() => setViewingProduct(null)}
              />

              {/* Modal Body */}
              <div className="flex-grow overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
                {/* SECTION 1: Product Information */}
                <div className="space-y-1.5">
                  <SectionHeader title="Product Information" icon={Box} />
                  <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    <div className="grid grid-cols-2 gap-4">
                      {docSettings.fields['Category'] && (
                        <Input variant="compact" label="Category" readOnly value={getCategoryName(viewingProduct.category_id)} />
                      )}
                      {docSettings.fields['Brand'] && (
                        <Input variant="compact" label="Brand" readOnly value={getBrandName(viewingProduct.brand_id)} />
                      )}
                      {docSettings.fields['Model'] && (
                        <Input variant="compact" label="Model" readOnly value={ProductModel.find(m => m.id === viewingProduct.model_id)?.name || 'Generic'} />
                      )}
                      {docSettings.fields['Size'] && (
                        <Input variant="compact" label="Size" readOnly value={ProductSize.find(s => s.id === viewingProduct.size_id)?.name || 'Standard'} />
                      )}
                      {docSettings.fields['Unit Of Measure'] && (
                        <Input variant="compact" label="Unit Of Measure" readOnly value={getUOMName(viewingProduct.uom_id)} />
                      )}
                      {docSettings.fields['Weight (kg)'] && (
                        <Input variant="compact" label="Weight (kg)" readOnly value={viewingProduct.weight ? String(viewingProduct.weight) : 'N/A'} />
                      )}
                      {docSettings.fields['Description'] && (
                        <div className="col-span-2">
                          <Input variant="compact" label="Description" readOnly value={viewingProduct.description || 'N/A'} />
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* SECTION 2: Pricing & Inventory */}
                <div className="space-y-1.5">
                  <SectionHeader title="Pricing & Inventory" icon={CreditCard} />
                  <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    <div className="grid grid-cols-2 gap-4">
                      {docSettings.fields['Sale Price'] && (
                        <Input variant="compact" label="Sale Price (Rs.)" readOnly value={viewingProduct.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                      )}
                      {docSettings.fields['Cost Price'] && (
                        <Input variant="compact" label="Cost Price (Rs.)" readOnly value={viewingProduct.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                      )}
                      {docSettings.fields['Stocks (qty)'] && (
                        <Input variant="compact" label="Stocks (qty)" readOnly value={`${viewingProduct.opening_qty} units`} />
                      )}
                      {docSettings.fields['Low Stock Level'] && (
                        <Input variant="compact" label="Low Stock Level" readOnly value={`${viewingProduct.low_stock_level} units`} />
                      )}
                      <Input variant="compact" label="Status" readOnly value={viewingProduct.is_active ? 'Active' : 'Inactive'} />
                    </div>
                  </Card>
                </div>

                {/* SECTION 3: Tax Compliance & Codes */}
                <div className="space-y-1.5">
                  <SectionHeader title="Tax Compliance & Codes" icon={ShieldCheck} />
                  <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    <div className="grid grid-cols-3 gap-4">
                      {docSettings.fields['GST Rate'] && (
                        <Input variant="compact" label="GST Rate (%)" readOnly value={`${viewingProduct.gst_rate}%`} />
                      )}
                      {docSettings.fields['Non-Filer Rate'] && (
                        <Input variant="compact" label="Non-Filer Rate (%)" readOnly value={`${viewingProduct.non_filer_gst_rate}%`} />
                      )}
                      {docSettings.fields['HS Code'] && (
                        <Input variant="compact" label="HS Code" readOnly value={viewingProduct.hs_code || 'N/A'} />
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-slate-50 flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
                <Button
                  variant="white"
                  size="md"
                  onClick={() => {
                    setViewingProduct(null);
                    handleEditClick(viewingProduct);
                  }}
                >
                  Edit Product
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setViewingProduct(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── View Product QR Code Modal ── */}
      <AnimatePresence>
        {viewQrModalContent(viewingQrProduct, brand)}
      </AnimatePresence>

      {/* ── Filter Drawer (Side Panel) ── */}
      <ProductFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
        fromProductId={fromProductId}
        setFromProductId={(val) => { setFromProductId(val); setCurrentPage(1); }}
        toProductId={toProductId}
        setToProductId={(val) => { setToProductId(val); setCurrentPage(1); }}
        productCodes={productCodes}
        priceOperator={priceOperator}
        setPriceOperator={(op) => { setPriceOperator(op); setCurrentPage(1); }}
        priceValue={priceValue}
        setPriceValue={(val) => { setPriceValue(val); setCurrentPage(1); }}
        stockOperator={stockOperator}
        setStockOperator={(op) => { setStockOperator(op); setCurrentPage(1); }}
        stockValue={stockValue}
        setStockValue={(val) => { setStockValue(val); setCurrentPage(1); }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(status) => { setSelectedStatus(status); setCurrentPage(1); }}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={(sup) => { setSelectedSupplier(sup); setCurrentPage(1); }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Product?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and all product records will be permanently removed from catalog."
      />
      <ConfirmModal
        isOpen={bulkConfirmModal}
        onClose={() => setBulkConfirmModal(false)}
        onConfirm={doBulkDelete}
        title={`Delete ${selectedProductIds.length} Products?`}
        message={`Are you sure you want to permanently delete the ${selectedProductIds.length} selected product${selectedProductIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Yes, Delete All"
        variant="danger"
      />
    </div>
  );
};

export default ProductList;
