import React from 'react';

export interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, maxHeight = "auto", className = "", style }, ref) => {
    const hasScrollbarClass = className.includes('custom-scrollbar') || className.includes('standard-scrollbar') || className.includes('scrollbar-none');
    const scrollbarClass = hasScrollbarClass ? '' : 'custom-scrollbar';
    return (
      <div
        ref={ref}
        className={`${scrollbarClass} ${className}`}
        style={{
          maxHeight,
          overflowY: className.includes('overflow-y-visible') ? 'visible' : 'auto',
          ...style
        }}
      >
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';
