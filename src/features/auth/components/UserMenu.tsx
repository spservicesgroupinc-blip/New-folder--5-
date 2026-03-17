/**
 * UserMenu.tsx
 *
 * Dropdown menu showing the active user's name and a logout button.
 * Accepts a `session` prop so it can be used in contexts where the caller
 * already holds the session reference without an extra hook call.
 */

import React, { useState, useRef, useEffect } from 'react';

import { LogOut, ChevronDown, User } from 'lucide-react';
import { cn } from '../../../shared/utils/classNames';
import { useAuth } from '../hooks/useAuth';
import type { UserSession } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UserMenuProps {
  session: UserSession;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserMenu({ session }: UserMenuProps) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when user clicks outside it
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
          'bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-slate-900',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User size={16} className="shrink-0 text-slate-400" />
        <span className="max-w-[140px] truncate">{session.user.email ?? session.user.id}</span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-slate-400 transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 z-50 mt-1 w-52 rounded-lg border border-slate-700',
            'bg-slate-800 shadow-lg py-1',
          )}
        >
          {/* User info */}
          <div className="px-4 py-2 border-b border-slate-700">
            <p className="text-sm font-medium text-white truncate">
              {session.user.email ?? session.user.id}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {session.company.companyName}
            </p>
            <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 capitalize">
              {session.company.role}
            </span>
          </div>

          {/* Logout */}
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2 text-sm',
              'text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-150',
            )}
          >
            <LogOut size={14} className="shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
