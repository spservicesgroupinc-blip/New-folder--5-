import React, { ReactNode } from 'react';
import { cn } from '../../../shared/utils/classNames';

interface StatsTileProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  colorClass?: string;
}

export function StatsTile({ label, value, icon, trend, colorClass }: StatsTileProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-slate-800 border border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        {icon && (
          <span className={cn('text-slate-400', colorClass)}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={cn('text-2xl font-bold text-white', colorClass)}>
          {value}
        </span>
        {trend && (
          <span className="text-xs text-slate-500 pb-0.5">{trend}</span>
        )}
      </div>
    </div>
  );
}
