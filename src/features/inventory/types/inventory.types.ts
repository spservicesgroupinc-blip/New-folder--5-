/**
 * inventory.types.ts
 *
 * Domain types for the Inventory feature.
 */

export type { WarehouseItem } from '../../../../types';

export type StockLevel = 'ok' | 'low' | 'critical' | 'out';

export function getStockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return 'out';
  if (quantity < 2) return 'critical';
  if (quantity < 5) return 'low';
  return 'ok';
}

export interface InventoryAlert {
  itemName: string;
  level: StockLevel;
  quantity: number;
}
