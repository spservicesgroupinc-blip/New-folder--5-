/**
 * settingsApi.ts
 *
 * Supabase operations for company_settings (key-value store).
 * RLS restricts to the user's company. Only admins can write.
 */

import { supabase } from './supabaseClient';
import type { CompanySetting, Json } from '../../types/database.types';

/**
 * Fetches all settings for the current user's company.
 */
export async function fetchSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from('company_settings')
    .select('key, value');

  if (error) throw error;

  const settings: Record<string, Json> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}

/**
 * Fetches a single setting value by key.
 */
export async function fetchSetting(key: string): Promise<Json | null> {
  const { data, error } = await supabase
    .from('company_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data?.value ?? null;
}

/**
 * Upserts a setting value. Requires admin role (enforced by RLS).
 */
export async function upsertSetting(companyId: number, key: string, value: Json): Promise<void> {
  const { error } = await supabase
    .from('company_settings')
    .upsert(
      { company_id: companyId, key, value },
      { onConflict: 'company_id,key' },
    );

  if (error) throw error;
}

/**
 * Fetches the company profile.
 */
export async function fetchCompanyProfile() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates the company profile. Requires admin role (enforced by RLS).
 */
export async function updateCompanyProfile(
  updates: Record<string, unknown>,
): Promise<void> {
  // get_user_company_id() ensures we update only our own company via RLS
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .single();

  if (!company) throw new Error('Company not found');

  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', company.id);

  if (error) throw error;
}
