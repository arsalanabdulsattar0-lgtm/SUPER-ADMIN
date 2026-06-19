import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Warehouse, SlidersHorizontal, Search, Box, AlertCircle, ChevronRight, Binary
} from 'lucide-react';
import { ProductBatchModal } from './ProductBatchModal';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader, TableHeader, CardTitle } from '../../components/ui/Typography';
import { Select, ScrollArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import Card from '../../components/ui/Card';
import { formatExpiryDate } from '../../utils/qrCode';
import type { Product } from './ProductList';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WarehouseStock {
  id: string;
  warehouse_id: string;
  warehouse_name: string;
  product_id: string;
  product_code: string;
  product_name: string;
  batch_no: string;
  quantity: number;
  details: string;
  expiry_date?: string;
  is_hold?: boolean;
}

const SEED_PRODUCTS = [
  { id: 'p-1', name: 'Flavopure', code: '0001', low_stock_level: 50 },
  { id: 'p-2', name: 'Fragrances', code: '0002', low_stock_level: 100 },
  { id: 'p-3', name: 'Powder', code: '0003', low_stock_level: 150 },
  { id: 'p-4', name: 'Liquid', code: '0004', low_stock_level: 80 }
];

function loadStock(productsList: Product[], warehousesList: any[]): WarehouseStock[] {
  try {
    const stored = localStorage.getItem('location_wise_stock');
    if (stored) {
      const parsed = JSON.parse(stored);
      // If we have records and they have expiry_date column, return to preserve user data
      if (parsed && parsed.length > 5 && parsed[0].hasOwnProperty('expiry_date')) {
        return parsed;
      }
    }
  } catch {}

  // Generate rich mock warehouse stock records for ALL products in the catalog
  const generated: WarehouseStock[] = [];
  const dummyBatches = ['BT-001', 'BT-002', 'BT-003', 'BT-004', 'BT-005'];
  const dummyDetails = ['Main Rack A1', 'Storage Shelf B2', 'Cold Room Sec C', 'Bulk Pallet D4', 'Mini Bin E5'];
  const dummyDates = ['30-Jun-2028', '31-Dec-2027', '31-Dec-2026', '15-Aug-2027', '31-Mar-2029'];

  const prodsToSeed = productsList.length > 0 ? productsList : SEED_PRODUCTS;
  const whsToSeed = warehousesList.length > 0 ? warehousesList : [
    { id: 'wh1', name: 'SHOP KEH', code: 'L001' },
    { id: 'wh2', name: 'MC', code: 'L002' },
    { id: 'wh3', name: 'NS', code: 'L004' }
  ];

  prodsToSeed.forEach((p, pIdx) => {
    whsToSeed.forEach((w, wIdx) => {
      // Create 1-2 batch entries per warehouse to make it realistic (except for 0001 which has no batch)
      const numBatches = p.code === '0001' ? 1 : ((pIdx + wIdx) % 2 === 0 ? 2 : 1);
      for (let b = 0; b < numBatches; b++) {
        const batchIndex = (pIdx + wIdx + b) % dummyBatches.length;
        const detailsIndex = (pIdx + wIdx + b) % dummyDetails.length;
        const dateIndex = (pIdx + wIdx + b) % dummyDates.length;
        const qty = p.code === '0001' ? 0 : (((pIdx + 1) * (wIdx + 1) * (b + 1) * 150) % 3500);
        const isHold = p.code === '0001' ? false : ((pIdx + wIdx + b) % 5 === 0);

        generated.push({
          id: `ls-${p.id}-${w.id || w.code}-${b}`,
          warehouse_id: w.code || w.id,
          warehouse_name: w.name,
          product_id: p.id,
          product_code: p.code,
          product_name: p.name,
          batch_no: p.code === '0001' ? '' : dummyBatches[batchIndex],
          quantity: qty,
          details: dummyDetails[detailsIndex],
          expiry_date: p.code === '0001' ? '' : dummyDates[dateIndex],
          is_hold: isHold
        });
      }
    });
  });

  localStorage.setItem('location_wise_stock', JSON.stringify(generated));
  return generated;
}

const WarehousesPage: React.FC = () => {
  const { brand } = useTheme();

  // Load products & stock
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<WarehouseStock[]>([]);
  
  // Selection/filter state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [withBatch, setWithBatch] = useState<boolean>(false);
  const [withZeroStock, setWithZeroStock] = useState<boolean>(true);
  const [activeRowId, setActiveRowId] = useState<string>('');
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Search and Drawer states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Temporary drawer states
  const [tempProductId, setTempProductId] = useState<string>('');
  const [tempBatch, setTempBatch] = useState<string>('');
  const [tempWithBatch, setTempWithBatch] = useState<boolean>(false);
  const [tempWithZeroStock, setTempWithZeroStock] = useState<boolean>(true);

  // Sorting state
  const [sortKey, setSortKey] = useState<string>('warehouse_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Load configured warehouses from localStorage (with seed fallback)
  const warehousesList = useMemo(() => {
    try {
      const stored = localStorage.getItem('warehouse_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          return parsed.map((w: any) => ({
            id: w.id,
            name: w.name,
            code: w.code || w.id
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load warehouses list from settings', e);
    }
    // Fallback matching seeded stock layout
    return [
      { id: 'wh1', name: 'SHOP KEH', code: 'L001' },
      { id: 'wh2', name: 'MC', code: 'L002' },
      { id: 'wh3', name: 'NS', code: 'L004' }
    ];
  }, []);

  // Initialize activeRowId to the first warehouse code/id
  useEffect(() => {
    if (warehousesList.length > 0) {
      setActiveRowId(warehousesList[0].code || warehousesList[0].id);
    }
  }, [warehousesList]);

  // Load and seed products & stocks
  const loadProductsAndStock = () => {
    try {
      const isSeededV11 = localStorage.getItem('warehouses_seeded_v11');
      let storedProducts = localStorage.getItem('products_list');
      let loadedProducts: any[] = storedProducts ? JSON.parse(storedProducts) : [];

      if (isSeededV11 !== 'true') {
        // Remove old dummy seed products (p-1, p-2, p-3, p-4) or products matching old names
        loadedProducts = loadedProducts.filter(
          p => !['p-1', 'p-2', 'p-3', 'p-4'].includes(p.id) && 
               !['Paracetamol 500mg', 'Amoxicillin 250mg', 'Panadol Extra'].includes(p.name)
        );

        // Prepends the new seed products
        const seedMapped = SEED_PRODUCTS.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          low_stock_level: p.low_stock_level,
          sale_price: 10,
          cost: 8,
          opening_qty: 0,
          weight: 0.1,
          gst_rate: 17,
          non_filer_gst_rate: 22,
          is_active: true
        }));
        loadedProducts = [...seedMapped, ...loadedProducts];
        localStorage.setItem('products_list', JSON.stringify(loadedProducts));
        
        // Force re-seeding of warehouse stocks
        localStorage.removeItem('location_wise_stock');
        localStorage.setItem('warehouses_seeded_v11', 'true');
      } else {
        // Double check to make sure Flavopure is present
        const hasFlavopure = loadedProducts.some(p => p.name === 'Flavopure');
        if (!hasFlavopure) {
          const seedMapped = SEED_PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code,
            low_stock_level: p.low_stock_level,
            sale_price: 10,
            cost: 8,
            opening_qty: 0,
            weight: 0.1,
            gst_rate: 17,
            non_filer_gst_rate: 22,
            is_active: true
          }));
          loadedProducts = [...seedMapped, ...loadedProducts];
          localStorage.setItem('products_list', JSON.stringify(loadedProducts));
          localStorage.removeItem('location_wise_stock');
          localStorage.setItem('warehouses_seeded_v11', 'true');
        }
      }

      setProducts(loadedProducts);

      // Load & dynamically seed warehouse stock records
      let loadedStock = loadStock(loadedProducts, warehousesList);
      
      // Ensure product code '0001' (Flavopure) stock is zero and has empty batch/expiry across all locations
      let hasUpdate = false;
      loadedStock = loadedStock.map(s => {
        if (s.product_code === '0001') {
          if (s.batch_no !== '' || s.expiry_date !== '' || s.quantity !== 0) {
            hasUpdate = true;
            return { ...s, batch_no: '', expiry_date: '', quantity: 0 };
          }
        }
        return s;
      });
      if (hasUpdate) {
        localStorage.setItem('location_wise_stock', JSON.stringify(loadedStock));
      }

      setStock(loadedStock);
    } catch (e) {
      console.error('Failed to load products and stock data', e);
    }
  };

  useEffect(() => {
    loadProductsAndStock();
  }, [warehousesList]);

  // Sync drawer temp states when drawer opens
  useEffect(() => {
    if (showFilterDrawer) {
      setTempProductId(selectedProductId);
      setTempBatch(selectedBatch);
      setTempWithBatch(withBatch);
      setTempWithZeroStock(withZeroStock);
    }
  }, [showFilterDrawer, selectedProductId, selectedBatch, withBatch, withZeroStock]);

  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Unique batches for temp selected product in drawer
  const tempProductBatches = useMemo(() => {
    let filtered = stock;
    if (tempProductId) {
      filtered = filtered.filter(s => s.product_id === tempProductId);
    }
    const batches = filtered
      .filter(s => s.batch_no)
      .map(s => s.batch_no);
    return Array.from(new Set(batches));
  }, [stock, tempProductId]);

  // Grid/List mapping based on filters
  const tableData = useMemo(() => {
    if (!selectedProductId) {
      return [];
    }
    let filtered = stock.filter(s => s.product_id === selectedProductId);
    if (selectedBatch) {
      filtered = filtered.filter(s => s.batch_no === selectedBatch);
    }

    let rows: { warehouse_id: string; warehouse_name: string; details: string; quantity: number; batch_no: string; expiry_date?: string; is_hold?: boolean }[] = [];

    if (withBatch) {
      // Group by Warehouse ID and Batch No
      warehousesList.forEach((loc: any) => {
        const matchingStocks = filtered.filter(
          s => s.warehouse_id === loc.code || 
               s.warehouse_id === loc.id || 
               s.warehouse_name?.toLowerCase() === loc.name?.toLowerCase()
        );
        if (matchingStocks.length > 0) {
          // Group by batch_no to sum quantities of same batches across products if multiple products are grouped
          const batchGroups: Record<string, typeof matchingStocks> = {};
          matchingStocks.forEach(s => {
            const bKey = s.batch_no || 'No Batch';
            if (!batchGroups[bKey]) batchGroups[bKey] = [];
            batchGroups[bKey].push(s);
          });

          Object.keys(batchGroups).forEach(bKey => {
            const group = batchGroups[bKey];
            const qty = group.reduce((sum, s) => sum + s.quantity, 0);
            const first = group[0];
            if (withZeroStock || qty > 0) {
              rows.push({
                warehouse_id: loc.code || loc.id,
                warehouse_name: loc.name,
                details: first.details || '',
                quantity: qty,
                batch_no: first.batch_no || '',
                expiry_date: first.expiry_date || '',
                is_hold: group.some(s => s.is_hold)
              });
            }
          });
        } else if (withZeroStock) {
          rows.push({
            warehouse_id: loc.code || loc.id,
            warehouse_name: loc.name,
            details: '',
            quantity: 0,
            batch_no: '',
            expiry_date: '',
            is_hold: false
          });
        }
      });
    } else {
      // Group by Warehouse ID (Sum Quantities)
      warehousesList.forEach((loc: any) => {
        const matchingStocks = filtered.filter(
          s => s.warehouse_id === loc.code || 
               s.warehouse_id === loc.id || 
               s.warehouse_name?.toLowerCase() === loc.name?.toLowerCase()
        );
        const totalQty = matchingStocks.reduce((sum, s) => sum + s.quantity, 0);
        
        if (withZeroStock || totalQty > 0) {
          const firstBatch = matchingStocks.length > 0 ? matchingStocks[0].batch_no : '';
          const firstDetails = matchingStocks.length > 0 ? matchingStocks[0].details : '';
          const firstExpiry = matchingStocks.length > 0 ? matchingStocks[0].expiry_date : '';
          const hasAnyHold = matchingStocks.some(s => s.is_hold);
          
          rows.push({
            warehouse_id: loc.code || loc.id,
            warehouse_name: loc.name,
            details: firstDetails,
            quantity: totalQty,
            batch_no: matchingStocks.length > 1 ? 'Multiple Batches' : firstBatch,
            expiry_date: firstExpiry,
            is_hold: hasAnyHold
          });
        }
      });
    }

    return rows;
  }, [stock, selectedProductId, selectedBatch, withBatch, withZeroStock, warehousesList]);

  // Text search filtering
  const searchedTableData = useMemo(() => {
    let list = [...tableData];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(row => 
        (row.warehouse_id || '').toLowerCase().includes(q) ||
        (row.warehouse_name || '').toLowerCase().includes(q) ||
        (row.details || '').toLowerCase().includes(q) ||
        (row.batch_no || '').toLowerCase().includes(q) ||
        (row.expiry_date || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [tableData, searchQuery]);

  // Sorting
  const sortedTableData = useMemo(() => {
    let list = [...searchedTableData];
    if (sortKey) {
      list.sort((a: any, b: any) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (typeof valA === 'boolean') {
          return sortDir === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valA ? -1 : 1);
        } else {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
      });
    }
    return list;
  }, [searchedTableData, sortKey, sortDir]);

  // Compute total stock of the selected product
  const totalStockForSelectedProduct = useMemo(() => {
    let filtered = stock;
    if (selectedProductId) {
      filtered = filtered.filter(s => s.product_id === selectedProductId);
    }
    if (selectedBatch) {
      filtered = filtered.filter(s => s.batch_no === selectedBatch);
    }
    return filtered.reduce((sum, s) => sum + s.quantity, 0);
  }, [stock, selectedProductId, selectedBatch]);

  // Re-order level (low stock level)
  const activeReOrderLevel = useMemo(() => {
    return activeProduct ? activeProduct.low_stock_level || 0 : 0;
  }, [activeProduct]);

  // Compute stats cards configuration
  const stats = useMemo(() => {
    return [
      {
        label: 'Total Stock',
        value: selectedProductId 
          ? totalStockForSelectedProduct.toLocaleString(undefined, { minimumFractionDigits: 2 })
          : '—',
        sub: activeProduct ? `${activeProduct.code} — ${activeProduct.name}` : 'Select a product to view stock',
        icon: Box,
        bg: 'rgba(59, 130, 246, 0.1)',
        color: brand.primary
      },
      {
        label: 'Re-Order Level',
        value: selectedProductId 
          ? activeReOrderLevel.toLocaleString(undefined, { minimumFractionDigits: 2 })
          : '—',
        sub: selectedProductId ? 'Configured minimum stock threshold' : 'Select a product to view threshold',
        icon: AlertCircle,
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#EF4444'
      }
    ];
  }, [totalStockForSelectedProduct, activeProduct, activeReOrderLevel, brand.primary, selectedProductId]);

  const handleToggleHold = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProductId) return;

    const newHoldStatus = !row.is_hold;

    const updatedStock = stock.map(s => {
      if (s.product_id === selectedProductId && s.warehouse_id === row.warehouse_id) {
        if (withBatch) {
          if (s.batch_no === row.batch_no) {
            return { ...s, is_hold: newHoldStatus };
          }
        } else {
          return { ...s, is_hold: newHoldStatus };
        }
      }
      return s;
    });

    setStock(updatedStock);
    localStorage.setItem('location_wise_stock', JSON.stringify(updatedStock));
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleApplyFilters = () => {
    setSelectedProductId(tempProductId);
    setSelectedBatch(tempBatch);
    setWithBatch(tempWithBatch);
    setWithZeroStock(tempWithZeroStock);
    setShowFilterDrawer(false);
  };

  const handleResetFilters = () => {
    setTempProductId('');
    setTempBatch('');
    setTempWithBatch(false);
    setTempWithZeroStock(true);
    
    setSelectedProductId('');
    setSelectedBatch('');
    setWithBatch(false);
    setWithZeroStock(true);
    setShowFilterDrawer(false);
  };

  return (
    <div className="min-h-full p-6 space-y-6" style={{ background: '#F4F7FD' }}>
      
      {/* Page Header Component */}
      <PageHeader
        title="Product Warehouse"
        subtitle="Warehouse wise stock logs and details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="white"
              size="md"
              icon={Binary}
              onClick={() => setShowBatchModal(true)}
              className="cursor-pointer"
            >
              Product Batch
            </Button>
            <Button
              variant="white"
              size="md"
              icon={SlidersHorizontal}
              onClick={() => setShowFilterDrawer(true)}
              className="relative cursor-pointer"
            >
              Filter
              {(selectedProductId !== '' || selectedBatch !== '' || withBatch || !withZeroStock) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                  style={{ background: brand.accent || '#EF4444' }}>!</span>
              )}
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-hidden w-full md:w-1/2">
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

      {/* Warehouse Stock Grid Table in standard layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        {/* Solid Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}>
          <CardTitle title="Product Warehousewise Stock" count={sortedTableData.length} countLabel="records" />

          {/* Search inside header bar */}
          <div className="flex items-center gap-2 print-hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
          </div>
        </div>

        <ScrollArea className="w-full max-w-full overflow-x-hidden" maxHeight="calc(100vh - 350px)" style={{ overscrollBehavior: 'contain', overflowX: 'hidden' }}>
          <table className="w-full table-layout-fixed">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                <th className="w-10 px-2 py-3 border-b border-[#E2E8F0]"></th>
                {([
                  { label: 'Warehouse ID', key: 'warehouse_id', width: 'w-[10%]' },
                  { label: 'Warehouse', key: 'warehouse_name', width: 'w-[15%]' },
                  { label: 'Details', key: 'details', width: 'w-[20%]' },
                  { label: 'In Stock', key: 'quantity', width: 'w-[12%]' },
                  { label: 'Batch No', key: 'batch_no', width: 'w-[15%]' },
                  { label: 'Expiry Date', key: 'expiry_date', width: 'w-[15%]' },
                  { label: 'IsHold', key: 'is_hold', width: 'w-[13%]' }
                ] as { label: string; key: string; width: string }[]).map((h) => (
                  <TableHeader
                    key={h.label}
                    sortKey={h.key}
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={(key) => handleSort(key)}
                    width={h.width}
                    borderLeft={false}
                    label={h.label}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTableData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 font-medium text-[12px]">
                    <Warehouse className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">
                      {selectedProductId ? "No warehouse stock records match the selected options." : "Please select a product from filters to view warehousewise stock levels."}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedTableData.map((row, idx) => {
                  const isRowSelected = activeRowId === row.warehouse_id;
                  return (
                    <motion.tr
                      key={`${row.warehouse_id}-${row.batch_no}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30, delay: idx * 0.03 }}
                      className={`group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0 ${
                        isRowSelected ? 'bg-blue-50/15' : ''
                      }`}
                      onClick={() => setActiveRowId(row.warehouse_id)}
                    >
                      {/* Active Row Arrow Indicator */}
                      <td className="px-2 py-3 text-center w-10">
                        {isRowSelected && (
                          <ChevronRight className="w-3.5 h-3.5 mx-auto text-slate-800 fill-slate-800" />
                        )}
                      </td>
                      {/* Warehouse ID */}
                      <td className="px-4 py-3 font-mono font-semibold text-[12px]">{row.warehouse_id}</td>
                      {/* Warehouse Name */}
                      <td className="px-4 py-3 font-semibold text-[12px] text-slate-800">{row.warehouse_name}</td>
                      {/* Details */}
                      <td className="px-4 py-3 text-slate-400 text-[12px]">{row.details || '—'}</td>
                      {/* In Stock */}
                      <td className="px-4 py-3 font-bold font-mono text-[12px] text-slate-800">
                        {row.quantity.toLocaleString()}
                      </td>
                      {/* Batch No */}
                      <td className="px-4 py-3 font-semibold text-slate-650 text-[12px]">{row.batch_no || '—'}</td>
                      {/* Expiry Date */}
                      <td className="px-4 py-3 font-semibold text-[12px] text-slate-800">
                        {row.expiry_date ? formatExpiryDate(row.expiry_date) : '—'}
                      </td>
                      {/* IsHold */}
                      <td className="px-4 py-3 text-[12px]">
                        {row.is_hold ? (
                          <span
                            onClick={(e) => handleToggleHold(row, e)}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 cursor-pointer select-none hover:bg-rose-100/50 transition-colors"
                          >
                            Hold
                          </span>
                        ) : (
                          <span
                            onClick={(e) => handleToggleHold(row, e)}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100 cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                          >
                            No
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ScrollArea>
      </motion.div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
      >
        <div className="space-y-4">
          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-755">Product</label>
            <Select
              value={tempProductId}
              onChange={e => {
                setTempProductId(e.target.value);
                setTempBatch('');
              }}
              options={[{ value: '', label: 'Select Product...' }, ...products.map(p => ({ value: p.id, label: `${p.code} — ${p.name}` }))] }
            />
          </div>

          {/* Batch Select */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-705">Batch No.</label>
            <Select
              value={tempBatch}
              onChange={e => setTempBatch(e.target.value)}
              options={[{ value: '', label: 'All Batches' }, ...tempProductBatches.map(b => ({ value: b, label: b }))] }
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tempWithBatch}
                onChange={e => setTempWithBatch(e.target.checked)}
                className="rounded border-slate-300 text-blue-650 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-750">With/Without Batch</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tempWithZeroStock}
                onChange={e => setTempWithZeroStock(e.target.checked)}
                className="rounded border-slate-300 text-green-650 focus:ring-green-550/20 cursor-pointer w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-750">With/Without Zero Stock</span>
            </label>
          </div>
        </div>
      </FilterDrawer>

      {/* Product Batch Modal */}
      <ProductBatchModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        products={products}
        onRefreshProducts={loadProductsAndStock}
        selectedProductId={selectedProductId}
      />

    </div>
  );
};

export default WarehousesPage;
