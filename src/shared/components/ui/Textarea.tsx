import React, { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/classNames';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <textarea
        {...rest}
        id={textareaId}
        className={cn(
          'w-full rounded-lg border bg-slate-700 text-white placeholder-slate-500',
          'px-3 py-2 text-sm transition-colors duration-150 resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-600',
          className
        )}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
