import React, { useEffect } from 'react';
import { AppProviders } from './AppProviders';
import { AppShell } from './AppShell';
import { AppRouter } from './AppRouter';
import { useCalculator } from '../../context/CalculatorContext';

// ---------------------------------------------------------------------------
// Session Restorer
// Runs inside AppProviders so it has access to the CalculatorContext.
// ---------------------------------------------------------------------------
const SessionRestorer: React.FC = () => {
  const { dispatch } = useCalculator();

  useEffect(() => {
    // Restore user session saved from a previous visit.
    const storedSession = localStorage.getItem('foamProSession');
    if (storedSession) {
      try {
        dispatch({
          type: 'SET_SESSION',
          payload: JSON.parse(storedSession),
        });
      } catch {
        // Corrupted data — ignore and proceed without a session.
      }
    }

    // Restore trial-access flag.
    const trialAccess = localStorage.getItem('foamProTrialAccess');
    if (trialAccess) {
      dispatch({ type: 'SET_TRIAL_ACCESS', payload: true });
    }

    // Signal that initial hydration is complete.
    dispatch({ type: 'SET_INITIALIZED', payload: true });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [dispatch]);

  return null;
};

// ---------------------------------------------------------------------------
// Root Component
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <AppProviders>
      <SessionRestorer />
      <AppShell>
        <AppRouter />
      </AppShell>
    </AppProviders>
  );
}
