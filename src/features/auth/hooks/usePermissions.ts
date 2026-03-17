/**
 * usePermissions.ts
 *
 * Role-based permission helper. Admin has full access. Crew members have
 * read/write on a subset of resources and no access to sensitive ones.
 */

import { useAuth } from './useAuth';

// ---------------------------------------------------------------------------
// Permission matrix for crew members
// ---------------------------------------------------------------------------

type Action = 'read' | 'write' | 'delete';

const CREW_PERMISSIONS: Record<string, Action[]> = {
  estimates: ['read', 'write'],
  time: ['read', 'write'],
  photos: ['read', 'write'],
};

// Resources crew members have NO write/delete access to (read-only or none).
// Anything not in CREW_PERMISSIONS at all will return false for all actions.

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePermissions() {
  const { isAdmin, isCrew } = useAuth();

  /**
   * Returns true if the current session is allowed to perform `action` on
   * `resource`. Unauthenticated users are denied everything.
   */
  function can(action: Action, resource: string): boolean {
    if (isAdmin) return true;

    if (isCrew) {
      const allowed = CREW_PERMISSIONS[resource];
      if (!allowed) return false;
      return allowed.includes(action);
    }

    return false;
  }

  return {
    can,
    isAdmin,
    isCrew,
  };
}
