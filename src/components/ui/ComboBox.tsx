import React, { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ScrollArea } from './ScrollArea';

export interface ComboBoxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string; subtitle?: string }[];
  placeholder?: string;
  variant?: 'default' | 'compact';
  icon?: LucideIcon;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  onQueryChange?: (query: string) => void;
  minQueryLength?: number;
  hideErrorText?: boolean;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Search...",
  variant = 'default',
  icon: Icon = Search,
  error,
  className = '',
  autoFocus,
  onQueryChange,
  minQueryLength,
  hideErrorText
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [openUpwards, setOpenUpwards] = useState(false);

  const isCompact = variant === 'compact';
  const selectedOption = options.find(opt => opt.id === value);

  // When closed, we show the selected option name. When open, we show the search query.
  const displayValue = isOpen ? query : (selectedOption?.name || "");

  const filtered = (minQueryLength && query.length < minQueryLength)
    ? []
    : options.filter(opt =>
        opt.name.toLowerCase().includes(query.toLowerCase()) ||
        opt.subtitle?.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 220; // estimated max height (200px ScrollArea + padding/border)
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setOpenUpwards(shouldOpenUpwards);
      setCoords({
        top: shouldOpenUpwards
          ? rect.top - dropdownHeight - 4
          : rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleUpdate = () => updateCoords();
      window.addEventListener('resize', handleUpdate);
      window.addEventListener('scroll', handleUpdate, true); // true catches nested scrollbar scroll events
      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedContainer = containerRef.current && containerRef.current.contains(e.target as Node);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target as Node);

      if (!clickedContainer && !clickedDropdown) {
        setIsOpen(false);
        setQuery("");
        if (onQueryChange) onQueryChange("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const advanceFocus = () => {
    setTimeout(() => {
      const tr = containerRef.current?.closest('tr');
      if (tr) {
        const inputs = Array.from(tr.querySelectorAll('input'));
        const myIndex = inputs.indexOf(inputRef.current!);
        if (myIndex !== -1) {
          for (let i = myIndex + 1; i < inputs.length; i++) {
            const input = inputs[i];
            if (!input.disabled && !input.readOnly) {
              input.focus();
              break;
            }
          }
        }
      }
    }, 50);
  };

  return (
    <div 
      className="w-full flex flex-col gap-1" 
      ref={containerRef}
      data-invalid={error ? "true" : undefined}
    >
      {label && (
        <label className="text-[11px] text-black ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}

      <div className="relative">
         <div
          className={`
            relative flex items-center transition-all border overflow-hidden cursor-pointer
            ${isCompact ? 'rounded-lg h-7' : 'rounded-xl h-7'}
            ${error ? 'border-red-500' : ''}
            ${isOpen ? 'combobox-container-open' : 'combobox-container-base'}
            ${className}
          `}
        >
          <div className="shrink-0 pl-3 flex items-center justify-center">
            <Icon className={`combobox-icon-base ${isOpen ? 'combobox-icon-open' : ''} ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            className={`
              flex-1 bg-transparent border-none outline-none font-normal text-[#304166] cursor-pointer
              placeholder:text-slate-400 placeholder:font-normal pl-2.5 pr-9 py-0 ${isCompact ? 'text-[11px]' : 'text-sm'}
            `}
            placeholder={placeholder}
            value={displayValue}
            autoFocus={autoFocus}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (onQueryChange) onQueryChange(val);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                if (isOpen && filtered.length > 0) {
                  e.preventDefault();
                  const opt = filtered[0];
                  onChange(opt.id);
                  setIsOpen(false);
                  setQuery("");
                  advanceFocus();
                }
              } else if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 flex items-center">
            <ChevronDown
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180 combobox-icon-open' : 'combobox-icon-base'} ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
            />
          </div>
        </div>

        {mounted && createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                layout={false}
                initial={{ opacity: 0, y: openUpwards ? -5 : 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: openUpwards ? -5 : 5, scale: 0.98 }}
                className="fixed z-[99999] bg-white border border-[#E2E8F0] rounded-xl overflow-hidden combobox-dropdown-container"
                style={{
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  boxShadow: 'none',
                }}
              >
                <ScrollArea maxHeight="200px" className="p-1.5">
                  {minQueryLength && query.length < minQueryLength ? (
                    <div className="py-8 text-center">
                      <p className="text-[11px] font-normal text-slate-400">
                        Type at least {minQueryLength} characters to search
                      </p>
                    </div>
                  ) : filtered.length > 0 ? (
                    filtered.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(opt.id);
                          setIsOpen(false);
                          setQuery("");
                          advanceFocus();
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${value === opt.id ? 'combobox-option-selected' : ''}`}
                      >
                        <div>
                          <p className={`font-normal text-[12px] ${value === opt.id ? 'combobox-option-text-selected' : 'text-[#304166]'}`}>
                            {opt.name}
                          </p>
                          {opt.subtitle && (
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{opt.subtitle}</p>
                          )}
                        </div>
                        {value === opt.id && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-[11px] font-normal text-slate-400">No results found</p>
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>

      {error && !hideErrorText && <p className="text-[11px] font-normal text-red-500 ml-1">{error}</p>}
    </div>
  );
};
