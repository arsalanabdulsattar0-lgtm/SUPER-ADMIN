import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  icon?: LucideIcon;
  error?: string;
  variant?: 'default' | 'compact' | 'transparent';
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  error,
  variant = 'default',
  suffix,
  size = 'sm',
  className = '',
  style,
  ...props
}) => {
  const isTransparent = variant === 'transparent';

  let baseClasses = "";
  if (isTransparent) {
    baseClasses = "w-full bg-transparent border-none text-[11px] font-normal outline-none placeholder:text-slate-200 placeholder:text-[11px] placeholder:font-normal";
  } else {
    const sizeClasses = {
      sm: variant === 'compact'
        ? "h-7 px-2 py-0 text-[11px] rounded-lg"
        : "h-7 px-4 py-0 text-sm rounded-xl",
      md: "h-9 px-4 py-1.5 text-sm rounded-xl",
      lg: "h-12 px-5 py-3 text-sm rounded-2xl",
    };
    const placeholderSize = variant === 'compact' ? 'placeholder:text-[11px]' : 'placeholder:text-sm';
    baseClasses = `w-full border font-normal text-[#304166] placeholder:text-slate-400 ${placeholderSize} placeholder:font-normal outline-none transition-all form-input-container ${sizeClasses[size]}`;
  }

  const paddingLeft = !isTransparent && Icon ? 'pl-11' : (!isTransparent ? (size === 'lg' ? 'px-5' : 'px-4') : '');

  return (
    <div className={`w-full form-input-container-group ${!isTransparent ? 'space-y-1 group' : ''}`}>
      {label && (
        <label className="text-[11px] text-black ml-1 flex items-center gap-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 form-input-icon"
          />
        )}
        <input
          className={`${baseClasses} ${paddingLeft} ${suffix ? 'pr-8' : ''} ${error ? 'border-red-500 focus:ring-red-500/5' : ''} ${className}`}
          style={style}
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
