import { db } from "./firebase"; // Import initialized Firestore
import { collection, getDocs, query, where } from "firebase/firestore";

// Fetch all users with a specific role
export const getUsersByRole = async (role) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", role));
  const snapshot = await getDocs(q);
  const users = [];
  snapshot.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  return users;
};
