import React, { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';

interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, maxHeight = "auto", className = "", style }, ref) => (
    <div
      ref={ref}
      className={`overflow-y-auto custom-scrollbar ${className}`}
      style={{ maxHeight, ...style }}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  icon?: LucideIcon;
  error?: string;
  variant?: 'default' | 'compact' | 'transparent';
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, variant = 'default', suffix, className = '', ...props }) => {
  const isTransparent = variant === 'transparent';

  const baseClasses = isTransparent
    ? "w-full bg-transparent border-none text-[11px] font-bold outline-none placeholder:text-slate-200 focus:border-[#2759CD]"
    : variant === 'compact'
      ? "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-lg py-1 px-2 text-[11px] font-bold text-[#304166] placeholder:text-slate-300 focus:border-[#2759CD] outline-none transition-all"
      : "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl py-3 pr-4 text-sm font-bold text-[#304166] placeholder:text-slate-300 focus:border-[#2759CD] outline-none transition-all";

  const paddingLeft = !isTransparent && Icon ? 'pl-11' : (!isTransparent && variant === 'default' ? 'px-4' : '');

  return (
    <div className={`w-full ${!isTransparent ? 'space-y-1 group' : ''}`}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        )}
        <input
          className={`${baseClasses} ${paddingLeft} ${suffix ? 'pr-8' : ''} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
};

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: React.ReactNode;
  options: { value: string; label: string }[];
  error?: string;
  variant?: 'default' | 'compact';
}

export const Select: React.FC<SelectProps> = ({ label, options, error, variant = 'default', className = '', ...props }) => {
  const isCompact = variant === 'compact';

  const baseClasses = isCompact
    ? "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-lg py-1 px-3 text-[11px] font-bold text-[#304166] appearance-none cursor-pointer focus:border-[#2759CD] outline-none transition-all"
    : "w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl py-3 px-4 text-sm font-bold text-[#304166] appearance-none cursor-pointer focus:border-[#2759CD] outline-none transition-all";

  return (
    <div className={`w-full ${!isCompact ? 'space-y-1' : 'space-y-1'} group`}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`${baseClasses} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1 w-full group">
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-[#EFF5FC] border border-[#304166]/10 rounded-xl py-4 px-5 
          text-[13px] font-bold text-[#304166] placeholder:text-slate-300 
          focus:border-[#2759CD] outline-none transition-all resize-none
          ${error ? 'border-red-500 focus:ring-red-500/5' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

interface ComboBoxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string; subtitle?: string }[];
  placeholder?: string;
  variant?: 'default' | 'compact';
  icon?: LucideIcon;
  error?: string;
  className?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label, value, onChange, options, placeholder = "Search...", variant = 'default', icon: Icon = Search, error, className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isCompact = variant === 'compact';
  const selectedOption = options.find(opt => opt.id === value);

  // When closed, we show the selected option name. When open, we show the search query.
  const displayValue = isOpen ? query : (selectedOption?.name || "");

  const filtered = options.filter(opt =>
    opt.name.toLowerCase().includes(query.toLowerCase()) ||
    opt.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-1 relative" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1.5">
          {label}
        </label>
      )}

      <div
        className={`
          relative flex items-center transition-all border overflow-hidden
          ${isCompact ? 'rounded-lg h-[30px]' : 'rounded-xl h-10'}
          ${isOpen ? 'border-[#2759CD] ring-4 ring-[#2759CD]/5 bg-white' : 'border-[#304166]/10 bg-[#EFF5FC]'}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      >
        <div className="shrink-0 pl-3 flex items-center justify-center">
          <Icon className={`text-slate-300 ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </div>

        <input
          type="text"
          className={`
            flex-1 bg-transparent border-none outline-none font-bold text-[#304166] 
            placeholder:text-slate-300 pl-2.5 pr-9 ${isCompact ? 'text-[11px]' : 'text-sm'}
          `}
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 flex items-center">
          <ChevronDown
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute left-0 right-0 top-full mt-2 z-[100] bg-white border border-[#304166]/10 rounded-xl"
          >
            <ScrollArea maxHeight="185px" className="p-1.5">
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.id);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all
                      ${value === opt.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div>
                      <p className={`font-bold ${value === opt.id ? 'text-indigo-600' : 'text-[#304166]'} text-[12px]`}>
                        {opt.name}
                      </p>
                      {opt.subtitle && (
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{opt.subtitle}</p>
                      )}
                    </div>
                    {value === opt.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[11px] font-bold text-slate-400">No results found</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[11px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
};
