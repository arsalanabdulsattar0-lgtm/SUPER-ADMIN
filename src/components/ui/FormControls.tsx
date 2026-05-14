import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="space-y-2 w-full group">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        )}
        <input
          className={`
            w-full bg-white border border-slate-200 rounded-xl py-3 
            ${Icon ? 'pl-11' : 'px-4'} pr-4 text-sm font-bold text-slate-900 
            placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 
            focus:border-indigo-500 transition-all outline-none shadow-sm
            ${error ? 'border-red-500 focus:ring-red-500/5' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-widest">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="space-y-2 w-full group">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full bg-white border border-slate-200 rounded-xl py-3 px-4 
            text-sm font-bold text-slate-900 appearance-none cursor-pointer
            focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 
            outline-none transition-all shadow-sm
            ${error ? 'border-red-500 focus:ring-red-500/5' : ''}
            ${className}
          `}
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
    <div className="space-y-2 w-full group">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-white border border-slate-200 rounded-xl py-4 px-5 
          text-[13px] font-bold text-slate-600 placeholder:text-slate-300 
          focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 
          outline-none transition-all shadow-sm resize-none
          ${error ? 'border-red-500 focus:ring-red-500/5' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};
