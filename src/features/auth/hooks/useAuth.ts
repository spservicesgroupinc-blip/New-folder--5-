/**
 * useAuth.ts
 *
 * High-level auth hook. Wraps raw context dispatch with login/logout/signup
 * operations that include API calls and localStorage persistence.
 */

import { useCallback } from 'react';

import {
  loginUser,
  loginCrew,
  signupUser,
} from '../../../shared/services/api/sheetsApi';
import { STORAGE_KEYS } from '../../../shared/services/storage/storageKeys';
import localCache from '../../../shared/services/storage/localCache';
import { useAuthContext } from '../context/AuthContext';
import type { UserSession } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth() {
  const { state, dispatch } = useAuthContext();

  const { session, hasTrialAccess, isLoading } = state;

  const isAuthenticated = session !== null;
  const isAdmin = session?.role === 'admin';
  const isCrew = session?.role === 'crew';

  // -------------------------------------------------------------------------
  // login — admin username + password
  // -------------------------------------------------------------------------

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await loginUser(username, password);
        if (!result) throw new Error('Login returned no session');
        // Cast: the legacy UserSession from sheetsApi is structurally
        // compatible with our local UserSession type.
        const newSession = result as unknown as UserSession;
        localCache.set<UserSession>(STORAGE_KEYS.SESSION, newSession);
        dispatch({ type: 'LOGIN', payload: newSession });
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw err;
      }
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // loginCrew — crew username + PIN
  // -------------------------------------------------------------------------

  const loginCrewMember = useCallback(
    async (username: string, pin: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await loginCrew(username, pin);
        if (!result) throw new Error('Crew login returned no session');
        const newSession = result as unknown as UserSession;
        localCache.set<UserSession>(STORAGE_KEYS.SESSION, newSession);
        dispatch({ type: 'LOGIN', payload: newSession });
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw err;
      }
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // signup — create new company account
  // -------------------------------------------------------------------------

  const signup = useCallback(
    async (
      username: string,
      password: string,
      companyName: string,
    ): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await signupUser(username, password, companyName);
        if (!result) throw new Error('Signup returned no session');
        const newSession = result as unknown as UserSession;
        localCache.set<UserSession>(STORAGE_KEYS.SESSION, newSession);
        dispatch({ type: 'LOGIN', payload: newSession });
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw err;
      }
    },
    [dispatch],
  );

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------

  const logout = useCallback((): void => {
    localCache.remove(STORAGE_KEYS.SESSION);
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return {
    session,
    isAdmin,
    isCrew,
    isAuthenticated,
    isLoading,
    hasTrialAccess,
    login,
    loginCrew: loginCrewMember,
    signup,
    logout,
  };
}
