import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/classNames';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const typeConfig: Record<
  ToastType,
  { icon: React.ReactNode; classes: string }
> = {
  success: {
    icon: <CheckCircle size={18} className="text-emerald-400 shrink-0" />,
    classes: 'bg-slate-800 border-emerald-500/40',
  },
  error: {
    icon: <XCircle size={18} className="text-red-400 shrink-0" />,
    classes: 'bg-slate-800 border-red-500/40',
  },
  info: {
    icon: <Info size={18} className="text-blue-400 shrink-0" />,
    classes: 'bg-slate-800 border-blue-500/40',
  },
};

export function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = typeConfig[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed top-4 right-4 z-[9999] flex items-start gap-3',
        'w-full max-w-sm rounded-xl border shadow-xl px-4 py-3',
        config.classes
      )}
    >
      {config.icon}
      <p className="flex-1 text-sm text-white leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors shrink-0 p-0.5 rounded"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
