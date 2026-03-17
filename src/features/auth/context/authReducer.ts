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
  | { type: 'SET_TRIAL_ACCESS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialAuthState: AuthState = {
  session: null,
  hasTrialAccess: false,
  isLoading: false,
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
      };

    case 'LOGOUT':
      return {
        ...state,
        session: null,
        isLoading: false,
      };

    case 'SET_TRIAL_ACCESS':
      return {
        ...state,
        hasTrialAccess: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}
