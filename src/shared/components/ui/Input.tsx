import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/classNames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  id,
  className,
  ...rest
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 text-sm select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-slate-700 text-white placeholder-slate-500',
            'py-2 text-sm transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-600',
            prefix ? 'pl-8' : 'pl-3',
            suffix ? 'pr-16' : 'pr-3',
            className
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 text-sm select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
