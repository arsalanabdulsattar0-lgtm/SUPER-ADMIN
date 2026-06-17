import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hideErrorText?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  style,
  hideErrorText,
  ...props
}) => {
  return (
    <div 
      data-invalid={error ? "true" : undefined}
      className="space-y-1 w-full group"
    >
      {label && (
        <label className="text-[11px]  text-black ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full border rounded-xl py-2 px-5 
          text-[11px] font-normal text-[#304166] placeholder:text-slate-400 placeholder:text-[11px] placeholder:font-normal 
          outline-none transition-all resize-none custom-scrollbar
          form-textarea-container
          ${error ? 'border-red-500 focus:ring-red-500/5' : ''}
          ${className}
        `}
        style={style}
        {...props}
      />
      {error && !hideErrorText && <p className="text-[11px] font-normal text-red-500 ml-1">{error}</p>}
    </div>
  );
};
