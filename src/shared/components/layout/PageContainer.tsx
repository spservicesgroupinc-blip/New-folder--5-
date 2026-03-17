import React, { ReactNode } from 'react';
import { cn } from '../../utils/classNames';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6',
        className
      )}
    >
      {children}
    </div>
  );
}
