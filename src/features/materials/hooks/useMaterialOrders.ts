/**
 * useMaterialOrders.ts
 *
 * Read/write hook for purchase orders derived from the legacy
 * CalculatorContext.
 */

import { useMemo, useCallback } from 'react';
import { useCalculator } from '../../../../context/CalculatorContext';
import { apiSavePurchaseOrder } from '../services/materialsApi';
import type { PurchaseOrder } from '../../../../types';

export function useMaterialOrders() {
  const { state, dispatch } = useCalculator();
  const orders: PurchaseOrder[] = state.appData.purchaseOrders ?? [];

  const recentOrders = useMemo<PurchaseOrder[]>(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [orders],
  );

  const totalSpend = useMemo<number>(
    () =>
      orders
        .filter((o) => o.status === 'Received')
        .reduce((sum, o) => sum + o.totalCost, 0),
    [orders],
  );

  const createOrder = useCallback(
    async (po: PurchaseOrder): Promise<void> => {
      const updated = [...orders, po];
      dispatch({
        type: 'UPDATE_DATA',
        payload: { purchaseOrders: updated },
      });

      const spreadsheetId = state.session?.spreadsheetId;
      if (spreadsheetId) {
        const nextState = {
          ...state.appData,
          purchaseOrders: updated,
        };
        await apiSavePurchaseOrder(po, nextState, spreadsheetId);
      }
    },
    [dispatch, orders, state.appData, state.session],
  );

  return { orders, recentOrders, totalSpend, createOrder };
}
