/**
 * authReducer.ts
 *
 * Pure reducer for auth state. No side-effects — callers are responsible for
 * persisting to storage before/after dispatching.
 */

import type { AuthState, UserSession } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type AuthAction =
  | { type: 'LOGIN'; payload: UserSession }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'NEEDS_COMPANY_SETUP' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialAuthState: AuthState = {
  session: null,
  isLoading: true,
  needsCompanySetup: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        session: action.payload,
        isLoading: false,
        needsCompanySetup: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        session: null,
        isLoading: false,
        needsCompanySetup: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'NEEDS_COMPANY_SETUP':
      return {
        ...state,
        isLoading: false,
        needsCompanySetup: true,
      };

    default:
      return state;
  }
}
