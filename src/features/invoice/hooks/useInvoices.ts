import { useMemo } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import { EstimateRecord } from '../../../../types';

interface UseInvoicesResult {
  invoicedJobs: EstimateRecord[];
  paidJobs: EstimateRecord[];
  workOrders: EstimateRecord[];
  pendingCount: number;
}

export function useInvoices(): UseInvoicesResult {
  const { state } = useCalculator();
  const { savedEstimates } = state.appData;

  const invoicedJobs = useMemo(
    () => savedEstimates.filter((e) => e.status === 'Invoiced'),
    [savedEstimates],
  );

  const paidJobs = useMemo(
    () => savedEstimates.filter((e) => e.status === 'Paid'),
    [savedEstimates],
  );

  const workOrders = useMemo(
    () => savedEstimates.filter((e) => e.status === 'Work Order'),
    [savedEstimates],
  );

  const pendingCount = useMemo(
    () => invoicedJobs.length + workOrders.length,
    [invoicedJobs.length, workOrders.length],
  );

  return { invoicedJobs, paidJobs, workOrders, pendingCount };
}
