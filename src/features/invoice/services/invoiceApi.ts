import {
  savePdfToDrive,
  logCrewTime,
  completeJob,
} from '../../../../services/api';

/**
 * Saves a generated PDF to Google Drive and returns the file URL.
 */
export async function apiSavePdfToDrive(
  fileName: string,
  base64Data: string,
  estimateId: string | undefined,
  spreadsheetId: string,
  folderId?: string,
): Promise<string | null> {
  return savePdfToDrive(fileName, base64Data, estimateId, spreadsheetId, folderId);
}

/**
 * Logs crew clock-in / clock-out time against a Work Order sheet.
 */
export async function apiLogCrewTime(
  workOrderUrl: string,
  startTime: string,
  endTime: string,
  user: string,
): Promise<boolean> {
  return logCrewTime(workOrderUrl, startTime, endTime, user);
}

/**
 * Marks a job as complete and syncs actual material usage to inventory.
 */
export async function apiCompleteJob(
  estimateId: string,
  actuals: Record<string, unknown>,
  spreadsheetId: string,
): Promise<boolean> {
  return completeJob(estimateId, actuals, spreadsheetId);
}
