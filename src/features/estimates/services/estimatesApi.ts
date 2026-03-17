/**
 * estimatesApi.ts
 *
 * Thin wrappers around the shared sheetsApi calls relevant to estimates.
 */

import {
  syncUp,
  deleteEstimate,
  markJobPaid,
  createWorkOrderSheet,
} from '../../../shared/services/api/sheetsApi';
import type { CalculatorState, EstimateRecord } from '../../../../types';

/**
 * Persists the full application state to the backing sheet (used for save/update).
 */
export const apiSaveEstimate = async (
  state: CalculatorState,
  spreadsheetId: string,
): Promise<boolean> => {
  return syncUp(state, spreadsheetId);
};

/**
 * Permanently deletes an estimate record from the backing sheet.
 */
export const apiDeleteEstimate = async (
  id: string,
  spreadsheetId: string,
): Promise<boolean> => {
  return deleteEstimate(id, spreadsheetId);
};

/**
 * Marks a job as paid and triggers P&L calculation on the backend.
 */
export const apiMarkPaid = async (
  id: string,
  spreadsheetId: string,
): Promise<{ success: boolean; estimate?: EstimateRecord }> => {
  return markJobPaid(id, spreadsheetId);
};

/**
 * Creates a standalone Work Order Google Sheet and returns its URL.
 */
export const apiCreateWorkOrderSheet = async (
  estimate: EstimateRecord,
  folderId: string | undefined,
  spreadsheetId: string,
): Promise<string | null> => {
  return createWorkOrderSheet(estimate, folderId, spreadsheetId);
};
