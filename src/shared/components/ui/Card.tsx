import React, { ReactNode } from 'react';
import { cn } from '../../utils/classNames';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: Padding;
}

const paddingClasses: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-slate-800 rounded-xl border border-slate-700',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
