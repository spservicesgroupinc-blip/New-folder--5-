/**
 * useDashboardAlerts.ts
 *
 * Generates actionable alerts for the dashboard based on app state.
 */

import { useMemo } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';

export interface DashboardAlert {
  type: 'warning' | 'info';
  message: string;
}

export interface DashboardAlertsResult {
  alerts: DashboardAlert[];
  hasAlerts: boolean;
}

export function useDashboardAlerts(): DashboardAlertsResult {
  const { state } = useCalculator();
  const { appData, ui } = state;
  const estimates = appData.savedEstimates;
  const warehouse = appData.warehouse;

  return useMemo<DashboardAlertsResult>(() => {
    const alerts: DashboardAlert[] = [];

    // Low foam stock
    const lowOpen = warehouse.openCellSets < 2;
    const lowClosed = warehouse.closedCellSets < 2;
    if (lowOpen && lowClosed) {
      alerts.push({
        type: 'warning',
        message: 'Low foam stock: open cell and closed cell sets are below 2. Consider placing a purchase order.',
      });
    } else if (lowOpen) {
      alerts.push({
        type: 'warning',
        message: `Low foam stock: only ${warehouse.openCellSets} open cell set(s) remaining.`,
      });
    } else if (lowClosed) {
      alerts.push({
        type: 'warning',
        message: `Low foam stock: only ${warehouse.closedCellSets} closed cell set(s) remaining.`,
      });
    }

    // Pending invoices
    const invoicedCount = estimates.filter((e) => e.status === 'Invoiced').length;
    if (invoicedCount > 0) {
      alerts.push({
        type: 'info',
        message: `${invoicedCount} invoice${invoicedCount > 1 ? 's' : ''} awaiting payment.`,
      });
    }

    // Sync error
    if (ui.syncStatus === 'error') {
      alerts.push({
        type: 'warning',
        message: 'Last sync failed. Check your connection and try again.',
      });
    }

    return { alerts, hasAlerts: alerts.length > 0 };
  }, [estimates, warehouse, ui.syncStatus]);
}
