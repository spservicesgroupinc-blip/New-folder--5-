import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useDashboardAlerts } from '../hooks/useDashboardAlerts';
import { cn } from '../../../shared/utils/classNames';

export function AlertsBanner() {
  const { alerts, hasAlerts } = useDashboardAlerts();

  if (!hasAlerts) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg border text-sm',
            alert.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300',
          )}
        >
          {alert.type === 'warning' ? (
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          ) : (
            <Info size={16} className="shrink-0 mt-0.5" />
          )}
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
