/**
 * useDashboardStats.ts
 *
 * Derives key business metrics from the legacy CalculatorContext.
 */

import { useMemo } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import type { EstimateRecord } from '../../../../types';

export interface DashboardStats {
  totalEstimates: number;
  totalRevenue: number;
  pendingWorkOrders: number;
  draftCount: number;
  recentEstimates: EstimateRecord[];
  lowInventory: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { state } = useCalculator();
  const { appData } = state;
  const estimates = appData.savedEstimates;
  const warehouse = appData.warehouse;

  return useMemo<DashboardStats>(() => {
    const totalEstimates = estimates.length;

    const totalRevenue = estimates
      .filter((e) => e.status === 'Paid')
      .reduce((sum, e) => sum + (e.totalValue || 0), 0);

    const pendingWorkOrders = estimates.filter((e) => e.status === 'Work Order').length;

    const draftCount = estimates.filter((e) => e.status === 'Draft').length;

    // Sort by date descending, take 5
    const recentEstimates = [...estimates]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Low inventory: either open cell or closed cell sets < 2
    const lowInventory =
      (warehouse.openCellSets < 2) || (warehouse.closedCellSets < 2);

    return {
      totalEstimates,
      totalRevenue,
      pendingWorkOrders,
      draftCount,
      recentEstimates,
      lowInventory,
    };
  }, [estimates, warehouse]);
}
