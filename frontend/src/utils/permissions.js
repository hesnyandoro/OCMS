// RBAC Permission Utilities for Frontend

/**
 * Permission matrix defining what each role can do
 */
export const PERMISSIONS = {
  admin: {
    farmers: ['create', 'read', 'update', 'delete'],
    deliveries: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    users: ['create', 'read', 'update', 'delete']
  },
  fieldagent: {
    farmers: ['create', 'read'], // Read limited to own region
    deliveries: ['create', 'read'], // Read limited to own region
    payments: ['read'], // Read only payment status, limited to own region
    reports: [],
    users: []
  }
};

/**
 * Check if a user has permission to perform an action on a resource
 * @param {string} role - User role ('admin' or 'fieldagent')
 * @param {string} resource - Resource name ('farmers', 'deliveries', 'payments', 'reports', 'users')
 * @param {string} action - Action name ('create', 'read', 'update', 'delete')
 * @returns {boolean}
 */
export const hasPermission = (role, resource, action) => {
  if (!role || !PERMISSIONS[role]) return false;
  const resourcePermissions = PERMISSIONS[role][resource];
  return resourcePermissions ? resourcePermissions.includes(action) : false;
};

/**
 * Check if user can create a resource
 */
export const canCreate = (role, resource) => hasPermission(role, resource, 'create');

/**
 * Check if user can read a resource
 */
export const canRead = (role, resource) => hasPermission(role, resource, 'read');

/**
 * Check if user can update a resource
 */
export const canUpdate = (role, resource) => hasPermission(role, resource, 'update');

/**
 * Check if user can delete a resource
 */
export const canDelete = (role, resource) => hasPermission(role, resource, 'delete');

/**
 * Check if user is admin
 */
export const isAdmin = (role) => role === 'admin';

/**
 * Check if user is field agent
 */
export const isFieldAgent = (role) => role === 'fieldagent';

/**
 * Get all accessible navigation items based on role
 */
export const getAccessibleNavItems = (role) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'fieldagent'] },
    { name: 'Farmers', path: '/dashboard/farmers', roles: ['admin', 'fieldagent'] },
    { name: 'Deliveries', path: '/dashboard/deliveries', roles: ['admin', 'fieldagent'] },
    { name: 'Payments', path: '/dashboard/payments', roles: ['admin', 'fieldagent'] },
    { name: 'Reports', path: '/dashboard/reports', roles: ['admin'] },
    { name: 'Users', path: '/dashboard/users', roles: ['admin'] }
  ];

  return navItems.filter(item => item.roles.includes(role));
};

/**
 * Get accessible quick actions based on role
 */
export const getAccessibleQuickActions = (role) => {
  const quickActions = [
    { name: 'New Farmer', path: '/dashboard/farmers/new', roles: ['admin', 'fieldagent'] },
    { name: 'Record Delivery', path: '/dashboard/deliveries/new', roles: ['admin', 'fieldagent'] },
    { name: 'Record Payment', path: '/dashboard/payments/new', roles: ['admin'] },
    { name: 'Create Field Agent', path: '/dashboard/users/new', roles: ['admin'] }
  ];

  return quickActions.filter(action => action.roles.includes(role));
};

export default {
  PERMISSIONS,
  hasPermission,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  isAdmin,
  isFieldAgent,
  getAccessibleNavItems,
  getAccessibleQuickActions
};
