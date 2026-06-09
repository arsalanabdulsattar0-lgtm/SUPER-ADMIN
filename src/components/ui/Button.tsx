import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon: Icon,
  iconPosition = 'left',
  loading,
  fullWidth,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-black transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-[#E2E8F0] shadow-none";

  const variants = {
    primary: "bg-[#2759CD] text-white hover:opacity-90",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 border-transparent",
    outline: "bg-transparent text-slate-600 hover:bg-slate-50",
    white: "bg-white text-slate-600 hover:bg-slate-50",
  };

  const sizes = {
    xs: "h-6 px-2 text-[10px]",
    sm: "h-7 px-3 text-[11px]",
    md: "h-8 px-4 text-[12px]",
    lg: "h-10 px-6 text-[14px]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(props as any)}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-md animate-spin mr-2" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={`w-3.5 h-3.5 ${children ? 'mr-1.5' : ''}`} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={`w-3.5 h-3.5 ${children ? 'ml-1.5' : ''}`} />}
        </>
      )}
    </motion.button>
  );
};
