/**
 * auth.types.ts
 *
 * Type definitions for the auth feature. Uses Supabase Auth for identity
 * and company_members table for role/company context.
 */

import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import type { MemberRole } from '../../../shared/types/database.types';

export type UserRole = MemberRole;

export interface CompanyContext {
  companyId: number;
  companyName: string;
  role: UserRole;
}

export interface UserSession {
  user: SupabaseUser;
  supabaseSession: SupabaseSession;
  company: CompanyContext;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}

export interface AuthState {
  session: UserSession | null;
  isLoading: boolean;
  needsCompanySetup: boolean;
}
