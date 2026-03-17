import React from 'react';
import { cn } from '../../utils/classNames';
import { Spinner } from '../ui/Spinner';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  message = 'Loading…',
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen
          ? 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50'
          : 'py-16 px-6',
        className
      )}
    >
      <Spinner size="lg" className="text-brand" />
      {message && (
        <p className="text-sm text-slate-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}
