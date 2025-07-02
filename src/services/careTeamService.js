import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Add a new user to the users collection
export const addUser = async (userData) => {
  const docRef = await addDoc(collection(db, "users"), userData);
  return docRef.id;
};

// Update a user's data
export const updateUser = async (userId, userData) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, userData);
};

// Delete a user
export const deleteUser = async (userId) => {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
};
