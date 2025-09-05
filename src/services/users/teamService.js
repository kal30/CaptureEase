import { getUserDetails } from './userService';

/**
 * Populate child object with team member user details - SIMPLIFIED
 */
export const populateChildTeamMembers = async (child) => {
  if (!child || !child.users) {
    return child;
  }

  try {
    const users = child.users;
    const enrichedUsers = { ...users };

    // Get care partners details
    if (users.care_partners && users.care_partners.length > 0) {
      enrichedUsers.care_partners = await Promise.all(
        users.care_partners.map(async (userId) => {
          const userDetails = await getUserDetails(userId);
          return {
            ...userDetails,
            role: "Care Partner"
          };
        })
      );
    } else {
      enrichedUsers.care_partners = [];
    }

    // Get caregivers details
    if (users.caregivers && users.caregivers.length > 0) {
      enrichedUsers.caregivers = await Promise.all(
        users.caregivers.map(async (userId) => {
          const userDetails = await getUserDetails(userId);
          return {
            ...userDetails,
            role: "Caregiver"
          };
        })
      );
    } else {
      enrichedUsers.caregivers = [];
    }

    // Get therapists details
    if (users.therapists && users.therapists.length > 0) {
      enrichedUsers.therapists = await Promise.all(
        users.therapists.map(async (userId) => {
          const userDetails = await getUserDetails(userId);
          return {
            ...userDetails,
            role: "Therapist"
          };
        })
      );
    } else {
      enrichedUsers.therapists = [];
    }

    return {
      ...child,
      users: enrichedUsers
    };
  } catch (error) {
    console.error('Error populating child team members:', error);
    return child;
  }
};