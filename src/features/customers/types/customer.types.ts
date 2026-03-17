/**
 * customer.types.ts
 *
 * Domain types for the Customers feature.
 */

export type { CustomerProfile } from '../../../../types';

export type CustomerStatus = 'Active' | 'Archived' | 'Lead';

export interface CustomerFilter {
  status: CustomerStatus | 'all';
  search: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  leads: number;
  archived: number;
}
