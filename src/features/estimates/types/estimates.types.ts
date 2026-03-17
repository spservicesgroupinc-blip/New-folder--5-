import type { EstimateRecord } from '../../../../types';

export type EstimateStatus = 'Draft' | 'Work Order' | 'Invoiced' | 'Paid' | 'Archived';
export type ExecutionStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface EstimateFilter {
  status: EstimateStatus | 'all';
  search: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EstimateSummary {
  total: number;
  drafts: number;
  workOrders: number;
  invoiced: number;
  paid: number;
}

// Re-export EstimateRecord so consumers can import from this module
export type { EstimateRecord };
