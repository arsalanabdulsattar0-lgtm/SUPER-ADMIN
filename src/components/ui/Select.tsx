import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  variant?: 'default' | 'compact';
  hideErrorText?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  variant = 'default',
  className = '',
  style,
  hideErrorText,
  ...props
}) => {
  const isCompact = variant === 'compact';
  const isPlaceholder = !props.value;
  const valueColorClass = isPlaceholder ? 'text-slate-400' : 'text-[#304166]';

  const baseClasses = isCompact
    ? `w-full border rounded-lg h-7 pl-2.5 pr-8 text-[11px] font-normal ${valueColorClass} appearance-none cursor-pointer outline-none transition-all form-select-container bg-white`
    : `w-full border rounded-xl h-7 pl-4 pr-10 text-sm font-normal ${valueColorClass} appearance-none cursor-pointer outline-none transition-all form-select-container bg-white`;

  return (
    <div 
      data-invalid={error ? "true" : undefined}
      className={`w-full ${!isCompact ? 'space-y-1' : 'space-y-1'} group`}
    >
      {label && (
        <label className="text-[11px] text-black ml-1 flex items-center gap-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`${baseClasses} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          style={style}
          {...props}
        >
          {options.map((opt: SelectOption) => (
            <option key={opt.value} value={opt.value} className="text-[#304166] bg-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && !hideErrorText && <p className="text-[11px] font-normal text-red-500 ml-1">{error}</p>}
    </div>
  );
};
