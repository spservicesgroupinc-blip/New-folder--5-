/**
 * Role-based access control definitions and permission checker.
 */
const ROLE_PERMISSIONS = {
  admin: ['all'],
  crew: [
    'read:estimates',
    'write:time',
    'write:photos',
  ],
};

const Permissions = {
  /**
   * Returns true if the given role has the specified permission.
   * Admins with the 'all' wildcard always return true.
   * @param {string} role
   * @param {string} action  e.g. 'read:estimates'
   * @returns {boolean}
   */
  hasPermission(role, action) {
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    if (perms.includes('all')) return true;
    return perms.includes(action);
  },

  /**
   * Throws an Errors.unauthorized() if the role lacks the requested permission.
   * @param {string} role
   * @param {string} action
   */
  requirePermission(role, action) {
    if (!Permissions.hasPermission(role, action)) {
      Errors.unauthorized(`Role '${role}' cannot perform '${action}'`);
    }
  },
};
