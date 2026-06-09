import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { LucideIcon } from 'lucide-react';

// ─── 1. Page Header Component ────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  const { brand } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

// ─── 2. Form & Modal Section Header ──────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, className = "" }) => {
  const { brand } = useTheme();
  return (
    <h4
      className={`text-[13px] font-black ml-1 flex items-center gap-2 ${className}`}
      style={{ color: brand.dark }}
    >
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: brand.primary }} />}
      {title}
    </h4>
  );
};

// ─── 3. Standard Table Column Header ──────────────────────────────────────────
interface TableHeaderProps {
  label: string;
  sortKey?: string;
  activeSortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: any) => void;
  width?: string;
  padding?: string;
  borderLeft?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  label,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
  width = "",
  padding = "",
  borderLeft = false
}) => {
  const { brand } = useTheme();
  const isSortable = !!sortKey && !!onSort;
  const isSorted = isSortable && activeSortKey === sortKey;
  const defaultPadding = label === 'Actions' ? 'px-2' : 'px-3';
  const finalPadding = padding || defaultPadding;

  return (
    <th
      className={`${finalPadding} py-2.5 text-left border-b ${
        isSortable ? 'cursor-pointer hover:bg-blue-50/40 select-none' : ''
      } transition-colors ${borderLeft ? 'border-l border-slate-100' : ''} ${width}`}
      style={{ borderColor: '#E2E8F0' }}
      onClick={() => isSortable && onSort(sortKey)}
    >
      <span
        className="text-[10px] font-black tracking-widest inline-flex items-center gap-0.5 whitespace-nowrap"
        style={{ color: isSorted ? brand.primary : '#000000' }}
      >
        {label}
        {isSortable && (
          <span
            className="ml-1 inline-block opacity-50"
            style={{ color: isSorted ? brand.primary : brand.dark }}
          >
            {isSorted ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        )}
      </span>
    </th>
  );
};

// ─── 4. Card Title Component ─────────────────────────────────────────────────
interface CardTitleProps {
  title: string;
  count?: number | string;
  countLabel?: string;
  className?: string;
  textColor?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  title,
  count,
  countLabel = "items",
  className = "",
  textColor = "text-white"
}) => {
  const { brand } = useTheme();
  return (
    <div className={`flex items-center gap-2 ${className} ${textColor}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      <h3 className="text-[11px] font-black tracking-wide">{title}</h3>
      {count !== undefined && (
        <span
          className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: brand.soft, color: brand.dark }}
        >
          {count} {countLabel}
        </span>
      )}
    </div>
  );
};

// ─── 5. Preview Modal Header Component ───────────────────────────────────────
interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  badges,
  onClose
}) => {
  const { brand } = useTheme();
  return (
    <div
      className="flex items-center justify-between px-6 py-4 bg-white border-b flex-shrink-0"
      style={{ borderColor: '#E2E8F0' }}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5" style={{ color: brand.dark }}>
          {title}
          {subtitle && (
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 capitalize">
              {subtitle}
            </span>
          )}
          {badges}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
