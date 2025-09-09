import { db } from "./firebase"; // Import initialized Firestore
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  or,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { USER_ROLES } from '../constants/roles';
import { updateMembersField } from './migrations/usersMembersMigration';

// Fetch all children for the current user - INCLUDES ALL ROLES (owner, partner, caregiver, therapist)
export const getChildren = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.log("❌ No authenticated user");
    return [];
  }

  try {
    // Use members array for fast lookup (performance optimized)
    const childrenQuery = query(
      collection(db, "children"),
      where("users.members", "array-contains", user.uid)
    );

    const snapshot = await getDocs(childrenQuery);
    const children = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      children.push({
        id: doc.id,
        ...data,
      });
    });
    
    return children;
  } catch (error) {
    console.error("❌ Error in getChildren:", error);
    
    // Fallback to individual role queries if members array not available
    return await getChildrenFallback();
  }
};

// Helper function to determine user's role for a child
const getUserRole = (users, userId) => {
  if (users.care_owner === userId) return 'care_owner';
  if (users.care_partners?.includes(userId)) return 'care_partner';
  if (users.caregivers?.includes(userId)) return 'caregiver';
  if (users.therapists?.includes(userId)) return 'therapist';
  return 'unknown';
};

// Fallback function for older documents without members array
const getChildrenFallback = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  try {
    console.log(`🔄 Using fallback query for user ${user.uid}`);
    
    // Query for each role separately and combine results
    const queries = [
      query(collection(db, "children"), where("users.care_owner", "==", user.uid)),
      query(collection(db, "children"), where("users.care_partners", "array-contains", user.uid)),
      query(collection(db, "children"), where("users.caregivers", "array-contains", user.uid)),
      query(collection(db, "children"), where("users.therapists", "array-contains", user.uid))
    ];

    const allResults = await Promise.all(queries.map(q => getDocs(q)));
    const childrenMap = new Map();

    allResults.forEach(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!childrenMap.has(doc.id)) {
          childrenMap.set(doc.id, {
            id: doc.id,
            ...data,
          });
        }
      });
    });

    const children = Array.from(childrenMap.values());
    return children;
  } catch (error) {
    console.error("❌ Error in fallback query:", error);
    return [];
  }
};

export const fetchChildName = async (childId) => {
  const childRef = doc(db, "children", childId);
  const childSnap = await getDoc(childRef);

  if (childSnap.exists()) {
    return childSnap.data().name; // Return the child's name
  } else {
    throw new Error("No such document!"); // Handle the case where the document doesn't exist
  }
};

// Add a new child - CLEAN VERSION with users.members optimization
export const addChild = async (childData) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  const users = {
    care_owner: user.uid,        // User becomes Care Owner
    care_partners: [],           // Empty array for Care Partners
    caregivers: [],              // Empty array for Caregivers
    therapists: [],              // Empty array for Therapists
    members: [user.uid]          // Optimized members array
  };

  const docRef = await addDoc(collection(db, "children"), {
    ...childData,
    users,
    // Required immutable metadata for security rules
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    status: 'active',
    // Audit fields
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
    settings: {
      allow_therapist_family_logs: false  // Default privacy setting
    }
  });
  return docRef.id;
};

// Assign a caregiver to a child
export const assignCaregiver = async (childId, caregiverId) => {
  const childRef = doc(db, "children", childId);
  
  // Get current data to update members field
  const childDoc = await getDoc(childRef);
  const childData = childDoc.data();
  const currentUsers = childData.users || {};
  
  // Update caregivers and members
  const updatedUsers = {
    ...currentUsers,
    caregivers: [...(currentUsers.caregivers || []), caregiverId]
  };
  updatedUsers.members = updateMembersField(updatedUsers);
  
  await updateDoc(childRef, {
    "users.caregivers": arrayUnion(caregiverId),
    "users.members": updatedUsers.members
  });
};

// Assign a therapist to a child
export const assignTherapist = async (childId, therapistId) => {
  console.log('assignTherapist called:', { childId, therapistId });
  try {
    const childRef = doc(db, "children", childId);
    
    // Check the document before update
    const childDoc = await getDoc(childRef);
    if (!childDoc.exists()) {
      throw new Error(`Child document ${childId} not found`);
    }
    
    const beforeData = childDoc.data();
    console.log('assignTherapist - before update:', {
      childName: beforeData.name,
      currentTherapists: beforeData.users?.therapists || []
    });
    
    // Update therapists and members
    const currentUsers = beforeData.users || {};
    const updatedUsers = {
      ...currentUsers,
      therapists: [...(currentUsers.therapists || []), therapistId]
    };
    updatedUsers.members = updateMembersField(updatedUsers);
    
    await updateDoc(childRef, {
      "users.therapists": arrayUnion(therapistId),
      "users.members": updatedUsers.members
    });
    
    // Check the document after update
    const updatedDoc = await getDoc(childRef);
    const afterData = updatedDoc.data();
    console.log('assignTherapist - after update:', {
      childName: afterData.name,
      updatedTherapists: afterData.users?.therapists || []
    });
    
    console.log('assignTherapist success: therapist added to child');
  } catch (error) {
    console.error('assignTherapist error:', error);
    throw error;
  }
};

