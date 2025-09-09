import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Fetch user details by UID - SIMPLIFIED
 * Handles both user objects and user ID strings
 */
export const getUserDetails = async (userIdOrObject) => {
  try {
    if (!userIdOrObject) {
      return {
        uid: userIdOrObject,
        name: 'Unknown User',
        displayName: 'Unknown User',
        email: '',
        photoURL: null
      };
    }

    // Handle case where we receive a user object instead of just ID
    if (typeof userIdOrObject === 'object' && userIdOrObject.uid) {
      const userData = userIdOrObject;
      
      const name = userData.displayName || userData.name || userData.firstName || 
                  (userData.email ? userData.email.split('@')[0] : null) || 'Unknown User';
      
      return {
        uid: userData.uid,
        name: name,
        displayName: name,
        email: userData.email || '',
        photoURL: userData.photoURL || null
      };
    }

    // Handle regular string userId
    const userId = String(userIdOrObject);

    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (!userData) {
        return {
          uid: userId,
          name: 'Unknown User',
          displayName: 'Unknown User',
          email: '',
          photoURL: null
        };
      }
      
      const name = userData.displayName || userData.name || userData.firstName || 
                  (userData.email ? userData.email.split('@')[0] : null) || 'Unknown User';
      
      return {
        uid: userId,
        name: name,
        displayName: name,
        email: userData.email || '',
        photoURL: userData.photoURL || null
      };
    } else {
      return {
        uid: userId,
        name: 'Unknown User',
        displayName: 'Unknown User',
        email: '',
        photoURL: null
      };
    }
  } catch (error) {
    console.error('Error getting user details:', error);
    
    return {
      uid: typeof userIdOrObject === 'object' ? userIdOrObject.uid : userIdOrObject,
      name: 'Unknown User',
      displayName: 'Unknown User',
      email: '',
      photoURL: null
    };
  }
};