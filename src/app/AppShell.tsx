import React, { ReactNode } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import { Toast } from '../shared/components/ui/Toast';
import { useOnlineStatus } from '../shared/hooks';

interface AppShellProps {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Offline Banner
// ---------------------------------------------------------------------------
const OfflineBanner: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="fixed top-0 inset-x-0 z-[9998] flex items-center justify-center
               bg-yellow-400 text-yellow-900 text-sm font-medium px-4 py-2
               shadow-md"
  >
    You are offline. Changes will sync when reconnected.
  </div>
);

// ---------------------------------------------------------------------------
// App Shell
// ---------------------------------------------------------------------------
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { state, dispatch } = useCalculator();
  const isOnline = useOnlineStatus();
  const notification = state.ui.notification;

  const dismissNotification = () => {
    dispatch({ type: 'SET_NOTIFICATION', payload: null });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Offline indicator — rendered above everything else */}
      {!isOnline && <OfflineBanner />}

      {/* Toast notification */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={dismissNotification}
        />
      )}

      {/* Main content area — push content down when offline banner is visible */}
      <main className={!isOnline ? 'pt-9' : undefined}>
        {children}
      </main>
    </div>
  );
};