// Assign a Care Partner to a child - CLEAN VERSION
export const assignCarePartner = async (childId, carePartnerId) => {
  console.log('assignCarePartner called:', { childId, carePartnerId });
  try {
    const childRef = doc(db, "children", childId);
    
    // Check document exists
    const childDoc = await getDoc(childRef);
    if (!childDoc.exists()) {
      throw new Error(`Child document ${childId} not found`);
    }
    
    // Update care partners and members
    const currentUsers = childDoc.data().users || {};
    const updatedUsers = {
      ...currentUsers,
      care_partners: [...(currentUsers.care_partners || []), carePartnerId]
    };
    updatedUsers.members = updateMembersField(updatedUsers);
    
    await updateDoc(childRef, {
      "users.care_partners": arrayUnion(carePartnerId),
      "users.members": updatedUsers.members
    });
    
    console.log('assignCarePartner success: care partner added to child');
  } catch (error) {
    console.error('assignCarePartner error:', error);
    throw error;
  }
};

// No legacy functions - clean system only

// Unassign a caregiver from a child
export const unassignCaregiver = async (childId, caregiverId) => {
  const childRef = doc(db, "children", childId);
  
  // Get current data to update members field
  const childDoc = await getDoc(childRef);
  const childData = childDoc.data();
  const currentUsers = childData.users || {};
  
  // Update caregivers and members
  const updatedUsers = {
    ...currentUsers,
    caregivers: (currentUsers.caregivers || []).filter(id => id !== caregiverId)
  };
  updatedUsers.members = updateMembersField(updatedUsers);
  
  await updateDoc(childRef, {
    "users.caregivers": arrayRemove(caregiverId),
    "users.members": updatedUsers.members
  });
};

// Unassign a therapist from a child
export const unassignTherapist = async (childId, therapistId) => {
  const childRef = doc(db, "children", childId);
  
  // Get current data to update members field
  const childDoc = await getDoc(childRef);
  const childData = childDoc.data();
  const currentUsers = childData.users || {};
  
  // Update therapists and members
  const updatedUsers = {
    ...currentUsers,
    therapists: (currentUsers.therapists || []).filter(id => id !== therapistId)
  };
  updatedUsers.members = updateMembersField(updatedUsers);
  
  await updateDoc(childRef, {
    "users.therapists": arrayRemove(therapistId),
    "users.members": updatedUsers.members
  });
};

// Archive a child instead of deleting (preserves data for audit/compliance)
export const archiveChild = async (childId) => {
  console.log('archiveChild called:', { childId });
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to archive children");
    }

    const childRef = doc(db, "children", childId);
    
    // Check if child exists and user is owner
    const childDoc = await getDoc(childRef);
    if (!childDoc.exists()) {
      throw new Error(`Child document ${childId} not found`);
    }
    
    const childData = childDoc.data();
    if (childData.users.care_owner !== user.uid) {
      throw new Error("Only the care owner can archive a child");
    }
    
    if (childData.status === 'archived') {
      throw new Error("Child is already archived");
    }
    
    console.log('archiveChild - before archive:', {
      childName: childData.name,
      currentStatus: childData.status
    });
    
    // Archive the child (soft delete)
    await updateDoc(childRef, {
      status: 'archived',
      archivedAt: serverTimestamp(),
      archivedBy: user.uid,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
    
    console.log('archiveChild success: child archived');
    return { success: true, message: `Child "${childData.name}" has been archived` };
  } catch (error) {
    console.error('archiveChild error:', error);
    throw error;
  }
};

// Get active children only (excludes archived) - INCLUDES ALL ROLES
export const getActiveChildren = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.log("❌ No authenticated user");
    return [];
  }

  try {
    
    // Use members array for fast lookup + filter for active status
    const childrenQuery = query(
      collection(db, "children"),
      where("users.members", "array-contains", user.uid),
      where("status", "==", "active")  // Only active children
    );

    const snapshot = await getDocs(childrenQuery);
    const children = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Found active child:`, {
        id: doc.id,
        name: data.name,
        status: data.status,
        userRole: getUserRole(data.users, user.uid)
      });
      children.push({
        id: doc.id,
        ...data,
      });
    });
    
    return children;
  } catch (error) {
    console.error("❌ Error in getActiveChildren:", error);
    
    // Fallback: get all children and filter for active status
    const allChildren = await getChildren();
    const activeChildren = allChildren.filter(child => child.status === 'active');
    return activeChildren;
  }
};

// Get archived children for audit/retrieval purposes
export const getArchivedChildren = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.log("❌ No authenticated user");
    return [];
  }

  try {
    const childrenQuery = query(
      collection(db, "children"),
      where("users.care_owner", "==", user.uid),
      where("status", "==", "archived")  // Only archived children
    );

    const snapshot = await getDocs(childrenQuery);
    const children = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      children.push({
        id: doc.id,
        ...data,
      });
    });
    
    return children;
  } catch (error) {
    console.error("❌ Error in getArchivedChildren:", error);
    return [];
  }
};

