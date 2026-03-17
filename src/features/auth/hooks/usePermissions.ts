/**
 * usePermissions.ts
 *
 * Role-based permission helper. Admin has full access. Non-admin roles
 * (crew, supervisor, technician, helper) have limited access based on
 * an explicit allowlist.
 */

import { useAuth } from './useAuth';
import type { MemberRole } from '../../../shared/types/database.types';

// ---------------------------------------------------------------------------
// Permission matrix
// ---------------------------------------------------------------------------

type Action = 'read' | 'write' | 'delete';

/**
 * Resources that non-admin roles are explicitly DENIED access to.
 */
const NON_ADMIN_DENIED_RESOURCES = new Set<string>([
  'settings',
  'company',
  'members',
  'profit_loss',
]);

/**
 * Resources non-admin roles can access, and which actions are allowed.
 * Supervisors get broader write access than technicians/helpers.
 */
const ROLE_PERMISSIONS: Record<string, Partial<Record<MemberRole, Action[]>>> = {
  estimates:   { crew: ['read', 'write'], supervisor: ['read', 'write'], technician: ['read'], helper: ['read'] },
  customers:   { crew: ['read'], supervisor: ['read', 'write'], technician: ['read'], helper: ['read'] },
  inventory:   { crew: ['read'], supervisor: ['read', 'write'], technician: ['read'], helper: ['read'] },
  equipment:   { crew: ['read', 'write'], supervisor: ['read', 'write'], technician: ['read', 'write'], helper: ['read'] },
  time:        { crew: ['read', 'write'], supervisor: ['read', 'write'], technician: ['read', 'write'], helper: ['read', 'write'] },
  photos:      { crew: ['read', 'write'], supervisor: ['read', 'write'], technician: ['read', 'write'], helper: ['read', 'write'] },
  materials:   { crew: ['read'], supervisor: ['read', 'write'], technician: ['read'], helper: ['read'] },
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePermissions() {
  const { isAdmin, session } = useAuth();
  const role = session?.company.role ?? null;

  function can(action: Action, resource: string): boolean {
    if (isAdmin) return true;
    if (!role) return false;

    // Explicit resource denial for non-admins
    if (NON_ADMIN_DENIED_RESOURCES.has(resource)) return false;

    // Non-admins may never delete
    if (action === 'delete') return false;

    // Check role-specific permissions
    const resourcePerms = ROLE_PERMISSIONS[resource];
    if (!resourcePerms) return false;

    return resourcePerms[role]?.includes(action) ?? false;
  }

  return {
    can,
    isAdmin,
    role,
  };
}
