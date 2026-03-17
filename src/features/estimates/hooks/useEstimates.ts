/**
 * useEstimates.ts
 *
 * Read-only hook for the estimates list with filtering and summary stats.
 */

import { useMemo } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import type { EstimateFilter, EstimateSummary } from '../types/estimates.types';
import type { EstimateRecord } from '../../../../types';

export function useEstimates(filter?: EstimateFilter) {
  const { state } = useCalculator();
  const { appData } = state;
  const all = appData.savedEstimates;

  const { estimates, filteredCount } = useMemo(() => {
    let result = [...all];

    if (filter?.status && filter.status !== 'all') {
      result = result.filter((e) => e.status === filter.status);
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.customer.name.toLowerCase().includes(term) ||
          (e.invoiceNumber?.toLowerCase().includes(term) ?? false) ||
          (e.customer.address?.toLowerCase().includes(term) ?? false),
      );
    }

    if (filter?.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      result = result.filter((e) => new Date(e.date).getTime() >= from);
    }

    if (filter?.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      result = result.filter((e) => new Date(e.date).getTime() <= to);
    }

    return { estimates: result, filteredCount: result.length };
  }, [all, filter?.status, filter?.search, filter?.dateFrom, filter?.dateTo]);

  const summary = useMemo<EstimateSummary>(() => {
    return {
      total: all.length,
      drafts: all.filter((e) => e.status === 'Draft').length,
      workOrders: all.filter((e) => e.status === 'Work Order').length,
      invoiced: all.filter((e) => e.status === 'Invoiced').length,
      paid: all.filter((e) => e.status === 'Paid').length,
    };
  }, [all]);

  return {
    estimates: estimates as EstimateRecord[],
    summary,
    totalCount: all.length,
    filteredCount,
  };
}
