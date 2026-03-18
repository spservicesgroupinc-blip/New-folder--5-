import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  console.error(
    `[Supabase] Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Set them in your Vercel project settings (or .env file locally). ' +
    'All database operations will fail until these are configured.',
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
);

/** True when Supabase credentials are properly configured. */
export const isSupabaseConfigured = missingVars.length === 0;
