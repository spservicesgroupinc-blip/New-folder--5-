/**
 * useAuth.ts
 *
 * High-level auth hook. Wraps Supabase Auth operations with company context
 * resolution. Handles login, signup (with company creation), crew invite
 * acceptance, and logout.
 */

import { useCallback } from 'react';

import { supabase } from '../../../shared/services/supabase';
import { useAuthContext } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth() {
  const { state, dispatch } = useAuthContext();

  const { session, isLoading, needsCompanySetup } = state;

  const isAuthenticated = session !== null;
  const isAdmin = session?.company.role === 'admin';
  const isCrew = session?.company.role !== 'admin';
  const companyId = session?.company.companyId ?? null;

  // -------------------------------------------------------------------------
  // login — email + password (works for both admin and crew)
  // -------------------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
      // onAuthStateChange in AuthContext handles the rest
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // signup — create Supabase user, then create company via Edge Function
  // -------------------------------------------------------------------------

  const signup = useCallback(
    async (email: string, password: string, companyName: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // Call Edge Function to create company + company_members row
        const { error: fnError } = await supabase.functions.invoke('create-company', {
          body: { companyName },
        });
        if (fnError) throw fnError;

        // onAuthStateChange in AuthContext handles session setup
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw err;
      }
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // createCompany — for users who signed up but don't have a company yet
  // -------------------------------------------------------------------------

  const createCompany = useCallback(
    async (companyName: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { error: fnError } = await supabase.functions.invoke('create-company', {
          body: { companyName },
        });
        if (fnError) throw fnError;

        // Force a re-evaluation by triggering a token refresh
        await supabase.auth.refreshSession();
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw err;
      }
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // loginCrew — crew member logs in with email + PIN
  // -------------------------------------------------------------------------

  const loginCrew = useCallback(
    async (email: string, pin: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
      if (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
      // onAuthStateChange in AuthContext handles the rest
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // inviteCrew — admin invites a crew member by email
  // -------------------------------------------------------------------------

  const inviteCrew = useCallback(
    async (email: string, role: string = 'crew'): Promise<void> => {
      const { error } = await supabase.functions.invoke('invite-crew', {
        body: { email, role },
      });
      if (error) throw error;
    },
    [],
  );

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return {
    session,
    isAdmin,
    isCrew,
    isAuthenticated,
    isLoading,
    needsCompanySetup,
    companyId,
    login,
    loginCrew,
    signup,
    createCompany,
    inviteCrew,
    logout,
  };
}
