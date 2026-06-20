import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Binary, Search, Plus, Pencil, Trash2, Check, AlertCircle, Box
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, ScrollArea, Toggle } from '../../components/ui/FormControls';
import { Modal } from '../../components/ui/Modal';
import { PageHeader, TableHeader, CardTitle } from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import type { Product } from './ProductList';

interface ProductBatch {
  id: string;
  product_id: string;
  product_name: string;
  batch_no: string;
  expiry_date: string;
  is_active: boolean;
}

const DEFAULT_BATCHES: ProductBatch[] = [
  { id: 'b-1', product_id: 'p-1', product_name: 'Flavopure', batch_no: '20250305', expiry_date: '2030-03-05', is_active: true },
  { id: 'b-2', product_id: 'p-1', product_name: 'Flavopure', batch_no: 'LL2511', expiry_date: '2029-12-24', is_active: true },
  { id: 'b-3', product_id: 'p-2', product_name: 'Fragrances', batch_no: '202412221', expiry_date: '2029-12-21', is_active: true },
  { id: 'b-4', product_id: 'p-2', product_name: 'Fragrances', batch_no: 'LK2511', expiry_date: '2029-11-24', is_active: true },
  { id: 'b-5', product_id: 'p-3', product_name: 'Powder', batch_no: 'LK2411', expiry_date: '2029-11-22', is_active: true },
  { id: 'b-6', product_id: 'p-3', product_name: 'Powder', batch_no: '22503020', expiry_date: '2029-03-15', is_active: true },
  { id: 'b-7', product_id: 'p-3', product_name: 'Powder', batch_no: '22503018', expiry_date: '2029-03-15', is_active: true },
  { id: 'b-8', product_id: 'p-3', product_name: 'Powder', batch_no: '22503019', expiry_date: '2029-03-15', is_active: true },
  { id: 'b-9', product_id: 'p-3', product_name: 'Powder', batch_no: '3250113120', expiry_date: '2029-02-20', is_active: true },
  { id: 'b-10', product_id: 'p-4', product_name: 'Liquid', batch_no: 'LB0311', expiry_date: '2029-02-02', is_active: true }
];

