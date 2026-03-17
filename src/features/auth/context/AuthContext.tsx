/**
 * AuthContext.tsx
 *
 * React context that integrates with Supabase Auth. Listens to
 * onAuthStateChange for session persistence and resolves company
 * membership on login. Feature components should use the higher-level
 * useAuth() hook from ../hooks/useAuth rather than consuming this
 * context directly.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type Dispatch,
  type ReactNode,
} from 'react';

import { supabase } from '../../../shared/services/supabase';
import { authReducer, initialAuthState, type AuthAction } from './authReducer';
import type { AuthState, UserSession, CompanyContext } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helper: resolve company membership for a user
// ---------------------------------------------------------------------------

async function resolveCompanyContext(userId: string): Promise<CompanyContext | null> {
  const { data, error } = await supabase
    .from('company_members')
    .select('company_id, role, companies(name)')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error || !data) return null;

  const row = data as any;
  const companyName = row.companies?.name ?? '';

  return {
    companyId: row.company_id,
    companyName,
    role: row.role,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const company = await resolveCompanyContext(session.user.id);
        if (company) {
          const userSession: UserSession = {
            user: session.user,
            supabaseSession: session,
            company,
          };
          dispatch({ type: 'LOGIN', payload: userSession });
        } else {
          // Authenticated but no company — needs setup
          dispatch({ type: 'NEEDS_COMPANY_SETUP' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          dispatch({ type: 'LOGOUT' });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const company = await resolveCompanyContext(session.user.id);
          if (company) {
            const userSession: UserSession = {
              user: session.user,
              supabaseSession: session,
              company,
            };
            dispatch({ type: 'LOGIN', payload: userSession });
          } else {
            dispatch({ type: 'NEEDS_COMPANY_SETUP' });
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
