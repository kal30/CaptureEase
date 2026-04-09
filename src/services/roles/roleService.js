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

    const childrenSnapshot = await getDocs(childrenQuery).catch((error) => {
      console.warn("Members query failed, falling back to legacy role lookups:", error);
      return { docs: [] };
    });

    console.log(`📊 Members query found: ${childrenSnapshot.docs.length} children`)

    const childrenMap = new Map();
    for (const childDoc of childrenSnapshot.docs) {
      const childResult = await buildRoleResult(childDoc, user.uid);
      if (childResult) {
        childrenMap.set(childResult.id, childResult);
      }
    }

    // Legacy fallback: older child docs may not have users.members yet.
    // Merge role-based queries so every accessible child still appears.
    const fallbackQueries = [
      query(collection(db, "children"), where("users.care_owner", "==", user.uid), where("status", "==", "active")),
      query(collection(db, "children"), where("users.care_partners", "array-contains", user.uid), where("status", "==", "active")),
      query(collection(db, "children"), where("users.caregivers", "array-contains", user.uid), where("status", "==", "active")),
      query(collection(db, "children"), where("users.therapists", "array-contains", user.uid), where("status", "==", "active")),
    ];

    const fallbackSnapshots = await Promise.allSettled(
      fallbackQueries.map((q) => getDocs(q))
    );

    for (const result of fallbackSnapshots) {
      if (result.status !== 'fulfilled') {
        console.warn("Role fallback query failed:", result.reason);
        continue;
      }

      for (const childDoc of result.value.docs) {
        if (childrenMap.has(childDoc.id)) {
          continue;
        }

        const childResult = await buildRoleResult(childDoc, user.uid);
        if (childResult) {
          childrenMap.set(childResult.id, childResult);
        }
      }
    }

    if (childrenMap.size === 0) {
      // Last-resort fallback: load all accessible children, then resolve roles per child.
      const { getChildren } = await import('../childService');
      const accessibleChildren = await getChildren();
      for (const child of accessibleChildren.filter((candidate) => candidate?.status === 'active' || !candidate?.status)) {
        if (!child?.id || childrenMap.has(child.id)) {
          continue;
        }

        const childDoc = await getDoc(doc(db, "children", child.id));
        if (!childDoc.exists()) {
          continue;
        }

        const childResult = await buildRoleResult(childDoc, user.uid);
        if (childResult) {
          childrenMap.set(childResult.id, childResult);
        }
      }
    }

    return Array.from(childrenMap.values());
  } catch (error) {
    console.error("Error getting children with roles:", error);
    return [];
  }
};
