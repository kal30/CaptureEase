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

// Fetch all children for the current user
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
    // Check if the current user is the parent, a caregiver, or a therapist
    if (
      data.users.parent === user.uid ||
      data.users.caregivers?.includes(user.uid) ||
      data.users.therapists?.includes(user.uid)
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

// Add a new child
export const addChild = async (childData) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  const docRef = await addDoc(collection(db, "children"), {
    ...childData,
    users: {
      parent: user.uid,
      caregivers: [],
      therapists: [],
    },
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
  const childRef = doc(db, "children", childId);
  await updateDoc(childRef, {
    "users.therapists": arrayUnion(therapistId),
  });
};

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