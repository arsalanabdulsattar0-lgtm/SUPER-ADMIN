import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, ScrollArea } from '../../components/ui/FormControls';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Pencil, X, ChevronRight, Binary } from 'lucide-react';
import type { Product } from './ProductList';

interface ProductBatch {
  id: string;
  product_id: string;
  product_name: string;
  batch_no: string;
  expiry_date: string;
  is_active: boolean;
}

interface ProductBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => void;
  selectedProductId?: string;
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

export const ProductBatchModal: React.FC<ProductBatchModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
  selectedProductId = ''
}) => {
  const { brand } = useTheme();

  // Master lists
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals visibility
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);

  // Form states
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({
    productId: '',
    batchNo: '',
    expiryDate: '',
    isActive: true
  });

  // Quick product add states
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');

  // Load batches from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('product_batches');
        if (stored) {
          setBatches(JSON.parse(stored));
        } else {
          localStorage.setItem('product_batches', JSON.stringify(DEFAULT_BATCHES));
          setBatches(DEFAULT_BATCHES);
        }
      } catch {
        setBatches(DEFAULT_BATCHES);
      }
    }
  }, [isOpen]);

  // Set default selection
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

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

  // Selected batch reference
  const activeBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId);
  }, [batches, selectedBatchId]);

  const handleToggleStatus = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = batches.map(b =>
      b.id === batchId ? { ...b, is_active: !b.is_active } : b
    );
    setBatches(updated);
    localStorage.setItem('product_batches', JSON.stringify(updated));
    onRefreshProducts();
  };

  const handleOpenAdd = () => {
    setFormMode('add');
    setFormData({
      productId: selectedProductId || products[0]?.id || '',
      batchNo: '',
      expiryDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = () => {
    if (!activeBatch) return;
    setFormMode('edit');
    setFormData({
      productId: activeBatch.product_id,
      batchNo: activeBatch.batch_no,
      expiryDate: activeBatch.expiry_date,
      isActive: activeBatch.is_active
    });
    setShowFormModal(true);
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
      setSelectedBatchId(newBatch.id);
    } else {
      updated = batches.map(b =>
        b.id === selectedBatchId
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
        // Find if this product_id and batch_no combination exists in stock.
        // If not, we can add a new dummy record for it across configured warehouses so that it immediately shows in the table
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
    onRefreshProducts();
  };

  const handleQuickAddProduct = () => {
    if (!newProductName.trim() || !newProductCode.trim()) return;

    try {
      const stored = localStorage.getItem('products_list');
      const currentList: any[] = stored ? JSON.parse(stored) : [];

      const exists = currentList.some(p => p.code === newProductCode.trim() || p.name.toLowerCase() === newProductName.trim().toLowerCase());
      if (exists) {
        alert('A product with this name or code already exists.');
        return;
      }

      const newProduct = {
        id: `p-${Date.now()}`,
        name: newProductName.trim(),
        code: newProductCode.trim(),
        low_stock_level: 50,
        sale_price: 10,
        cost: 8,
        opening_qty: 0,
        weight: 0.1,
        gst_rate: 17,
        non_filer_gst_rate: 22,
        is_active: true
      };

      const updatedList = [...currentList, newProduct];
      localStorage.setItem('products_list', JSON.stringify(updatedList));

      // Reload products list in parent
      onRefreshProducts();

      // Auto select in form
      setFormData(prev => ({ ...prev, productId: newProduct.id }));
      setShowAddProductModal(false);
      setNewProductName('');
      setNewProductCode('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Batch List"
      icon={Binary}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="white"
              size="sm"
              icon={Plus}
              onClick={handleOpenAdd}
              className="border font-bold text-xs"
            >
              Add
            </Button>
            <Button
              variant="white"
              size="sm"
              icon={Pencil}
              onClick={handleOpenEdit}
              disabled={!selectedBatchId}
              className="border font-bold text-xs"
            >
              Edit
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            style={{ backgroundColor: brand.primary }}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search batch number or product name..."
            className="w-full h-9 pl-3 pr-8 rounded-xl text-xs font-semibold border outline-none focus:ring-2 focus:ring-blue-500/20"
            style={{ borderColor: '#E2E8F0' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Batch list table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <ScrollArea className="w-full max-w-full overflow-x-hidden" maxHeight="280px">
            <table className="w-full table-layout-fixed">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="w-10 px-2 py-2.5 text-center border-b border-slate-150"></th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-[35%]">Product Name</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-[25%]">Batch No.</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-[20%]">Expiry Date</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-black text-slate-400 w-[20%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 font-medium text-[11px]">
                      No product batch records found.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((b) => {
                    const isSelected = selectedBatchId === b.id;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBatchId(b.id)}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/15' : ''
                        }`}
                      >
                        <td className="px-2 py-2 text-center w-10">
                          {isSelected && (
                            <ChevronRight className="w-3.5 h-3.5 mx-auto text-slate-800 fill-slate-800" />
                          )}
                        </td>
                        <td className="px-4 py-2 text-[12px] font-semibold text-slate-800 truncate">{b.product_name}</td>
                        <td className="px-4 py-2 text-[12px] font-semibold text-slate-800 font-mono">{b.batch_no}</td>
                        <td className="px-4 py-2 text-[12px] font-semibold text-slate-650 font-mono">
                          {formatDateForDisplay(b.expiry_date)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            onClick={(e) => handleToggleStatus(b.id, e)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer select-none transition-colors ${
                              b.is_active
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/50'
                                : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100/50'
                            }`}
                          >
                            {b.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      {/* INNER MODAL: Add/Edit Product Batch */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[1010] flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-[1px]">
            <div className="absolute inset-0" onClick={() => setShowFormModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[20px] w-full max-w-[340px] h-[260px] border border-slate-200 overflow-hidden relative shadow-xl font-sans flex flex-col"
            >
              {/* Inner Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
                <h3 className="text-xs font-bold text-slate-800">
                  {formMode === 'add' ? 'Add Product Batch' : 'Edit Product Batch'}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inner Modal Body */}
              <div className="px-5 py-4 space-y-3 flex-grow overflow-hidden">
                {/* Batch No */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">Batch No.</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g. 181024H"
                    className="w-full h-8.5 px-3.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#009bf2] focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-350"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full h-8.5 px-3.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#009bf2] focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Inner Modal Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="h-8 px-4 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatch}
                  disabled={!formData.productId || !formData.batchNo.trim()}
                  className="h-8 px-4 rounded-full bg-[#56CCF2] hover:bg-[#43b9de] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK ADD PRODUCT INNER DIALOG */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-[1020] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[0.5px]">
            <div className="absolute inset-0" onClick={() => setShowAddProductModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 overflow-hidden relative shadow-2xl font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Quick Add Product
                </h4>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <Input
                  label="Product Name"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  placeholder="e.g. Liquid Flavor"
                />
                <Input
                  label="Product Code"
                  value={newProductCode}
                  onChange={e => setNewProductCode(e.target.value)}
                  placeholder="e.g. 0005"
                />
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t bg-slate-50/50 flex justify-end gap-2">
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setShowAddProductModal(false)}
                  className="border font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleQuickAddProduct}
                  disabled={!newProductName.trim() || !newProductCode.trim()}
                  style={{ backgroundColor: brand.primary }}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
