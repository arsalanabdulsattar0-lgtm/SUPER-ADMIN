import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SidebarNavButtonProps {
  /** Unique view-id for this item */
  id: string;
  label: string;
  icon: LucideIcon;
  /** Brand primary colour (hex / rgb) */
  primaryColor: string;
  /** Whether this button's view (or one of its children's views) is active */
  isActive: boolean;
  /** Whether the sidebar is in collapsed/icon-only mode */
  isCollapsed: boolean;
  /** Click handler — called with the view id */
  onClick: (id: string) => void;

  // ── Parent-only props ──────────────────────────────────────────────────────
  isParent?: boolean;
  subItems?: SubMenuItem[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** Determine which sub-item is active; receives subItem id, returns bool */
  isSubItemActive?: (subItemId: string) => boolean;
}

// ─── Reusable Pill Button ─────────────────────────────────────────────────────

const SidebarNavButton: React.FC<SidebarNavButtonProps> = ({
  id,
  label,
  icon: Icon,
  primaryColor,
  isActive,
  isCollapsed,
  onClick,
  isParent = false,
  subItems = [],
  isExpanded = false,
  onToggleExpand,
  isSubItemActive,
}) => {
  // ── Collapsed leaf / parent ────────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <button
        onClick={() => (isParent && onToggleExpand ? onToggleExpand() : onClick(id))}
        title={label}
        className="relative w-8 h-8 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer"
        style={{
          backgroundColor: isActive ? primaryColor : 'transparent',
        }}
      >
        <Icon
          className="w-[16px] h-[16px]"
          style={{ color: isActive ? '#fff' : '#000' }}
        />
      </button>
    );
  }

  // ── Expanded leaf ──────────────────────────────────────────────────────────
  if (!isParent) {
    return (
      <button
        onClick={() => onClick(id)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer"
        style={{
          backgroundColor: isActive ? primaryColor : 'transparent',
          color: isActive ? '#fff' : '#000',
        }}
      >
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-xl z-0"
            style={{ backgroundColor: primaryColor }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Icon className="w-4 h-4 relative z-10" style={{ color: isActive ? '#fff' : '#000' }} />
        <span className="relative z-10 truncate">{label}</span>
      </button>
    );
  }

  // ── Expanded parent ────────────────────────────────────────────────────────
  return (
    <div className="space-y-0.5">
      {/* Parent header — same solid-pill look as a regular active item */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all relative cursor-pointer"
        style={{
          backgroundColor: isActive ? primaryColor : 'transparent',
          color: isActive ? '#fff' : '#000',
        }}
      >
        {isActive && (
          <motion.div
            layoutId={`parent-pill-${id}`}
            className="absolute inset-0 rounded-xl z-0"
            style={{ backgroundColor: primaryColor }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Icon + Label */}
        <div className="flex items-center gap-2 relative z-10">
          <Icon
            className="w-4 h-4"
            style={{ color: isActive ? '#fff' : '#000' }}
          />
          <span className="truncate" style={{ color: isActive ? '#fff' : '#000' }}>
            {label}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200 relative z-10 shrink-0"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isActive ? '#ffffff99' : '#6b7280',
          }}
        />
      </button>

      {/* Sub-items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="sub-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pt-0.5">
              {subItems.map((sub) => {
                const subActive = isSubItemActive ? isSubItemActive(sub.id) : false;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onClick(sub.id)}
                    className="w-full flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all relative cursor-pointer text-left"
                    style={{
                      backgroundColor: subActive ? `${primaryColor}18` : 'transparent',
                      color: subActive ? primaryColor : '#4b5563',
                    }}
                  >
                    {subActive && (
                      <span
                        className="absolute left-[18px] w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarNavButton;
