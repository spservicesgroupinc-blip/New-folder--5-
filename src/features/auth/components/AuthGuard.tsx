/**
 * AuthGuard.tsx
 *
 * Renders children only when the user is authenticated and, optionally, when
 * they hold a specific role. Falls back to `fallback` (default: null) in all
 * other cases.
 */

import React, { type ReactNode } from 'react';

import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireRole?: UserRole;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthGuard({
  children,
  fallback = null,
  requireRole,
}: AuthGuardProps) {
  const { session } = useAuth();

  // No session at all — not authenticated
  if (!session) return <>{fallback}</>;

  // Role requirement specified but current role does not match
  if (requireRole && session.role !== requireRole) return <>{fallback}</>;

  return <>{children}</>;
}
