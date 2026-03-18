
import React, { useEffect, useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface PWAInstallBannerProps {
  /** The deferred BeforeInstallPromptEvent captured from `beforeinstallprompt` */
  deferredPrompt: any;
  onInstall: () => Promise<void>;
}

/**
 * Detects whether the user is on iOS/iPadOS Safari where `beforeinstallprompt`
 * is not available but "Add to Home Screen" is still supported.
 */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as macOS in UA, so check for touch support too
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

const DISMISS_KEY = 'rfe-pwa-banner-dismissed';

/**
 * PWAInstallBanner — shown at the bottom of the screen to prompt users to
 * install the app.  Handles two flows:
 *  1. Chrome / Edge / Android — uses the deferred BeforeInstallPromptEvent.
 *  2. iOS / iPadOS Safari — shows manual "Add to Home Screen" instructions.
 */
export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  deferredPrompt,
  onInstall,
}) => {
  const [visible, setVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    if (deferredPrompt) {
      // Chrome / Edge / Android: show the install banner
      setVisible(true);
      setShowIOSInstructions(false);
    } else if (isIOS()) {
      // iOS Safari: show manual instructions
      setVisible(true);
      setShowIOSInstructions(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  const handleInstall = async () => {
    await onInstall();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop for iOS instructions modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm"
          onClick={handleDismiss}
        />
      )}

      {/* Banner / Modal */}
      <div
        className={`fixed z-[201] bg-white border border-slate-200 shadow-2xl
          ${showIOSInstructions
            ? 'bottom-0 left-0 right-0 rounded-t-3xl p-6'
            : 'bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 rounded-2xl p-5'
          }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-lg tracking-tighter">RFE</span>
            </div>
            <div>
              <p className="font-black text-slate-900 leading-tight">Install RFE Foam Pro</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {showIOSInstructions
                  ? 'Add to your Home Screen for fast access'
                  : 'Install as a desktop or mobile app'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIOSInstructions ? (
          /* iOS Safari manual instructions */
          <div className="space-y-3">
            <p className="text-sm text-slate-600 font-medium">
              Follow these steps to add RFE Foam Pro to your home screen:
            </p>
            <ol className="space-y-3">
              <li className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-black flex-shrink-0">1</div>
                <div className="text-sm text-slate-700">
                  Tap the <span className="inline-flex items-center gap-1 font-bold bg-slate-200 px-2 py-0.5 rounded-md text-slate-800"><Share className="w-3.5 h-3.5" /> Share</span> button in Safari's toolbar
                </div>
              </li>
              <li className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-black flex-shrink-0">2</div>
                <div className="text-sm text-slate-700">
                  Scroll down and tap <span className="inline-flex items-center gap-1 font-bold bg-slate-200 px-2 py-0.5 rounded-md text-slate-800"><Plus className="w-3.5 h-3.5" /> Add to Home Screen</span>
                </div>
              </li>
              <li className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-black flex-shrink-0">3</div>
                <div className="text-sm text-slate-700">
                  Tap <span className="font-bold text-brand">Add</span> in the top-right corner to install
                </div>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full mt-2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
              Got it
            </button>
          </div>
        ) : (
          /* Chrome / Edge / Android install button */
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Works offline · Fast access · No app store needed
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors text-sm shadow-lg shadow-red-100"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                Not now
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PWAInstallBanner;
