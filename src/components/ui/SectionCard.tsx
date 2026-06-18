import React from 'react';
import Card from './Card';

export interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  brand: {
    primary: string;
    [key: string]: any;
  };
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  brand,
  children,
  headerRight,
  footer,
  scrollable = false,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <Card className={`rounded-2xl overflow-hidden p-0 flex flex-col h-full border border-[#E2E8F0] shadow-sm ${className}`}>
      {/* Card header bar (FIXED) */}
      <div
        className="px-4 py-2.5 flex items-center justify-between text-white shrink-0"
        style={{ backgroundColor: brand.primary }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {icon && <span className="flex items-center text-white shrink-0">{icon}</span>}
          <h3 className="text-[11px] font-black tracking-wide">{title}</h3>
        </div>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>

      {/* Card Body */}
      <div
        className={`p-6 ${
          scrollable ? 'flex-1 overflow-y-auto custom-scrollbar' : ''
        } ${bodyClassName}`}
      >
        {children}
      </div>

      {/* Optional Card Footer */}
      {footer && <div className="shrink-0">{footer}</div>}
    </Card>
  );
};

export default SectionCard;
