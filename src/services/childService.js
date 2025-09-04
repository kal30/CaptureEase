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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { USER_ROLES } from '../constants/roles';

// Fetch all children for the current user - CLEAN VERSION
export const getChildren = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const snapshot = await getDocs(collection(db, "children"));
  const children = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const users = data.users || {};
    
    // CLEAN: Check new database structure only
    if (
      users.care_owner === user.uid ||
      users.care_partners?.includes(user.uid) ||
      users.caregivers?.includes(user.uid) ||
      users.therapists?.includes(user.uid)
    ) {
      children.push({
        id: doc.id,
        ...data,
      });
    }
  });
  return children;
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

// Add a new child - CLEAN VERSION
export const addChild = async (childData) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  const docRef = await addDoc(collection(db, "children"), {
    ...childData,
    users: {
      care_owner: user.uid,        // User becomes Care Owner
      care_partners: [],           // Empty array for Care Partners
      caregivers: [],              // Empty array for Caregivers
      therapists: [],              // Empty array for Therapists
    },
    settings: {
      allow_therapist_family_logs: false  // Default privacy setting
    }
  });
  return docRef.id;
};

// Assign a caregiver to a child
export const assignCaregiver = async (childId, caregiverId) => {
  const childRef = doc(db, "children", childId);
  await updateDoc(childRef, {
    "users.caregivers": arrayUnion(caregiverId),
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
    
    await updateDoc(childRef, {
      "users.therapists": arrayUnion(therapistId),
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
    
    await updateDoc(childRef, {
      "users.care_partners": arrayUnion(carePartnerId),
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
  await updateDoc(childRef, {
    "users.caregivers": arrayRemove(caregiverId),
  });
};

// Unassign a therapist from a child
export const unassignTherapist = async (childId, therapistId) => {
  const childRef = doc(db, "children", childId);
  await updateDoc(childRef, {
    "users.therapists": arrayRemove(therapistId),
  });
};