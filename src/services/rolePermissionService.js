/**
 * Role Permission Service - Main Facade
 * 
 * This file serves as the main entry point for all role and permission functionality.
 * It re-exports functions from the organized service modules for backward compatibility.
 * 
 * New code should import directly from specific services:
 * - import { getUserRoleForChild } from '../services/roles';
 * - import { getUserDetails } from '../services/users';
 * 
 * But existing imports will continue to work:
 * - import { getUserRoleForChild, getUserDetails } from '../services/rolePermissionService';
 */

// Import specific functions for the default export object
import { 
  getUserRoleForChild,
  getCurrentUserRoleForChild,
  isReadOnlyUser,
  getChildrenWithRoles
} from './roles/roleService';

import {
  hasPermission,
  hasCurrentUserPermission,
  getPermissionsForRole,
  getUserPermissionsForChild,
  canAddDataEntries,
  getUserDisplayInfo
} from './roles/permissionService';

import { transferOwnership } from './roles/ownershipService';

import { getUserDetails } from './users/userService';
import { populateChildTeamMembers } from './users/teamService';

import { 
  USER_ROLES,
  PERMISSIONS,
  roleHasPermission,
  getRolePermissions,
  getRoleDisplay,
  getHighestPriorityRole
} from '../constants/roles';

// Re-export all roles functionality
export * from './roles';

// Re-export all users functionality  
export * from './users';

// Re-export constants for backward compatibility
export { USER_ROLES, PERMISSIONS } from '../constants/roles';

// Export default object for backward compatibility
const rolePermissionService = {
  // Constants
  USER_ROLES,
  PERMISSIONS,
  
  // Core functions
  getUserRoleForChild,
  getCurrentUserRoleForChild,
  hasPermission,
  hasCurrentUserPermission,
  getPermissionsForRole,
  getUserPermissionsForChild,
  canAddDataEntries,
  isReadOnlyUser,
  getUserDisplayInfo,
  getChildrenWithRoles,
  transferOwnership,
  getUserDetails,
  populateChildTeamMembers,
  
  // Utility functions from constants
  roleHasPermission,
  getRolePermissions,
  getRoleDisplay,
  getHighestPriorityRole
};

export default rolePermissionService;