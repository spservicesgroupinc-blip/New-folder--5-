/**
 * profitLossApi.ts
 *
 * Read-only Supabase operations for profit & loss records.
 * P&L records are created by the mark_job_paid RPC function.
 */

import { supabase } from './supabaseClient';
import type { ProfitLoss } from '../../types/database.types';

export async function fetchProfitLoss(): Promise<ProfitLoss[]> {
  const { data, error } = await supabase
    .from('profit_loss')
    .select('*')
    .order('date_paid', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchProfitLossByEstimate(estimateId: number): Promise<ProfitLoss | null> {
  const { data, error } = await supabase
    .from('profit_loss')
    .select('*')
    .eq('estimate_id', estimateId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
