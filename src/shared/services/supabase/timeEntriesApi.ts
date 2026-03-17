/**
 * timeEntriesApi.ts
 *
 * Supabase CRUD for crew time entries. RLS scopes to company.
 * Users can only create/update their own entries (enforced by RLS).
 */

import { supabase } from './supabaseClient';
import type { TimeEntry, TimeEntryInsert } from '../../types/database.types';

export async function fetchTimeEntries(estimateId?: number): Promise<TimeEntry[]> {
  let query = supabase
    .from('time_entries')
    .select('*')
    .order('start_time', { ascending: false });

  if (estimateId !== undefined) {
    query = query.eq('estimate_id', estimateId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function clockIn(entry: TimeEntryInsert): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function clockOut(timeEntryId: number): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from('time_entries')
    .update({ end_time: new Date().toISOString() })
    .eq('id', timeEntryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets the currently active (unclosed) time entry for a user, if any.
 */
export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
