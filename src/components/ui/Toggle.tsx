import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, className = '', compact = false }) => {
  const sizeClasses = compact ? 'h-4 w-7' : 'h-6 w-11';
  const thumbSize = compact ? 'h-3 w-3' : 'h-5 w-5';
  const thumbTranslate = checked ? (compact ? 'translate-x-3' : 'translate-x-5') : 'translate-x-0';
  const spacingClass = compact ? 'space-x-2' : 'space-x-3';

  const toggleClasses = `relative inline-flex flex-shrink-0 ${sizeClasses} cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none toggle-switch-base ${checked ? 'toggle-switch-checked' : 'toggle-switch-unchecked'} ${className}`;

  return (
    <label className={`inline-flex items-center ${spacingClass} cursor-pointer select-none`}>
      <button
        type="button"
        className={toggleClasses}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`pointer-events-none block ${thumbSize} rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ease-in-out ${thumbTranslate}`}
        />
      </button>
      {label && <span className="text-[11px] font-bold text-[#304166]">{label}</span>}
    </label>
  );
};
