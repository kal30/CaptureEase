import { db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { 
  USER_ROLES, 
  PERMISSIONS, 
  ROLE_PERMISSIONS,
  ROLE_DISPLAY,
  roleHasPermission,
  getRolePermissions,
  getRoleDisplay,
  getHighestPriorityRole
} from '../constants/roles';

// Re-export constants for backward compatibility
export { USER_ROLES, PERMISSIONS };

/**
 * Get user's role for a specific child
 * CLEAN: Only new database structure - NO LEGACY CODE
 */
export const getUserRoleForChild = async (userId, childId) => {
  try {
    const childRef = doc(db, "children", childId);
    const childDoc = await getDoc(childRef);
    
    if (!childDoc.exists()) {
      throw new Error("Child not found");
    }
    
    const childData = childDoc.data();
    const users = childData.users || {};
    
    // Clean role structure - KISS approach
    if (users.care_owner === userId) {
      return USER_ROLES.CARE_OWNER;
    }
    if (users.care_partners?.includes(userId)) {
      return USER_ROLES.CARE_PARTNER;
    }
    if (users.caregivers?.includes(userId)) {
      return USER_ROLES.CAREGIVER;
    }
    if (users.therapists?.includes(userId)) {
      return USER_ROLES.THERAPIST;
    }
    
    return null; // User has no access to this child
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
};

/**
 * Get current user's role for a child
 */
export const getCurrentUserRoleForChild = async (childId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  return await getUserRoleForChild(user.uid, childId);
};

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
 * Check if user is read-only (therapist)
 */
export const isReadOnlyUser = async (userId, childId) => {
  try {
    const userRole = await getUserRoleForChild(userId, childId);
    return userRole === USER_ROLES.THERAPIST;
  } catch (error) {
    console.error("Error checking read-only status:", error);
    return false;
  }
};

/**
 * Transfer ownership from current owner to new owner
 * CLEAN: Atomic ownership transfer with validation - NO LEGACY CODE
 */
export const transferOwnership = async (childId, newOwnerId, currentOwnerId) => {
  try {
    const childRef = doc(db, "children", childId);
    const childDoc = await getDoc(childRef);
    
    if (!childDoc.exists()) {
      throw new Error("Child not found");
    }
    
    const childData = childDoc.data();
    const users = childData.users || {};
    
    // Validate current user is the care owner (STRICT)
    if (users.care_owner !== currentOwnerId) {
      throw new Error("Only the current care owner can transfer ownership");
    }
    
    // Validate new owner exists in team
    const newOwnerIsInTeam = 
      users.care_partners?.includes(newOwnerId) ||
      users.caregivers?.includes(newOwnerId) ||
      users.therapists?.includes(newOwnerId);
    
    if (!newOwnerIsInTeam) {
      throw new Error("New owner must be an existing team member");
    }
    
    // Prepare clean updates
    const updates = {
      'users.care_owner': newOwnerId,
      'users.care_partners': [...(users.care_partners || []), currentOwnerId].filter(id => id !== newOwnerId)
    };
    
    // Remove new owner from other roles
    if (users.caregivers?.includes(newOwnerId)) {
      updates['users.caregivers'] = users.caregivers.filter(id => id !== newOwnerId);
    }
    if (users.therapists?.includes(newOwnerId)) {
      updates['users.therapists'] = users.therapists.filter(id => id !== newOwnerId);
    }
    
    await updateDoc(childRef, updates);
    
    console.log(`Ownership transferred from ${currentOwnerId} to ${newOwnerId} for child ${childId}`);
    return { success: true };
    
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw error;
  }
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

/**
 * Get all children current user has access to with their roles
 * KISS: Simplified role detection with new structure
 */
export const getChildrenWithRoles = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return [];
  }
  
  try {
    const childrenSnapshot = await getDocs(collection(db, "children"));
    const childrenWithRoles = [];
    
    for (const childDoc of childrenSnapshot.docs) {
      const childData = childDoc.data();
      const childId = childDoc.id;
      
      // Get user's role for this child
      const userRole = await getUserRoleForChild(user.uid, childId);
      
      if (userRole) {
        childrenWithRoles.push({
          id: childId,
          ...childData,
          userRole,
          permissions: getRolePermissions(userRole)
        });
      }
    }
    
    return childrenWithRoles;
  } catch (error) {
    console.error("Error getting children with roles:", error);
    return [];
  }
};

// Export all functions for easy importing
export default {
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
  
  // Utility functions from constants
  roleHasPermission,
  getRolePermissions,
  getRoleDisplay,
  getHighestPriorityRole
};