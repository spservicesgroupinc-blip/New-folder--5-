/**
 * useInventory.ts
 *
 * Read/write hook for warehouse inventory derived from the legacy
 * CalculatorContext.
 */

import { useCallback } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import type { WarehouseItem } from '../../../../types';

export function useInventory() {
  const { state, dispatch } = useCalculator();
  const warehouse = state.appData.warehouse;

  const addItem = useCallback(
    (item: Omit<WarehouseItem, 'id'>) => {
      const newItem: WarehouseItem = { ...item, id: crypto.randomUUID() };
      dispatch({
        type: 'UPDATE_DATA',
        payload: {
          warehouse: {
            ...warehouse,
            items: [...warehouse.items, newItem],
          },
        },
      });
    },
    [dispatch, warehouse],
  );

  const removeItem = useCallback(
    (id: string) => {
      dispatch({
        type: 'UPDATE_DATA',
        payload: {
          warehouse: {
            ...warehouse,
            items: warehouse.items.filter((i) => i.id !== id),
          },
        },
      });
    },
    [dispatch, warehouse],
  );

  const updateItem = useCallback(
    (id: string, field: string, value: unknown) => {
      dispatch({
        type: 'UPDATE_DATA',
        payload: {
          warehouse: {
            ...warehouse,
            items: warehouse.items.map((i) =>
              i.id === id ? { ...i, [field]: value } : i,
            ),
          },
        },
      });
    },
    [dispatch, warehouse],
  );

  const updateSetCount = useCallback(
    (field: 'openCellSets' | 'closedCellSets', value: number) => {
      dispatch({
        type: 'UPDATE_DATA',
        payload: {
          warehouse: {
            ...warehouse,
            [field]: Math.max(0, value),
          },
        },
      });
    },
    [dispatch, warehouse],
  );

  return {
    openCellSets: warehouse.openCellSets,
    closedCellSets: warehouse.closedCellSets,
    items: warehouse.items,
    addItem,
    removeItem,
    updateItem,
    updateSetCount,
  };
}
