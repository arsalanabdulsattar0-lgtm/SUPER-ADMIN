import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sun } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeType } from '../../../context/ThemeContext';

interface AppearanceModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
  activeTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const AppearanceModule: React.FC<AppearanceModuleProps> = ({
  brand,
  activeTheme,
  setTheme,
}) => {
  const lightThemes: { id: ThemeType; name: string; desc: string; colors: string[] }[] = [
    { id: 'sky', name: 'Sky Blue', desc: 'Crisp sky blue & refreshing aqua tones', colors: ['#0EA5E9', '#BAE6FD', '#F97316'] },
    { id: 'violet', name: 'Soft Violet', desc: 'Elegant violet & dreamy soft purple', colors: ['#7C3AED', '#DDD6FE', '#F59E0B'] },
    { id: 'mint', name: 'Mint Fresh', desc: 'Cool mint & soothing seafoam green', colors: ['#14B8A6', '#99F6E4', '#F43F5E'] },
    { id: 'peach', name: 'Peach Blossom', desc: 'Warm peach & soft blush tones', colors: ['#FB7185', '#FECDD3', '#38BDF8'] },
    { id: 'lavender', name: 'Lavender Dream', desc: 'Soft lavender & delicate lilac hues', colors: ['#A855F7', '#E9D5FF', '#34D399'] },
    { id: 'gold', name: 'Golden Hour', desc: 'Warm gold & rich amber warmth', colors: ['#D97706', '#FDE68A', '#0EA5E9'] },
    { id: 'teal', name: 'Teal Serenity', desc: 'Deep teal & calm ocean-inspired palette', colors: ['#0D9488', '#CCFBF1', '#F59E0B'] },
  ];

  const ThemeCard = ({ opt, isSelected }: { opt: typeof lightThemes[number]; isSelected: boolean }) => (
    <motion.button
      key={opt.id}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setTheme(opt.id)}
      className="text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
      style={{
        height: 120,
        backgroundColor: isSelected ? brand.surface : '#FAFAFA',
        borderColor: isSelected ? brand.primary : '#E2E8F0',
        borderWidth: isSelected ? 2 : 1,
        boxShadow: 'none',
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </motion.div>
      )}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: opt.colors[0] }} />
      <div className="relative z-10">
        <h4 className="text-xs font-bold text-slate-800">{opt.name}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5 pr-5 leading-relaxed line-clamp-2">{opt.desc}</p>
      </div>
      <div className="flex gap-1.5 items-center mt-2 relative z-10">
        {opt.colors.map((c, idx) => (
          <div
            key={idx}
            className="rounded-full border-2 border-white shadow-sm"
            style={{
              backgroundColor: c,
              width: idx === 0 ? 18 : 12,
              height: idx === 0 ? 18 : 12,
            }}
          />
        ))}
        <span className="text-[9px] font-semibold ml-1" style={{ color: opt.colors[0] }}>
          {isSelected ? '● Active' : ''}
        </span>
      </div>
    </motion.button>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-3.5 h-3.5" style={{ color: brand.primary }} />
          <h4 className="text-xs font-bold tracking-widest" style={{ color: brand.textSecondary }}>
            Color Themes
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {lightThemes.map(opt => (
            <ThemeCard key={opt.id} opt={opt} isSelected={activeTheme === opt.id} />
          ))}
        </div>
      </div>
      <motion.div
        key={activeTheme}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${brand.primary}18, ${brand.soft}40)`,
          border: `1px solid ${brand.primary}30`,
        }}
      >
        <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: brand.primary }} />
        <div>
          <p className="text-xs font-bold" style={{ color: brand.textPrimary }}>
            Active Theme Applied ✓
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: brand.textSecondary }}>
            Primary: <strong>{brand.primary}</strong> &nbsp;·&nbsp; Surface: <strong>{brand.surface}</strong>
          </p>
        </div>
        <div className="flex gap-1.5 ml-auto">
          {[brand.primary, brand.accent, brand.soft].map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
