import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Transfer ownership from current owner to new owner
 * CLEAN: Atomic ownership transfer with validation - NO LEGACY CODE
 */
export const transferOwnership = async (childId, newOwnerId, currentOwnerId) => {
  try {
    const childRef = doc(db, "children", childId);
    const childDoc = await getDoc(childRef);
    
    if (!childDoc.exists()) {
      throw new Error("Child not found");
    }
    
    const childData = childDoc.data();
    const users = childData.users || {};
    
    // Validate current user is the care owner (STRICT)
    if (users.care_owner !== currentOwnerId) {
      throw new Error("Only the current care owner can transfer ownership");
    }
    
    // Validate new owner exists in team
    const newOwnerIsInTeam = 
      users.care_partners?.includes(newOwnerId) ||
      users.caregivers?.includes(newOwnerId) ||
      users.therapists?.includes(newOwnerId);
    
    if (!newOwnerIsInTeam) {
      throw new Error("New owner must be an existing team member");
    }
    
    // Prepare clean updates
    const updates = {
      'users.care_owner': newOwnerId,
      'users.care_partners': [...(users.care_partners || []), currentOwnerId].filter(id => id !== newOwnerId)
    };
    
    // Remove new owner from other roles
    if (users.caregivers?.includes(newOwnerId)) {
      updates['users.caregivers'] = users.caregivers.filter(id => id !== newOwnerId);
    }
    if (users.therapists?.includes(newOwnerId)) {
      updates['users.therapists'] = users.therapists.filter(id => id !== newOwnerId);
    }
    
    await updateDoc(childRef, updates);
    
    console.log(`Ownership transferred from ${currentOwnerId} to ${newOwnerId} for child ${childId}`);
    return { success: true };
    
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw error;
  }
};