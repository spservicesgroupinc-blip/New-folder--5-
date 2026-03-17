/**
 * useInventoryAlerts.ts
 *
 * Derives low/critical/out alerts from warehouse set counts and items.
 */

import { useMemo } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import { getStockLevel } from '../types/inventory.types';
import type { InventoryAlert } from '../types/inventory.types';

export function useInventoryAlerts(): { alerts: InventoryAlert[]; hasAlerts: boolean } {
  const { state } = useCalculator();
  const { warehouse } = state.appData;

  const alerts = useMemo<InventoryAlert[]>(() => {
    const result: InventoryAlert[] = [];

    const openLevel = getStockLevel(warehouse.openCellSets);
    if (openLevel !== 'ok') {
      result.push({
        itemName: 'Open Cell Sets',
        level: openLevel,
        quantity: warehouse.openCellSets,
      });
    }

    const closedLevel = getStockLevel(warehouse.closedCellSets);
    if (closedLevel !== 'ok') {
      result.push({
        itemName: 'Closed Cell Sets',
        level: closedLevel,
        quantity: warehouse.closedCellSets,
      });
    }

    for (const item of warehouse.items) {
      const level = getStockLevel(item.quantity);
      if (level !== 'ok') {
        result.push({ itemName: item.name, level, quantity: item.quantity });
      }
    }

    return result;
  }, [warehouse]);

  return { alerts, hasAlerts: alerts.length > 0 };
}
