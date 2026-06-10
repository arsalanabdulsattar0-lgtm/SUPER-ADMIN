import React from 'react';
import { FilterDrawer } from './FilterDrawer';
import { useTheme } from '../../context/ThemeContext';
import { ProductCategory } from '../../utils/productData';

interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  // Keep remaining props in interface for call-site compatibility
  priceOperator?: string;
  setPriceOperator?: (val: string) => void;
  priceValue?: string;
  setPriceValue?: (val: string) => void;
  stockOperator?: string;
  setStockOperator?: (val: string) => void;
  stockValue?: string;
  setStockValue?: (val: string) => void;
  selectedStatus?: 'All' | 'Active' | 'Inactive';
  setSelectedStatus?: (val: 'All' | 'Active' | 'Inactive') => void;
  selectedSupplier?: string;
  setSelectedSupplier?: (val: string) => void;
}

export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { brand } = useTheme();

  // Local temporary state for category
  const [localCategory, setLocalCategory] = React.useState(selectedCategory);

  // Sync local state when the drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategory(selectedCategory || 'cat-1');
    }
  }, [isOpen, selectedCategory]);

  const handleApply = () => {
    setSelectedCategory(localCategory);
    onClose();
  };

  const handleResetClick = () => {
    setLocalCategory('cat-1');
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
          {ProductCategory.map((cat: { id: string; name: string }) => {
            const isSelected = localCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setLocalCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer outline-none ${
                  isSelected
                    ? 'text-white font-medium'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isSelected ? brand.primary : undefined,
                  borderColor: isSelected ? brand.primary : undefined,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </FilterDrawer>
  );
};
