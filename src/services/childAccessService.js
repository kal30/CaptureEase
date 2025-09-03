/**
 * Child Access Service
 * Manages care team access and permissions for child-specific features
 */

import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get care team members for a specific child
 * Returns users who have access to this child with their roles
 * 
 * @param {string} childId - Child ID to get care team for
 * @returns {Promise<Array>} Array of care team members with user info and roles
 */
export const getChildCareTeam = async (childId) => {
  try {
    if (!childId) {
      throw new Error('Child ID is required');
    }

    // Get all access records for this child
    const accessQuery = query(
      collection(db, 'child_access'),
      where('childId', '==', childId)
    );

    const accessSnapshot = await getDocs(accessQuery);
    const careTeamMembers = [];

    // Fetch user details for each access record
    for (const accessDoc of accessSnapshot.docs) {
      const accessData = accessDoc.data();
      const { userId, role, permissions } = accessData;

      try {
        // Get user profile information
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          careTeamMembers.push({
            userId,
            role,
            permissions,
            displayName: userData.displayName || userData.name || 'Unknown User',
            email: userData.email || '',
            photoURL: userData.photoURL || null,
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen || null
          });
        } else {
          console.warn(`User document not found for userId: ${userId}`);
        }
      } catch (error) {
        console.warn(`Error fetching user ${userId}:`, error);
      }
    }

    console.log(`📋 Found ${careTeamMembers.length} care team members for child ${childId}`);
    return careTeamMembers;

  } catch (error) {
    console.error('Error getting child care team:', error);
    throw error;
  }
};

/**
 * Get all approved team members across all children for a user
 * Returns unique users who have access to any of the user's children
 * 
 * @param {Array} userChildIds - Array of child IDs the user has access to
 * @returns {Promise<Array>} Array of all team members across all children
 */
export const getAllApprovedTeamMembers = async (userChildIds) => {
  try {
    if (!userChildIds || userChildIds.length === 0) {
      return [];
    }

    const allTeamMembers = new Map(); // Use Map to avoid duplicates

    // Get care team for each child
    for (const childId of userChildIds) {
      try {
        const careTeam = await getChildCareTeam(childId);
        
        // Add each team member to the map (key = userId)
        careTeam.forEach(member => {
          if (!allTeamMembers.has(member.userId)) {
            // Add child context to track which children this member has access to
            allTeamMembers.set(member.userId, {
              ...member,
              childAccess: [{ childId, role: member.role }]
            });
          } else {
            // Add this child to existing member's access list
            const existing = allTeamMembers.get(member.userId);
            existing.childAccess.push({ childId, role: member.role });
          }
        });
      } catch (error) {
        console.warn(`Error getting care team for child ${childId}:`, error);
      }
    }

    const uniqueTeamMembers = Array.from(allTeamMembers.values());
    console.log(`👥 Found ${uniqueTeamMembers.length} unique team members across all children`);
    
    return uniqueTeamMembers;

  } catch (error) {
    console.error('Error getting all approved team members:', error);
    throw error;
  }
};

/**
 * Check if a user has access to message about a specific child
 * 
 * @param {string} userId - User ID to check
 * @param {string} childId - Child ID to check access for
 * @returns {Promise<boolean>} True if user has access
 */
export const canUserMessageAboutChild = async (userId, childId) => {
  try {
    const accessQuery = query(
      collection(db, 'child_access'),
      where('childId', '==', childId),
      where('userId', '==', userId)
    );

    const accessSnapshot = await getDocs(accessQuery);
    return !accessSnapshot.empty;

  } catch (error) {
    console.error('Error checking child access:', error);
    return false;
  }
};