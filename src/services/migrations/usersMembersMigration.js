import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

/**
 * Migration to add users.members field to children documents the current user has access to
 * This field contains all user IDs who have access to the child, enabling
 * efficient single-field queries instead of 4-way OR queries
 */
export const migrateUsersMembers = async () => {
  try {
    console.log("Starting users.members migration for accessible children...");
    
    // Import getChildren to get only children current user has access to
    const { getChildren } = await import('../childService');
    const accessibleChildren = await getChildren();
    
    console.log(`Found ${accessibleChildren.length} accessible children to migrate`);
    
    const updatePromises = [];
    let processedCount = 0;
    let updatedCount = 0;
    
    accessibleChildren.forEach((child) => {
      const users = child.users || {};
      
      // Build members array from existing role fields
      const members = [];
      
      // Add care owner
      if (users.care_owner) {
        members.push(users.care_owner);
      }
      
      // Add care partners
      if (users.care_partners && Array.isArray(users.care_partners)) {
        members.push(...users.care_partners);
      }
      
      // Add caregivers
      if (users.caregivers && Array.isArray(users.caregivers)) {
        members.push(...users.caregivers);
      }
      
      // Add therapists
      if (users.therapists && Array.isArray(users.therapists)) {
        members.push(...users.therapists);
      }
      
      // Remove duplicates and filter out null/undefined values
      const uniqueMembers = [...new Set(members.filter(id => id))];
      
      // Only update if we have members and the field doesn't already exist or is different
      if (uniqueMembers.length > 0 && 
          (!users.members || JSON.stringify(users.members.sort()) !== JSON.stringify(uniqueMembers.sort()))) {
        
        const childRef = doc(db, "children", child.id);
        const updatePromise = updateDoc(childRef, {
          "users.members": uniqueMembers,
          updatedAt: new Date()
        }).then(() => {
          updatedCount++;
          console.log(`Updated child ${child.id} with ${uniqueMembers.length} members`);
        });
        
        updatePromises.push(updatePromise);
      }
      
      processedCount++;
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    console.log(`Migration completed: processed ${processedCount} children, updated ${updatedCount} children`);
    
    return {
      processed: processedCount,
      updated: updatedCount,
      success: true
    };
    
  } catch (error) {
    console.error("Error during users.members migration:", error);
    throw error;
  }
};

/**
 * Helper function to maintain users.members field when updating user roles
 * Call this whenever users.care_owner, users.care_partners, users.caregivers, or users.therapists change
 */
export const updateMembersField = (users) => {
  const members = [];
  
  // Add care owner
  if (users.care_owner) {
    members.push(users.care_owner);
  }
  
  // Add care partners
  if (users.care_partners && Array.isArray(users.care_partners)) {
    members.push(...users.care_partners);
  }
  
  // Add caregivers
  if (users.caregivers && Array.isArray(users.caregivers)) {
    members.push(...users.caregivers);
  }
  
  // Add therapists
  if (users.therapists && Array.isArray(users.therapists)) {
    members.push(...users.therapists);
  }
  
  // Remove duplicates and filter out null/undefined values
  return [...new Set(members.filter(id => id))];
};