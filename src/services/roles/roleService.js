import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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
          permissions: [] // Will be populated by permissionService
        });
      }
    }
    
    return childrenWithRoles;
  } catch (error) {
    console.error("Error getting children with roles:", error);
    return [];
  }
};