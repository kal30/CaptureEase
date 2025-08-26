import { db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// User role definitions
export const USER_ROLES = {
  PRIMARY_PARENT: 'primary_parent',        // Original account creator (mother)
  CO_PARENT: 'co_parent',                  // Husband - near full access
  FAMILY_MEMBER: 'family_member',          // Aunt, Grandma - data entry only
  CAREGIVER: 'caregiver',                  // Babysitter, Nanny - restricted access
  THERAPIST: 'therapist'                   // Professional - read only
};

// Permission definitions
export const PERMISSIONS = {
  // Data entry permissions
  ADD_DAILY_ENTRIES: 'add_daily_entries',
  ADD_DETAILED_ENTRIES: 'add_detailed_entries',
  ADD_MEDICAL_ENTRIES: 'add_medical_entries',
  EDIT_CHILD_PROFILE: 'edit_child_profile',
  
  // Administrative permissions
  ADD_CHILDREN: 'add_children',
  EDIT_CHILDREN: 'edit_children',
  DELETE_CHILDREN: 'delete_children',
  INVITE_FAMILY: 'invite_family',
  INVITE_CAREGIVERS: 'invite_caregivers',
  INVITE_THERAPISTS: 'invite_therapists',
  REMOVE_TEAM_MEMBERS: 'remove_team_members',
  MANAGE_CHILD: 'manage_child',
  
  // View permissions
  VIEW_TIMELINE: 'view_timeline',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_MEDICAL_INFO: 'view_medical_info',
  EXPORT_DATA: 'export_data'
};

// Role-Permission Matrix
const ROLE_PERMISSIONS = {
  [USER_ROLES.PRIMARY_PARENT]: [
    // Full administrative access - original account creator
    PERMISSIONS.ADD_CHILDREN,
    PERMISSIONS.EDIT_CHILDREN, 
    PERMISSIONS.DELETE_CHILDREN,
    PERMISSIONS.ADD_DAILY_ENTRIES,
    PERMISSIONS.ADD_DETAILED_ENTRIES,
    PERMISSIONS.ADD_MEDICAL_ENTRIES,
    PERMISSIONS.EDIT_CHILD_PROFILE,
    PERMISSIONS.INVITE_FAMILY,
    PERMISSIONS.INVITE_CAREGIVERS,
    PERMISSIONS.INVITE_THERAPISTS,
    PERMISSIONS.REMOVE_TEAM_MEMBERS,
    PERMISSIONS.MANAGE_CHILD,
    PERMISSIONS.VIEW_TIMELINE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO,
    PERMISSIONS.EXPORT_DATA
  ],
  [USER_ROLES.CO_PARENT]: [
    // Nearly full access - spouse/partner
    PERMISSIONS.ADD_CHILDREN,
    PERMISSIONS.EDIT_CHILDREN,
    // Note: No DELETE_CHILDREN - only primary parent can delete
    PERMISSIONS.ADD_DAILY_ENTRIES,
    PERMISSIONS.ADD_DETAILED_ENTRIES,
    PERMISSIONS.ADD_MEDICAL_ENTRIES,
    PERMISSIONS.EDIT_CHILD_PROFILE,
    PERMISSIONS.INVITE_FAMILY,
    PERMISSIONS.INVITE_CAREGIVERS,
    PERMISSIONS.INVITE_THERAPISTS,
    PERMISSIONS.MANAGE_CHILD,
    PERMISSIONS.VIEW_TIMELINE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO,
    PERMISSIONS.EXPORT_DATA
  ],
  [USER_ROLES.FAMILY_MEMBER]: [
    // Data entry only - aunt, grandma, etc.
    PERMISSIONS.ADD_DAILY_ENTRIES,
    PERMISSIONS.ADD_DETAILED_ENTRIES,
    PERMISSIONS.VIEW_TIMELINE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO, // Family gets full view access
    PERMISSIONS.EXPORT_DATA
  ],
  [USER_ROLES.CAREGIVER]: [
    // Restricted data entry - babysitter, nanny
    PERMISSIONS.ADD_DAILY_ENTRIES,
    PERMISSIONS.VIEW_TIMELINE,
    // Note: Medical info access controlled by parent settings
    // Note: Cannot invite others
  ],
  [USER_ROLES.THERAPIST]: [
    // Read-only focused - provide insights
    PERMISSIONS.VIEW_TIMELINE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO,
    PERMISSIONS.EXPORT_DATA
  ]
};

/**
 * Get user's role for a specific child
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
    
    // Determine role based on child's user assignments
    if (users.parent === userId) {
      return USER_ROLES.PRIMARY_PARENT;
    } else if (users.co_parents?.includes(userId)) {
      return USER_ROLES.CO_PARENT;
    } else if (users.family_members?.includes(userId)) {
      return USER_ROLES.FAMILY_MEMBER;
    } else if (users.caregivers?.includes(userId)) {
      return USER_ROLES.CAREGIVER;
    } else if (users.therapists?.includes(userId)) {
      return USER_ROLES.THERAPIST;
    }
    
    return null; // User has no role for this child
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
 */
export const hasPermission = async (userId, childId, permission) => {
  try {
    const userRole = await getUserRoleForChild(userId, childId);
    
    if (!userRole) {
      return false;
    }
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
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
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

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
 * Check if user can add data entries (shorthand for common check)
 */
export const canAddDataEntries = async (userId, childId) => {
  return await hasPermission(userId, childId, PERMISSIONS.ADD_DAILY_ENTRIES);
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
 * Get user's display info for UI
 */
export const getUserDisplayInfo = async (userId, childId) => {
  try {
    const userRole = await getUserRoleForChild(userId, childId);
    
    const roleDisplayInfo = {
      [USER_ROLES.PRIMARY_PARENT]: {
        badgeText: "Primary Parent",
        badgeColor: "#10B981", // Green
        canAddData: true,
        description: "Full access - can manage everything"
      },
      [USER_ROLES.CO_PARENT]: {
        badgeText: "Co-Parent",
        badgeColor: "#10B981", // Green
        canAddData: true,
        description: "Nearly full access - can manage child and team"
      },
      [USER_ROLES.FAMILY_MEMBER]: {
        badgeText: "Family Member",
        badgeColor: "#10B981", // Green
        canAddData: true,
        description: "Can track daily progress and view all information"
      },
      [USER_ROLES.CAREGIVER]: {
        badgeText: "Can Add Data", 
        badgeColor: "#10B981", // Green
        canAddData: true,
        description: "Can track daily progress and add entries"
      },
      [USER_ROLES.THERAPIST]: {
        badgeText: "View Only",
        badgeColor: "#94A3B8", // Gray 
        canAddData: false,
        description: "Can view progress and provide guidance"
      }
    };
    
    return roleDisplayInfo[userRole] || {
      badgeText: "No Access",
      badgeColor: "#EF4444", // Red
      canAddData: false,
      description: "No access to this child"
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
 */
export const getChildrenWithRoles = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  console.log('getChildrenWithRoles called for user:', user?.uid);
  
  if (!user) {
    console.log('getChildrenWithRoles: No authenticated user');
    return [];
  }
  
  try {
    // Get all children (we'll filter by access)
    const childrenSnapshot = await getDocs(collection(db, "children"));
    const childrenWithRoles = [];
    
    console.log('getChildrenWithRoles: Found', childrenSnapshot.docs.length, 'total children');
    
    for (const childDoc of childrenSnapshot.docs) {
      const childData = childDoc.data();
      const childId = childDoc.id;
      const users = childData.users || {};
      
      console.log(`getChildrenWithRoles: Checking child ${childData.name} (${childId})`);
      console.log('getChildrenWithRoles: Child users:', users);
      
      // Check all possible roles and select highest permission level
      const userRoles = [];
      if (users.parent === user.uid) {
        userRoles.push(USER_ROLES.PRIMARY_PARENT);
      }
      if (users.co_parents?.includes(user.uid)) {
        userRoles.push(USER_ROLES.CO_PARENT);
      }
      if (users.family_members?.includes(user.uid)) {
        userRoles.push(USER_ROLES.FAMILY_MEMBER);
      }
      if (users.caregivers?.includes(user.uid)) {
        userRoles.push(USER_ROLES.CAREGIVER);
      }
      if (users.therapists?.includes(user.uid)) {
        userRoles.push(USER_ROLES.THERAPIST);
      }
      
      // Role hierarchy (highest to lowest permissions)
      const roleHierarchy = [
        USER_ROLES.PRIMARY_PARENT,
        USER_ROLES.CO_PARENT, 
        USER_ROLES.FAMILY_MEMBER,
        USER_ROLES.CAREGIVER,
        USER_ROLES.THERAPIST
      ];
      
      // Find the highest permission role
      let userRole = null;
      for (const role of roleHierarchy) {
        if (userRoles.includes(role)) {
          userRole = role;
          break;
        }
      }
      
      if (userRoles.length > 0) {
        console.log('getChildrenWithRoles: User has roles:', userRoles, '-> Using highest:', userRole);
      } else {
        console.log('getChildrenWithRoles: User has no role for this child');
      }
      
      if (userRole) {
        console.log(`getChildrenWithRoles: Adding child ${childData.name} with role ${userRole}`);
        childrenWithRoles.push({
          id: childId,
          ...childData,
          userRole,
          permissions: getPermissionsForRole(userRole)
        });
      }
    }
    
    console.log('getChildrenWithRoles: Final result:', childrenWithRoles.length, 'children with access');
    return childrenWithRoles;
  } catch (error) {
    console.error("Error getting children with roles:", error);
    return [];
  }
};

export default {
  USER_ROLES,
  PERMISSIONS,
  getUserRoleForChild,
  getCurrentUserRoleForChild,
  hasPermission,
  hasCurrentUserPermission,
  getPermissionsForRole,
  getUserPermissionsForChild,
  canAddDataEntries,
  isReadOnlyUser,
  getUserDisplayInfo,
  getChildrenWithRoles
};