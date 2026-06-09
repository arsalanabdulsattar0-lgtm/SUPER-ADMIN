import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, ...rest }) => {
  const classes = className.split(/\s+/);
  const hasPadding = classes.some(cls => cls.startsWith('p-') || cls.startsWith('px-') || cls.startsWith('py-') || cls.startsWith('pt-') || cls.startsWith('pb-') || cls.startsWith('pl-') || cls.startsWith('pr-'));
  const hasRounded = classes.some(cls => cls.startsWith('rounded-'));
  const hasBorder = classes.some(cls => cls.startsWith('border-') || cls === 'border');
  const hasBg = classes.some(cls => cls.startsWith('bg-'));

  // Filter out any shadow classes to ensure all cards are flat and border-only
  const cleanedClassName = classes
    .filter(cls => !cls.includes('shadow') && !cls.includes('hover:shadow'))
    .join(' ');

  const baseClasses = [
    hasBg ? '' : 'bg-white',
    hasRounded ? '' : 'rounded-xl',
    hasBorder ? '' : 'border border-gray-200',
    hasPadding ? '' : 'p-3'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`${baseClasses} ${cleanedClassName}`}
      style={{ boxShadow: 'none', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
