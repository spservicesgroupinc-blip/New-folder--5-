/**
 * sheetsApi.ts
 *
 * Typed wrappers around every Google Apps Script action. Each function maps
 * one-to-one with a backend action string and returns a clean, typed result so
 * callers never have to inspect raw ApiResponse objects.
 */

import { apiRequest } from './apiClient';
import type { CalculatorState, EstimateRecord, UserSession } from '../../../../types';

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

/**
 * Fetches the full application state from Google Sheets.
 */
export const syncDown = async (
  spreadsheetId: string,
): Promise<Partial<CalculatorState> | null> => {
  const result = await apiRequest<Partial<CalculatorState>>({
    action: 'SYNC_DOWN',
    payload: { spreadsheetId },
  });

  if (result.status === 'success') {
    return result.data ?? null;
  }
  console.error('syncDown error:', result.message);
  return null;
};

/**
 * Pushes the full application state to Google Sheets.
 */
export const syncUp = async (
  state: CalculatorState,
  spreadsheetId: string,
): Promise<boolean> => {
  const result = await apiRequest({
    action: 'SYNC_UP',
    payload: { state, spreadsheetId },
  });
  return result.status === 'success';
};

// ---------------------------------------------------------------------------
// Estimates / Jobs
// ---------------------------------------------------------------------------

/**
 * Marks a job as paid and triggers the P&L calculation on the backend.
 */
export const markJobPaid = async (
  estimateId: string,
  spreadsheetId: string,
): Promise<{ success: boolean; estimate?: EstimateRecord }> => {
  const result = await apiRequest<{ estimate?: EstimateRecord }>({
    action: 'MARK_JOB_PAID',
    payload: { estimateId, spreadsheetId },
  });
  return {
    success: result.status === 'success',
    estimate: result.data?.estimate,
  };
};

/**
 * Creates a standalone Work Order Google Sheet and returns its URL.
 */
export const createWorkOrderSheet = async (
  estimateData: EstimateRecord,
  folderId: string | undefined,
  spreadsheetId: string,
): Promise<string | null> => {
  const result = await apiRequest<{ url: string }>({
    action: 'CREATE_WORK_ORDER',
    payload: { estimateData, folderId, spreadsheetId },
  });
  if (result.status === 'success') return result.data?.url ?? null;
  console.error('createWorkOrderSheet error:', result.message);
  return null;
};

/**
 * Logs crew time against a Work Order Sheet row.
 */
export const logCrewTime = async (
  workOrderUrl: string,
  startTime: string,
  endTime: string | null,
  user: string,
): Promise<boolean> => {
  const result = await apiRequest({
    action: 'LOG_TIME',
    payload: { workOrderUrl, startTime, endTime, user },
  });
  return result.status === 'success';
};

/**
 * Marks a job complete and syncs inventory consumption back to the sheet.
 */
export const completeJob = async (
  estimateId: string,
  actuals: unknown,
  spreadsheetId: string,
): Promise<boolean> => {
  const result = await apiRequest({
    action: 'COMPLETE_JOB',
    payload: { estimateId, actuals, spreadsheetId },
  });
  return result.status === 'success';
};

/**
 * Permanently deletes an estimate and its associated Drive files.
 */
export const deleteEstimate = async (
  estimateId: string,
  spreadsheetId: string,
): Promise<boolean> => {
  const result = await apiRequest({
    action: 'DELETE_ESTIMATE',
    payload: { estimateId, spreadsheetId },
  });
  return result.status === 'success';
};

// ---------------------------------------------------------------------------
// Drive / Files
// ---------------------------------------------------------------------------

/**
 * Saves a base-64 encoded PDF to Google Drive and returns the file URL.
 */
export const savePdfToDrive = async (
  fileName: string,
  base64Data: string,
  estimateId: string | undefined,
  spreadsheetId: string,
  folderId?: string,
): Promise<string | null> => {
  const result = await apiRequest<{ url: string }>({
    action: 'SAVE_PDF',
    payload: { fileName, base64Data, estimateId, spreadsheetId, folderId },
  });
  return result.status === 'success' ? (result.data?.url ?? null) : null;
};

/**
 * Uploads a base-64 encoded image to Google Drive and returns the direct link.
 */
export const uploadImage = async (
  base64Data: string,
  spreadsheetId: string,
  fileName = 'image.jpg',
): Promise<string | null> => {
  const result = await apiRequest<{ url: string }>({
    action: 'UPLOAD_IMAGE',
    payload: { base64Data, spreadsheetId, fileName },
  });
  return result.status === 'success' ? (result.data?.url ?? null) : null;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Authenticates an admin user. Throws on failure so callers can catch.
 */
export const loginUser = async (
  username: string,
  password: string,
): Promise<UserSession | null> => {
  const result = await apiRequest<UserSession>({
    action: 'LOGIN',
    payload: { username, password },
  });
  if (result.status === 'success') return result.data ?? null;
  throw new Error(result.message ?? 'Login failed');
};

/**
 * Authenticates a crew member via PIN. Throws on failure.
 */
export const loginCrew = async (
  username: string,
  pin: string,
): Promise<UserSession | null> => {
  const result = await apiRequest<UserSession>({
    action: 'CREW_LOGIN',
    payload: { username, pin },
  });
  if (result.status === 'success') return result.data ?? null;
  throw new Error(result.message ?? 'Crew login failed');
};

/**
 * Creates a new company account. Throws on failure.
 */
export const signupUser = async (
  username: string,
  password: string,
  companyName: string,
): Promise<UserSession | null> => {
  const result = await apiRequest<UserSession>({
    action: 'SIGNUP',
    payload: { username, password, companyName },
  });
  if (result.status === 'success') return result.data ?? null;
  throw new Error(result.message ?? 'Signup failed');
};

// ---------------------------------------------------------------------------
// Trial
// ---------------------------------------------------------------------------

/**
 * Submits a lead for trial access.
 */
export const submitTrial = async (
  name: string,
  email: string,
  phone: string,
): Promise<boolean> => {
  const result = await apiRequest({
    action: 'SUBMIT_TRIAL',
    payload: { name, email, phone },
  });
  return result.status === 'success';
};
