/**
 * Timeline Permission Service
 * Modular service for handling role-based timeline visibility and filtering
 */

import { 
  USER_ROLES, 
  PERMISSIONS,
  LOG_VISIBILITY,
  canViewLog,
  roleHasPermission
} from '../../constants/roles';

/**
 * Timeline Permission Manager
 * Encapsulates all timeline access logic for different user roles
 */
export class TimelinePermissionManager {
  constructor(userRole, userId, childId) {
    this.userRole = userRole;
    this.userId = userId;
    this.childId = childId;
  }

  /**
   * Check if user can see all timeline entries (Care Owner perspective)
   * Care Owner should see everything - all roles' contributions
   */
  canViewAllEntries() {
    return this.userRole === USER_ROLES.CARE_OWNER;
  }

  /**
   * Check if user can see entries from a specific role
   */
  canViewEntriesFromRole(contributorRole) {
    // Care Owner sees everything
    if (this.userRole === USER_ROLES.CARE_OWNER) {
      return true;
    }

    // Care Partners see all non-therapist professional entries
    if (this.userRole === USER_ROLES.CARE_PARTNER) {
      return true; // Will be filtered by visibility level later
    }

    // Caregivers see limited entries (filtered by visibility)
    if (this.userRole === USER_ROLES.CAREGIVER) {
      return true; // Will be filtered by visibility level later
    }

    // Therapists see all entries (read-only)
    if (this.userRole === USER_ROLES.THERAPIST) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can see a specific timeline entry
   */
  canViewEntry(entry, therapistCanSeeFamilyLogs = false) {
    // Check if user created this entry
    const isOwner = entry.userId === this.userId;

    // Use the centralized visibility checker
    const visibility = entry.visibility || LOG_VISIBILITY.EVERYONE;
    
    return canViewLog(
      this.userRole,
      visibility,
      isOwner,
      therapistCanSeeFamilyLogs
    );
  }

  /**
   * Filter timeline entries based on role permissions
   * Care Owner Implementation: See everything
   */
  filterTimelineEntries(entries, options = {}) {
    const { 
      therapistCanSeeFamilyLogs = false,
      includeAllRoles = true 
    } = options;

    // Care Owner sees everything - no filtering needed
    if (this.userRole === USER_ROLES.CARE_OWNER) {
      return entries;
    }

    // For other roles, filter by visibility
    return entries.filter(entry => 
      this.canViewEntry(entry, therapistCanSeeFamilyLogs)
    );
  }

  /**
   * Get timeline summary for role
   * Care Owner gets full summary including all contributors
   */
  getTimelineSummaryForRole(entries, summary) {
    if (this.userRole === USER_ROLES.CARE_OWNER) {
      // Enhanced summary showing contributions from all roles
      const contributorRoles = new Set(entries.map(e => e.userRole).filter(Boolean));
      
      return {
        ...summary,
        roleInsights: {
          totalContributors: contributorRoles.size,
          contributingRoles: Array.from(contributorRoles),
          hasCarepartnerEntries: entries.some(e => e.userRole === USER_ROLES.CARE_PARTNER),
          hasCaregiverEntries: entries.some(e => e.userRole === USER_ROLES.CAREGIVER), 
          hasTherapistEntries: entries.some(e => e.userRole === USER_ROLES.THERAPIST)
        },
        // Ensure we have the correct property names for counts
        incidentCount: entries.filter(e => e.type === 'incident').length,
        journalCount: entries.filter(e => e.type === 'journal').length,
        dailyHabitCount: entries.filter(e => e.type === 'dailyHabit').length,
        accessLevel: 'full',
        canSeeAllEntries: true
      };
    }

    // Other roles get basic summary
    return {
      ...summary,
      accessLevel: 'filtered',
      canSeeAllEntries: false
    };
  }

  /**
   * Get available timeline actions for the current role
   * Care Owner gets full control
   */
  getAvailableTimelineActions() {
    const actions = {
      canAddEntry: false,
      canEditOwnEntries: false,
      canEditAnyEntries: false,
      canDeleteOwnEntries: false,
      canDeleteAnyEntries: false,
      canExportData: false,
      canViewAnalytics: false,
      canManageVisibility: false
    };

    if (this.userRole === USER_ROLES.CARE_OWNER) {
      return {
        ...actions,
        canAddEntry: true,
        canEditOwnEntries: true,
        canEditAnyEntries: true,
        canDeleteOwnEntries: true,
        canDeleteAnyEntries: true,
        canExportData: true,
        canViewAnalytics: true,
        canManageVisibility: true
      };
    }

    return actions;
  }
}

/**
 * Factory function to create timeline permission manager
 */
export const createTimelinePermissionManager = (userRole, userId, childId) => {
  return new TimelinePermissionManager(userRole, userId, childId);
};

/**
 * Higher-order function to enhance timeline data with role-based permissions
 */
export const withTimelinePermissions = (userRole, userId, childId) => {
  const permissionManager = createTimelinePermissionManager(userRole, userId, childId);

  return {
    filterEntries: (entries, options) => 
      permissionManager.filterTimelineEntries(entries, options),
    
    enhanceSummary: (entries, summary) => 
      permissionManager.getTimelineSummaryForRole(entries, summary),
    
    getActions: () => 
      permissionManager.getAvailableTimelineActions(),
    
    canViewAllEntries: () => 
      permissionManager.canViewAllEntries(),
    
    canViewEntry: (entry, options) => 
      permissionManager.canViewEntry(entry, options?.therapistCanSeeFamilyLogs)
  };
};

/**
 * Care Owner specific timeline enhancements
 * Provides the full timeline view with all contributions
 */
export const getCareOwnerTimelineView = (entries, summary, options = {}) => {
  return {
    entries, // No filtering - Care Owner sees everything
    enhancedSummary: {
      ...summary,
      roleBreakdown: {
        byRole: entries.reduce((acc, entry) => {
          const role = entry.userRole || 'unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {}),
        totalContributors: new Set(entries.map(e => e.userId).filter(Boolean)).size
      },
      accessLevel: 'full',
      viewerRole: USER_ROLES.CARE_OWNER
    },
    permissions: {
      canSeeAllEntries: true,
      canManageAllEntries: true,
      canViewContributorInfo: true,
      canExportFullData: true
    }
  };
};