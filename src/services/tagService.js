import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase"; // Adjust the path as per your structure

// Fetch tags for a specific child
export const fetchTags = async (childId) => {
  try {
    const tagCollectionRef = collection(db, "children", childId, "tags");
    const tagSnapshot = await getDocs(tagCollectionRef);
    const tags = tagSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

// Add a new tag for a specific child
export const addTag = async (childId, tagName) => {
  try {
    const tagCollectionRef = collection(db, "children", childId, "tags");

    // Check if the tag already exists
    const q = query(tagCollectionRef, where("name", "==", tagName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no matching tag exists, add it
      await addDoc(tagCollectionRef, { name: tagName });
      console.log("Tag added to Firestore:", tagName); // Log added tag
    } else {
      console.log("Tag already exists:", tagName);
    }
  } catch (error) {
    console.error("Error adding tag:", error);
  }
};

// Delete a tag for a specific child
export const deleteTag = async (childId, tagId) => {
  try {
    const tagDocRef = doc(db, "children", childId, "tags", tagId);
    await deleteDoc(tagDocRef);
  } catch (error) {
    console.error("Error deleting tag:", error);
  }
};
