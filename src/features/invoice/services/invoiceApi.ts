/**
 * invoiceApi.ts
 *
 * Supabase operations for invoice-related workflows: PDF storage,
 * time logging, and job completion. RLS handles company scoping.
 */

import { supabase } from '../../../shared/services/supabase';
import type { TimeEntryInsert, Json } from '../../../shared/types/database.types';

/**
 * Uploads a PDF to Supabase Storage and returns the public URL.
 */
export async function uploadPdf(
  companyId: number,
  estimateId: number,
  fileName: string,
  file: Blob,
): Promise<string> {
  const path = `${companyId}/pdfs/${estimateId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('company-files')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Update the estimate's pdf_url
  await supabase
    .from('estimates')
    .update({ pdf_url: path })
    .eq('id', estimateId);

  return path;
}

/**
 * Uploads a site photo to Supabase Storage.
 */
export async function uploadSitePhoto(
  companyId: number,
  estimateId: number,
  fileName: string,
  file: Blob,
): Promise<string> {
  const path = `${companyId}/photos/${estimateId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('company-files')
    .upload(path, file);

  if (uploadError) throw uploadError;
  return path;
}

/**
 * Gets a signed URL for a file in company storage.
 */
export async function getFileUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('company-files')
    .createSignedUrl(path, 3600); // 1-hour expiry

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Logs crew time against a job.
 */
export async function logCrewTime(entry: TimeEntryInsert): Promise<void> {
  const { error } = await supabase
    .from('time_entries')
    .insert(entry);

  if (error) throw error;
}

/**
 * Clocks out a crew member by setting end_time on their active time entry.
 */
export async function clockOut(timeEntryId: number): Promise<void> {
  const { error } = await supabase
    .from('time_entries')
    .update({ end_time: new Date().toISOString() })
    .eq('id', timeEntryId);

  if (error) throw error;
}

/**
 * Calls the complete_job server RPC for atomic inventory deduction.
 */
export async function completeJob(estimateId: number, actuals: Json): Promise<Json> {
  const { data, error } = await supabase.rpc('complete_job', {
    p_estimate_id: estimateId,
    p_actuals: actuals,
  });

  if (error) throw error;
  return data;
}
