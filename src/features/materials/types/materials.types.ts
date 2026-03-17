/**
 * materials.types.ts
 *
 * Domain types for the Materials / Purchase Orders feature.
 */

export type { PurchaseOrder, PurchaseOrderItem } from '../../../../types';

export type OrderStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

export interface Supplier {
  name: string;
  contactPhone?: string;
  contactEmail?: string;
}

export const DEFAULT_SUPPLIERS: Supplier[] = [
  { name: 'Lapolla Industries' },
  { name: 'Demilec' },
  { name: 'BASF' },
  { name: 'Huntsman' },
  { name: 'Other' },
];
