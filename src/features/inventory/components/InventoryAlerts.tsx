/**
 * InventoryAlerts.tsx
 *
 * Displays alert banners for low, critical, or out-of-stock inventory items.
 */

import React from 'react';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { useInventoryAlerts } from '../hooks/useInventoryAlerts';
import type { StockLevel } from '../types/inventory.types';

const LEVEL_CONFIG: Record<
  Exclude<StockLevel, 'ok'>,
  { icon: React.ElementType; classes: string; label: string }
> = {
  low: {
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    label: 'Low Stock',
  },
  critical: {
    icon: AlertCircle,
    classes: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    label: 'Critical',
  },
  out: {
    icon: XCircle,
    classes: 'bg-red-500/10 border-red-500/30 text-red-400',
    label: 'Out of Stock',
  },
};

export function InventoryAlerts() {
  const { alerts, hasAlerts } = useInventoryAlerts();

  if (!hasAlerts) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert, idx) => {
        const config = LEVEL_CONFIG[alert.level as Exclude<StockLevel, 'ok'>];
        const Icon = config.icon;
        return (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${config.classes}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="font-medium">{config.label}:</span>
            <span>
              {alert.itemName} — {alert.quantity} remaining
            </span>
          </div>
        );
      })}
    </div>
  );
}
