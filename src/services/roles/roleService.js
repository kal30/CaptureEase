import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where, or } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { USER_ROLES } from '../../constants/roles';

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
 * OPTIMIZED: Uses users.members field for efficient single-field query with OR fallback
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
    
    const childrenWithRoles = [];
    
    for (const childDoc of childrenSnapshot.docs) {
      const childData = childDoc.data();
      const childId = childDoc.id;
      
      // Get user's role for this child (we know they have access since we queried for it)
      const userRole = await getUserRoleForChild(user.uid, childId);
      
      if (userRole) {
        // Get permissions for this role
        const { getRolePermissions } = await import('../../constants/roles');
        const permissions = getRolePermissions(userRole);
        
        childrenWithRoles.push({
          id: childId,
          ...childData,
          userRole,
          permissions
        });
      }
    }
    
    return childrenWithRoles;
  } catch (error) {
    console.error("Error getting children with roles:", error);
    return [];
  }
};

// Removed legacy fallback: always query via users.members + status
