import { getAuth } from "firebase/auth";
import { 
  PERMISSIONS, 
  roleHasPermission,
  getRolePermissions,
  getRoleDisplay
} from '../../constants/roles';
import { getUserRoleForChild } from './roleService';

/**
 * Check if user has specific permission for a child
 * KISS: Use centralized permission checker
 */
export const hasPermission = async (userId, childId, permission) => {
  try {
    const userRole = await getUserRoleForChild(userId, childId);
    return userRole ? roleHasPermission(userRole, permission) : false;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
};

/**
 * Check if current user has specific permission for a child
 */
export const hasCurrentUserPermission = async (childId, permission) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }
  
  return await hasPermission(user.uid, childId, permission);
};

/**
 * Get all permissions for a user role
 * KISS: Use centralized function
 */
export const getPermissionsForRole = getRolePermissions;

/**
 * Get user's permissions for a child
 */
export const getUserPermissionsForChild = async (userId, childId) => {
  try {
    const userRole = await getUserRoleForChild(userId, childId);
    return getPermissionsForRole(userRole);
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
};

/**
 * Check if user can add data entries
 * KISS: Use new permission constant
 */
export const canAddDataEntries = async (userId, childId) => {
  return await hasPermission(userId, childId, PERMISSIONS.ADD_DAILY_LOGS);
};

/**
 * Get user's display info for UI
 * KISS: Use centralized role display with computed properties
 */
export const getUserDisplayInfo = async (userId, childId) => {
  try {
    const userRole = await getUserRoleForChild(userId, childId);
    
    if (!userRole) {
      return {
        badgeText: "No Access",
        badgeColor: "#EF4444",
        canAddData: false,
        description: "No access to this child"
      };
    }
    
    const roleDisplay = getRoleDisplay(userRole);
    return {
      badgeText: roleDisplay.badge,
      badgeColor: roleDisplay.color,
      canAddData: roleHasPermission(userRole, PERMISSIONS.ADD_DAILY_LOGS),
      description: roleDisplay.description,
      ...roleDisplay
    };
  } catch (error) {
    console.error("Error getting user display info:", error);
    return {
      badgeText: "Error",
      badgeColor: "#EF4444",
      canAddData: false,
      description: "Unable to determine access"
    };
  }
};