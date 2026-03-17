import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallResult {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
}

/**
 * Captures the `beforeinstallprompt` event so the app can trigger the
 * browser's install flow at a time of its choosing, rather than when the
 * browser decides to show it automatically.
 *
 * `isInstalled` becomes `true` once the `appinstalled` event fires.
 */
function usePWAInstall(): UsePWAInstallResult {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    // Detect if already running as a standalone PWA (Android / desktop Chrome).
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari sets this property when running from the home screen.
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent Chrome ≤ 67 from automatically showing the prompt.
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setPromptEvent(null);
  }, [promptEvent]);

  return {
    canInstall: promptEvent !== null && !isInstalled,
    isInstalled,
    install,
  };
}

export default usePWAInstall;
