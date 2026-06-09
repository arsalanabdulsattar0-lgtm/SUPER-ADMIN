import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, className = '' }) => {
  const toggleClasses = `relative inline-flex flex-shrink-0 h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none toggle-switch-base ${checked ? 'toggle-switch-checked' : 'toggle-switch-unchecked'} ${className}`;
  const thumb = checked ? 'translate-x-5' : 'translate-x-0';
  return (
    <label className="inline-flex items-center space-x-3 cursor-pointer select-none">
      <button
        type="button"
        className={toggleClasses}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white border border-slate-200 shadow-none transform ring-0 transition duration-200 ease-in-out ${thumb}`}
        />
      </button>
      {label && <span className="text-xs font-bold text-slate-600">{label}</span>}
    </label>
  );
};