const formatDateForDisplay = (dateStr: string) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const ProductBatchPage: React.FC = () => {
  const { brand } = useTheme();

  // Load products catalog
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals visibility
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  // Form states
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingBatchId, setEditingBatchId] = useState<string>('');
  const [formData, setFormData] = useState({
    productId: '',
    batchNo: '',
    expiryDate: '',
    isActive: true
  });

  // Sorting state
  const [sortKey, setSortKey] = useState<string>('product_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Load batches and products from localStorage
  const loadData = () => {
    try {
      const storedProducts = localStorage.getItem('products_list');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }

      const storedBatches = localStorage.getItem('product_batches');
      if (storedBatches) {
        setBatches(JSON.parse(storedBatches));
      } else {
        localStorage.setItem('product_batches', JSON.stringify(DEFAULT_BATCHES));
        setBatches(DEFAULT_BATCHES);
      }
    } catch (e) {
      console.error(e);
      setBatches(DEFAULT_BATCHES);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter batches by search query
  const filteredBatches = useMemo(() => {
    let list = [...batches];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        b =>
          (b.batch_no || '').toLowerCase().includes(q) ||
          (b.product_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [batches, searchQuery]);

  // Sorting
  const sortedBatches = useMemo(() => {
    let list = [...filteredBatches];
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
  }, [filteredBatches, sortKey, sortDir]);

  // Stats Card Calculations
  const stats = useMemo(() => {
    const totalCount = batches.length;
    const activeCount = batches.filter(b => b.is_active).length;
    const inactiveCount = totalCount - activeCount;

    return [
      {
        label: 'Total Batches',
        value: totalCount.toString(),
        sub: 'Configured product batches in master',
        icon: Binary,
        bg: 'rgba(59, 130, 246, 0.1)',
        color: brand.primary
      },
      {
        label: 'Active Batches',
        value: activeCount.toString(),
        sub: `${totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : 0}% of total catalog`,
        icon: Box,
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#10B981'
      },
      {
        label: 'Inactive Batches',
        value: inactiveCount.toString(),
        sub: 'Inactive batches hidden from selectors',
        icon: AlertCircle,
        bg: 'rgba(245, 158, 11, 0.1)',
        color: '#F59E0B'
      }
    ];
  }, [batches, brand.primary]);

  const handleOpenAdd = () => {
    setFormMode('add');
    setFormData({
      productId: products[0]?.id || '',
      batchNo: '',
      expiryDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (b: ProductBatch) => {
    setFormMode('edit');
    setEditingBatchId(b.id);
    setFormData({
      productId: b.product_id,
      batchNo: b.batch_no,
      expiryDate: b.expiry_date,
      isActive: b.is_active
    });
    setShowFormModal(true);
  };

  const handleToggleStatus = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = batches.map(b =>
      b.id === batchId ? { ...b, is_active: !b.is_active } : b
    );
    setBatches(updated);
    localStorage.setItem('product_batches', JSON.stringify(updated));
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    const updated = batches.filter(b => b.id !== deleteModal.id);
    setBatches(updated);
    localStorage.setItem('product_batches', JSON.stringify(updated));
    setDeleteModal({ isOpen: false, id: '', name: '' });
  };

  const handleSaveBatch = () => {
    if (!formData.productId || !formData.batchNo.trim()) return;

    const matchedProduct = products.find(p => p.id === formData.productId);
    const productName = matchedProduct ? matchedProduct.name : 'Unknown Product';

    let updated: ProductBatch[];
    if (formMode === 'add') {
      const newBatch: ProductBatch = {
        id: `batch-${Date.now()}`,
        product_id: formData.productId,
        product_name: productName,
        batch_no: formData.batchNo.trim(),
        expiry_date: formData.expiryDate,
        is_active: formData.isActive
      };
      updated = [...batches, newBatch];
    } else {
      updated = batches.map(b =>
        b.id === editingBatchId
          ? {
              ...b,
              product_id: formData.productId,
              product_name: productName,
              batch_no: formData.batchNo.trim(),
              expiry_date: formData.expiryDate,
              is_active: formData.isActive
            }
          : b
      );
    }

    setBatches(updated);
    localStorage.setItem('product_batches', JSON.stringify(updated));
    setShowFormModal(false);

    // Sync to warehouses list stock batches if needed
    try {
      const storedStock = localStorage.getItem('location_wise_stock');
      if (storedStock) {
        let stockRecords = JSON.parse(storedStock);
        const warehouses = [
          { id: 'wh1', name: 'SHOP KEH', code: 'L001' },
          { id: 'wh2', name: 'MC', code: 'L002' },
          { id: 'wh3', name: 'NS', code: 'L004' }
        ];

        let hasUpdates = false;
        warehouses.forEach(w => {
          const exists = stockRecords.some(
            (s: any) => s.product_id === formData.productId && s.batch_no === formData.batchNo.trim() && s.warehouse_id === w.code
          );
          if (!exists) {
            stockRecords.push({
              id: `ls-${formData.productId}-${w.code}-${Date.now()}`,
              warehouse_id: w.code,
              warehouse_name: w.name,
              product_id: formData.productId,
              product_code: matchedProduct?.code || '0000',
              product_name: productName,
              batch_no: formData.batchNo.trim(),
              quantity: 0,
              details: 'Created from Batch Master',
              expiry_date: formatDateForDisplay(formData.expiryDate),
              is_hold: false
            });
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          localStorage.setItem('location_wise_stock', JSON.stringify(stockRecords));
        }
      }
    } catch (err) {
      console.error('Error syncing stocks', err);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="min-h-full p-6 space-y-6" style={{ background: '#F4F7FD' }}>
      {/* Page Header Component */}
      <PageHeader
        title="Product Batch List"
        subtitle="Manage product batches, manufacturing numbers, and expiry logs"
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
            style={{ backgroundColor: brand.primary }}
          >
            Add Batch
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-hidden w-full">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card
              className="p-4 transition-all group cursor-default"
              style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-black tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: stat.bg }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        {/* Blue Header Bar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <CardTitle title="All Batches" count={sortedBatches.length} countLabel="records" />

          {/* Search inside header */}
          <div className="flex items-center gap-2 print-hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <ScrollArea className="w-full max-w-full overflow-x-hidden" maxHeight="calc(100vh - 350px)">
          <table className="w-full table-layout-fixed">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                {([
                  { label: 'Product Name', key: 'product_name', width: 'w-[40%]' },
                  { label: 'Batch No.', key: 'batch_no', width: 'w-[20%]' },
                  { label: 'Expiry Date', key: 'expiry_date', width: 'w-[20%]' },
                  { label: 'Status', key: 'is_active', width: 'w-[10%]' },
                  { label: 'Actions', key: '', width: 'w-[10%]' }
                ] as { label: string; key: string; width: string }[]).map(h => (
                  <TableHeader
                    key={h.label}
                    sortKey={h.key}
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={key => handleSort(key)}
                    width={h.width}
                    borderLeft={false}
                    label={h.label}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400 font-medium text-[12px]">
                    <Binary className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No product batches found.</p>
                  </td>
                </tr>
              ) : (
                sortedBatches.map((b, idx) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30, delay: idx * 0.03 }}
                    className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                  >
                    <td className="px-4 py-3 font-semibold text-[12px] text-slate-800 truncate">
                      {b.product_name}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[12px] text-slate-800 font-mono">
                      {b.batch_no || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[12px] text-slate-800 font-mono">
                      {formatDateForDisplay(b.expiry_date)}
                    </td>
                    <td className="px-4 py-3 text-[12px]">
                      <span
                        onClick={e => handleToggleStatus(b.id, e)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer select-none transition-colors ${
                          b.is_active
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/50'
                            : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100/50'
                        }`}
                      >
                        {b.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Pencil}
                          title="Edit"
                          className="!px-1.5"
                          onClick={() => handleOpenEdit(b)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          title="Delete"
                          className="!px-1.5 !text-red-500 hover:!bg-red-50"
                          onClick={() => handleDelete(b.id, b.batch_no)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </motion.div>

      {/* Modal: Add/Edit Product Batch */}
      <AnimatePresence>
        {showFormModal && (
          <Modal
            isOpen={showFormModal}
            onClose={() => setShowFormModal(false)}
            title={formMode === 'add' ? 'Add Product Batch' : 'Edit Product Batch'}
            size="sm"
            footer={
              <>
                <Button variant="white" size="md" onClick={() => setShowFormModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  onClick={handleSaveBatch}
                  disabled={!formData.productId || !formData.batchNo.trim()}
                  style={{ backgroundColor: brand.primary }}
                >
                  {formMode === 'add' ? 'Save Batch' : 'Update Batch'}
                </Button>
              </>
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Batch No. *</label>
                <Input
                  variant="compact"
                  value={formData.batchNo}
                  onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
                  placeholder="e.g. 181024H"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Expiry Date</label>
                <Input
                  variant="compact"
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex items-center pt-2">
                <Toggle
                  checked={formData.isActive}
                  onChange={v => setFormData({ ...formData, isActive: v })}
                  label="Is Active"
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
        title="Delete Product Batch"
        itemName={deleteModal.name}
      />
    </div>
  );
};
