import React, { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/classNames';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({
  label,
  error,
  options,
  id,
  className,
  ...rest
}: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <select
        {...rest}
        id={selectId}
        className={cn(
          'w-full rounded-lg border bg-slate-700 text-white',
          'px-3 py-2 text-sm transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          'appearance-none cursor-pointer',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-600',
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
