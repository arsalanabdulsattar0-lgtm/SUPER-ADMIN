import React from 'react';
import { FilterDrawer } from './FilterDrawer';
import { Input, Select, ComboBox } from './FormControls';
import { useTheme } from '../../context/ThemeContext';
import { ProductCategory, ProductSupplier } from '../../utils/productData';

interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  priceOperator: string;
  setPriceOperator: (val: string) => void;
  priceValue: string;
  setPriceValue: (val: string) => void;
  stockOperator: string;
  setStockOperator: (val: string) => void;
  stockValue: string;
  setStockValue: (val: string) => void;
  selectedStatus: 'All' | 'Active' | 'Inactive';
  setSelectedStatus: (val: 'All' | 'Active' | 'Inactive') => void;
  selectedSupplier: string;
  setSelectedSupplier: (val: string) => void;
}

export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  selectedCategory,
  setSelectedCategory,
  priceOperator,
  setPriceOperator,
  priceValue,
  setPriceValue,
  stockOperator,
  setStockOperator,
  stockValue,
  setStockValue,
  selectedStatus,
  setSelectedStatus,
  selectedSupplier,
  setSelectedSupplier,
}) => {
  const { brand } = useTheme();

  // Local temporary states
  const [localCategory, setLocalCategory] = React.useState(selectedCategory);
  const [localPriceOperator, setLocalPriceOperator] = React.useState(priceOperator);
  const [localPriceValue, setLocalPriceValue] = React.useState(priceValue);
  const [localStockOperator, setLocalStockOperator] = React.useState(stockOperator);
  const [localStockValue, setLocalStockValue] = React.useState(stockValue);
  const [localStatus, setLocalStatus] = React.useState(selectedStatus);
  const [localSupplier, setLocalSupplier] = React.useState(selectedSupplier);

  // Sync local state when the drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategory(selectedCategory);
      setLocalPriceOperator(priceOperator);
      setLocalPriceValue(priceValue);
      setLocalStockOperator(stockOperator);
      setLocalStockValue(stockValue);
      setLocalStatus(selectedStatus);
      setLocalSupplier(selectedSupplier);
    }
  }, [isOpen, selectedCategory, priceOperator, priceValue, stockOperator, stockValue, selectedStatus, selectedSupplier]);

  const handleApply = () => {
    setSelectedCategory(localCategory);
    setPriceOperator(localPriceOperator);
    setPriceValue(localPriceValue);
    setStockOperator(localStockOperator);
    setStockValue(localStockValue);
    setSelectedStatus(localStatus);
    setSelectedSupplier(localSupplier);
    onClose();
  };

  const handleResetClick = () => {
    setLocalCategory('all');
    setLocalPriceOperator('all');
    setLocalPriceValue('');
    setLocalStockOperator('all');
    setLocalStockValue('');
    setLocalStatus('All');
    setLocalSupplier('all');
    onReset();
    onClose();
  };

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      onReset={handleResetClick}
      onApply={handleApply}
    >
      {/* Category Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-black">Filter by Category</label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setLocalCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer outline-none ${
              localCategory === 'all'
                ? 'text-white font-medium'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            style={{
              backgroundColor: localCategory === 'all' ? brand.primary : undefined,
              borderColor: localCategory === 'all' ? brand.primary : undefined,
            }}
          >
            All
          </button>
          {ProductCategory.map((cat: { id: string; name: string }) => (
            <button
              key={cat.id}
              onClick={() => setLocalCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer outline-none ${
                localCategory === cat.id
                  ? 'text-white font-medium'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              style={{
                backgroundColor: localCategory === cat.id ? brand.primary : undefined,
                borderColor: localCategory === cat.id ? brand.primary : undefined,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Filter by Price</label>
        <div className="flex gap-2">
          <Select
            variant="compact"
            value={localPriceOperator}
            onChange={(e) => setLocalPriceOperator(e.target.value)}
            options={[
              { value: 'all', label: 'Any' },
              { value: '=',   label: '= Equal' },
              { value: '!=',  label: '≠ Not equal' },
              { value: '<',   label: '< Less than' },
              { value: '>',   label: '> Greater than' },
              { value: '<=',  label: '≤ Less or equal' },
              { value: '>=',  label: '≥ Greater or equal' },
            ]}
          />
          <Input
            variant="compact"
            type="number"
            value={localPriceValue}
            onChange={(e) => setLocalPriceValue(e.target.value)}
            placeholder="0.00"
            disabled={localPriceOperator === 'all'}
          />
        </div>
      </div>

      {/* Inventory Level Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Filter by Inventory Level</label>
        <div className="flex gap-2">
          <Select
            variant="compact"
            value={localStockOperator}
            onChange={(e) => setLocalStockOperator(e.target.value)}
            options={[
              { value: 'all', label: 'Any' },
              { value: '=',   label: '= Equal' },
              { value: '!=',  label: '≠ Not equal' },
              { value: '<',   label: '< Less than' },
              { value: '>',   label: '> Greater than' },
              { value: '<=',  label: '≤ Less or equal' },
              { value: '>=',  label: '≥ Greater or equal' },
            ]}
          />
          <Input
            variant="compact"
            type="number"
            value={localStockValue}
            onChange={(e) => setLocalStockValue(e.target.value)}
            placeholder="0"
            disabled={localStockOperator === 'all'}
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Filter by Status</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
          {[
            { key: 'All', label: 'All' },
            { key: 'Active', label: 'Active' },
            { key: 'Inactive', label: 'Inactive' },
          ].map((opt) => {
            const isActive = localStatus === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setLocalStatus(opt.key as any)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none ${
                  isActive
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'
                }`}
                style={{ color: isActive ? brand.primary : undefined }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Supplier Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Preferred Supplier</label>
        <ComboBox
          value={localSupplier}
          onChange={(val) => setLocalSupplier(val)}
          options={[
            { id: 'all', name: 'All Suppliers' },
            ...ProductSupplier,
          ]}
          placeholder="Select Supplier"
          variant="compact"
        />
      </div>
    </FilterDrawer>
  );
};
