/**
 * auth.types.ts
 *
 * Type definitions for the auth feature. These are independent of the legacy
 * root types.ts UserSession but are structurally compatible with it.
 */

export interface User {
  username: string;
  companyName: string;
  spreadsheetId: string;
  folderId?: string;
  token?: string;
}

export type UserRole = 'admin' | 'crew';

export interface UserSession extends User {
  role: UserRole;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}

export interface AuthState {
  session: UserSession | null;
  hasTrialAccess: boolean;
  isLoading: boolean;
}
