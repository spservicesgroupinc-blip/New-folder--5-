/**
 * StockLevelIndicator.tsx
 *
 * Visual indicator showing stock level as a colored pill.
 */

import React from 'react';
import { getStockLevel } from '../types/inventory.types';
import type { StockLevel } from '../types/inventory.types';

interface StockLevelIndicatorProps {
  quantity: number;
  label?: string;
}

const LEVEL_CLASSES: Record<StockLevel, string> = {
  ok: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  low: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  critical: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  out: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const LEVEL_LABELS: Record<StockLevel, string> = {
  ok: 'In Stock',
  low: 'Low',
  critical: 'Critical',
  out: 'Out',
};

export function StockLevelIndicator({ quantity, label }: StockLevelIndicatorProps) {
  const level = getStockLevel(quantity);
  const classes = LEVEL_CLASSES[level];
  const levelLabel = LEVEL_LABELS[level];

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${classes}`}
      >
        {levelLabel}
      </span>
      <span className="text-sm font-mono text-white">{quantity}</span>
    </div>
  );
}
