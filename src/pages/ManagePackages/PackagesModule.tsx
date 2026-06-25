import React, { useState } from 'react';
import { usePermissions } from '../../context/PermissionContext';
import { Plus, CheckCircle2, Shield, Zap, Crown, Edit2, Package as PackageIcon, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { Input, Select, Toggle } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import type { Package } from '../../context/PermissionContext';

export const PackagesModule: React.FC = () => {
  const { packages, setPackages } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Partial<Package>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPkgId, setDeletingPkgId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingPkg({
      id: `pkg-${Date.now()}`,
      name: 'New Package',
      priceMonthly: 0,
      priceYearly: 0,
      tierColor: 'gray',
      isPopular: false,
      allowedModules: [],
      allowedFunctions: [],
      features: [
        { label: 'Max Products:', value: '100', active: true },
        { label: 'Try-On:', value: 'Not Included', active: false },
        { label: 'Scans:', value: '0 / mo', active: false },
        { label: 'Size Recommendations:', value: '0 / mo', active: false },
        { label: 'Shade Recommendations:', value: 'Not Included', active: false },
        { label: 'Featured Badge Access', active: false },
        { label: 'Priority 24/7 Support', active: false },
      ]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (packages.find(p => p.id === editingPkg.id)) {
      setPackages(prev => prev.map(p => p.id === editingPkg.id ? { ...p, ...editingPkg } as Package : p));
    } else {
      setPackages(prev => [...prev, editingPkg as Package]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deletingPkgId) {
      setPackages(prev => prev.filter(p => p.id !== deletingPkgId));
      setIsDeleteModalOpen(false);
      setDeletingPkgId(null);
    }
  };

  const getTierIcon = (color?: string) => {
    if (color === 'blue') return <Zap className="w-4 h-4" />;
    if (color === 'orange') return <Crown className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getTierColors = (color?: string) => {
    if (color === 'blue') return {
      border: 'border-[#3b82f6]',
      bg: 'bg-white',
      title: 'text-[#3b82f6]',
      buttonText: 'text-[#3b82f6]',
      buttonBorder: 'border-[#3b82f6]',
      buttonHover: 'hover:bg-blue-50',
      priceYearly: 'text-[#3b82f6]',
      checkActive: 'text-[#3b82f6]',
    };
    if (color === 'orange') return {
      border: 'border-[#f59e0b]',
      bg: 'bg-white', 
      title: 'text-[#f59e0b]',
      buttonText: 'text-[#f59e0b]',
      buttonBorder: 'border-[#f59e0b]',
      buttonHover: 'hover:bg-orange-50',
      priceYearly: 'text-[#f59e0b]',
      checkActive: 'text-[#f59e0b]',
    };
    return {
      border: 'border-slate-300',
      bg: 'bg-white',
      title: 'text-slate-500',
      buttonText: 'text-slate-600',
      buttonBorder: 'border-slate-300',
      buttonHover: 'hover:bg-slate-50',
      priceYearly: 'text-slate-600',
      checkActive: 'text-slate-500',
    };
  };

  const getFeatures = (id: string) => {
    if (id === 'pkg-basic') return [
      { label: 'Max Products:', value: '50', active: true },
      { label: 'Try-On:', value: 'Not Included', active: false },
      { label: 'Scans:', value: '20 / mo', active: true },
      { label: 'Size Recommendations:', value: '20 / mo', active: true },
      { label: 'Shade Recommendations:', value: 'Not Included', active: false },
      { label: 'Featured Badge Access', active: false },
      { label: 'Priority 24/7 Support', active: false },
    ];
    if (id === 'pkg-standard') return [
      { label: 'Max Products:', value: '200', active: true },
      { label: 'Try-On:', value: '50 / mo', active: true },
      { label: 'Scans:', value: '100 / mo', active: true },
      { label: 'Size Recommendations:', value: '100 / mo', active: true },
      { label: 'Shade Recommendations:', value: '100 / mo', active: true },
      { label: 'Featured Badge Access', active: true },
      { label: 'Priority 24/7 Support', active: false },
    ];
    return [
      { label: 'Max Products:', value: 'Unlimited', active: true },
      { label: 'Try-On:', value: 'Unlimited', active: true },
      { label: 'Scans:', value: 'Unlimited', active: true },
      { label: 'Size Recommendations:', value: 'Unlimited', active: true },
      { label: 'Shade Recommendations:', value: 'Unlimited', active: true },
      { label: 'Featured Badge Access', active: true },
      { label: 'Priority 24/7 Support', active: true },
    ];
  };

  return (
    <div className="w-full mx-auto max-w-7xl animate-fade-in p-2 md:p-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">Packages & Permissions</h2>
          <p className="text-slate-500 text-sm mt-1">Define subscription plans and feature access tiers</p>
        </div>
        <button onClick={handleCreate} className="bg-[#3b82f6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create New Package
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {packages.map(pkg => {
          const colors = getTierColors(pkg.tierColor);
          const features = pkg.features || getFeatures(pkg.id);

          return (
            <div 
              key={pkg.id} 
              className={`relative rounded-3xl border-[1.5px] ${colors.border} ${colors.bg} p-8 flex flex-col transition-all hover:shadow-lg`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 right-6 bg-[#22d3ee] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                  <Zap className="w-3 h-3 fill-white" />
                  MOST POPULAR
                </div>
              )}

              {/* Tier Name */}
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-6 ${colors.title}`}>
                {getTierIcon(pkg.tierColor)}
                {pkg.name}
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1.5 text-slate-800">
                  <span className="text-sm font-semibold text-slate-500">PKR</span>
                  <span className="text-[40px] font-bold tracking-tight text-[#1e293b] leading-none">
                    {pkg.priceMonthly?.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-500">/ MO</span>
                </div>
                <div className={`text-[13px] font-bold mt-2 ${colors.priceYearly}`}>
                  PKR {pkg.priceYearly?.toLocaleString()} /year
                </div>
              </div>

              {/* Features List */}
              <div className="flex-grow space-y-3.5 mb-10">
                {features.map((f, i) => (
                  <div key={i} className={`flex items-center gap-3 text-[13px] ${f.active ? 'text-slate-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${f.active ? colors.checkActive : 'text-slate-200'}`} />
                    <div className="flex gap-1.5">
                      {f.label} 
                      {f.value && (
                        <span className={f.active && f.value !== 'Not Included' ? 'font-bold text-slate-700' : ''}>
                          {f.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 w-full mb-6" />

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className={`flex items-center gap-2 px-5 py-2 rounded-xl border-[1.5px] font-bold text-[13px] transition-colors ${colors.buttonBorder} ${colors.buttonText} ${colors.buttonHover}`}>
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Plan
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingPkgId(pkg.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl border-[1.5px] transition-colors border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={packages.find(p => p.id === editingPkg.id) ? "Edit Package" : "Create Package"}
        icon={PackageIcon}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Package</Button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Package Name"
              value={editingPkg.name || ''}
              onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
            />
            <Select
              label="Tier Color"
              value={editingPkg.tierColor || 'gray'}
              onChange={(e) => setEditingPkg({ ...editingPkg, tierColor: e.target.value as any })}
              options={[
                { value: 'gray', label: 'Gray (Basic)' },
                { value: 'blue', label: 'Blue (Pro)' },
                { value: 'orange', label: 'Orange (Enterprise)' },
              ]}
            />
            <Input
              label="Price (Monthly)"
              type="number"
              value={editingPkg.priceMonthly || 0}
              onChange={(e) => setEditingPkg({ ...editingPkg, priceMonthly: Number(e.target.value) })}
            />
            <Input
              label="Price (Yearly)"
              type="number"
              value={editingPkg.priceYearly || 0}
              onChange={(e) => setEditingPkg({ ...editingPkg, priceYearly: Number(e.target.value) })}
            />
          </div>
          <div className="mt-4">
            <Toggle
              checked={editingPkg.isPopular || false}
              onChange={(val) => setEditingPkg({ ...editingPkg, isPopular: val })}
              label="Mark as Most Popular"
            />
          </div>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Package"
        itemName={packages.find(p => p.id === deletingPkgId)?.name || 'this package'}
        warningText="This action cannot be undone. All companies using this package will lose access to its features."
      />
    </div>
  );
};
