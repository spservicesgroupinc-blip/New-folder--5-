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

/**
 * Resources that crew members are explicitly DENIED access to, regardless of
 * action. Enumerated here (rather than relying on map absence) so that denials
 * are audit-visible and cannot be accidentally bypassed by adding a key to
 * CREW_ALLOWED.
 */
const CREW_DENIED_RESOURCES = new Set<string>(['settings', 'customers', 'inventory']);

/**
 * Resources crew members are allowed to read/write (but never delete).
 * `delete` is explicitly denied for all resources — see can() below.
 */
const CREW_ALLOWED: Map<string, Action[]> = new Map([
  ['estimates', ['read', 'write']],
  ['time',      ['read', 'write']],
  ['photos',    ['read', 'write']],
]);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePermissions() {
  const { isAdmin, isCrew } = useAuth();

  /**
   * Returns true if the current session is allowed to perform `action` on
   * `resource`. Unauthenticated users are denied everything.
   *
   * Evaluation order for crew:
   *   1. Explicitly denied resources → false
   *   2. Explicitly denied action (delete) → false
   *   3. Allowed resource + action map → result
   *   4. Anything else → false
   */
  function can(action: Action, resource: string): boolean {
    if (isAdmin) return true;

    if (isCrew) {
      // 1. Explicit resource denial
      if (CREW_DENIED_RESOURCES.has(resource)) return false;
      // 2. Explicit action denial — crew may never delete anything
      if (action === 'delete') return false;
      // 3. Check allowed map
      return CREW_ALLOWED.get(resource)?.includes(action) ?? false;
    }

    return false;
  }

  return {
    can,
    isAdmin,
    isCrew,
  };
}
