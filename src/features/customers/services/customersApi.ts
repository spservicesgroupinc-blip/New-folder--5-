/**
 * customersApi.ts
 *
 * Thin wrapper for persisting customer data via the full-state syncUp call.
 * There is no standalone customer endpoint; customers are saved as part of
 * the complete CalculatorState payload.
 */

import { syncUp } from '../../../shared/services/api/sheetsApi';
import type { CalculatorState } from '../../../../types';

/**
 * Persists the current application state (including the customers array) to
 * the backing Google Sheet.
 */
export const apiSaveCustomers = async (
  state: CalculatorState,
  spreadsheetId: string,
): Promise<boolean> => {
  return syncUp(state, spreadsheetId);
};
