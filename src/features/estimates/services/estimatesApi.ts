/**
 * estimatesApi.ts
 *
 * Supabase CRUD operations for estimates. RLS automatically scopes
 * all queries to the current user's company.
 */

import { supabase } from '../../../shared/services/supabase';
import type {
  Estimate,
  EstimateInsert,
  EstimateUpdate,
  Json,
} from '../../../shared/types/database.types';

export async function fetchEstimates(): Promise<Estimate[]> {
  const { data, error } = await supabase
    .from('estimates')
    .select('*, customers(name, address, city, state, zip)')
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchEstimateById(id: number): Promise<Estimate | null> {
  const { data, error } = await supabase
    .from('estimates')
    .select('*, customers(name, address, city, state, zip)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEstimate(estimate: EstimateInsert): Promise<Estimate> {
  const { data, error } = await supabase
    .from('estimates')
    .insert(estimate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEstimate(id: number, updates: EstimateUpdate): Promise<Estimate> {
  const { data, error } = await supabase
    .from('estimates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEstimate(id: number): Promise<void> {
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Marks a job as paid via the server-side RPC function that also
 * creates the P&L record in a single transaction.
 */
export async function markJobPaid(estimateId: number): Promise<Json> {
  const { data, error } = await supabase.rpc('mark_job_paid', {
    p_estimate_id: estimateId,
  });

  if (error) throw error;
  return data;
}

/**
 * Completes a job via the server-side RPC function that handles
 * inventory delta deduction and material logging atomically.
 */
export async function completeJob(estimateId: number, actuals: Json): Promise<Json> {
  const { data, error } = await supabase.rpc('complete_job', {
    p_estimate_id: estimateId,
    p_actuals: actuals,
  });

  if (error) throw error;
  return data;
}
