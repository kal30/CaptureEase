import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { USER_ROLES } from '../../constants/roles';

const buildRoleResult = async (childDoc, userId) => {
  const childData = childDoc.data();
  const childId = childDoc.id;

  const userRole = await getUserRoleForChild(userId, childId);
  if (!userRole) {
    return null;
  }

  const { getRolePermissions } = await import('../../constants/roles');
  const permissions = getRolePermissions(userRole);

  return {
    id: childId,
    ...childData,
    userRole,
    permissions,
  };
};

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
 * Get all children current user has access to with their roles
 * OPTIMIZED: Uses users.members field for efficient single-field query.
 * Legacy role-array fallbacks were removed because they cause permission noise
 * on the current rules/data shape and are no longer needed for active children.
 */
export const getChildrenWithRoles = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return [];
  }
  
  try {
    // Query only active children where current user is a member
    const childrenQuery = query(
      collection(db, "children"),
      where("users.members", "array-contains", user.uid),
      where("status", "==", "active")
    );

    const childrenSnapshot = await getDocs(childrenQuery);

    console.log(`📊 Members query found: ${childrenSnapshot.docs.length} children`)

    const childrenMap = new Map();
    for (const childDoc of childrenSnapshot.docs) {
      const childResult = await buildRoleResult(childDoc, user.uid);
      if (childResult) {
        childrenMap.set(childResult.id, childResult);
      }
    }

    return Array.from(childrenMap.values());
  } catch (error) {
    console.error("Error getting children with roles:", error);
    return [];
  }
};
