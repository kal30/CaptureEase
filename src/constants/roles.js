/**
 * Centralized Role and Permission Constants
 * KISS Architecture - Single source of truth for all role-related constants
 */

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

export const USER_ROLES = {
  CARE_OWNER: 'care_owner',        // Exactly one per child (main responsible person)
  CARE_PARTNER: 'care_partner',    // Family members, relatives, friends
  CAREGIVER: 'caregiver',          // Professional helpers (nannies, aides, teachers)  
  THERAPIST: 'therapist'           // Professional advisors (speech, OT, behavioral)
};

// Role display information
export const ROLE_DISPLAY = {
  [USER_ROLES.CARE_OWNER]: {
    label: '👑 Care Owner',
    description: 'Main responsible person - Full control over everything',
    badge: 'Full Control',
    color: '#8B5CF6',
    priority: 1, // Highest priority
    icon: '👑'
  },
  [USER_ROLES.CARE_PARTNER]: {
    label: '👨‍👩‍👧‍👦 Care Partner',
    description: 'Family member/friend - Can add logs and view all progress',
    badge: 'Full Access',
    color: '#10B981',
    priority: 2,
    icon: '👨‍👩‍👧‍👦'
  },
  [USER_ROLES.CAREGIVER]: {
    label: '👤 Caregiver',
    description: 'Professional helper - Limited access to shared information',
    badge: 'Restricted Access',
    color: '#F59E0B',
    priority: 3,
    icon: '👤'
  },
  [USER_ROLES.THERAPIST]: {
    label: '🩺 Therapist',
    description: 'Professional advisor - View all + add professional notes',
    badge: 'Professional View',
    color: '#64748B',
    priority: 4,
    icon: '🩺'
  }
};

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

export const PERMISSIONS = {
  // Child Management
  CREATE_CHILD: 'create_child',
  EDIT_CHILD: 'edit_child',
  DELETE_CHILD: 'delete_child',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_PRIVACY: 'manage_privacy',
  TRANSFER_OWNERSHIP: 'transfer_ownership',
  
  // Team Management
  INVITE_CARE_PARTNER: 'invite_care_partner',
  INVITE_CAREGIVER: 'invite_caregiver', 
  INVITE_THERAPIST: 'invite_therapist',
  REMOVE_TEAM_MEMBERS: 'remove_team_members',
  
  // Log Permissions
  ADD_DAILY_LOGS: 'add_daily_logs',
  ADD_DAILY_HABITS: 'add_daily_habits',
  ADD_PROFESSIONAL_NOTES: 'add_professional_notes',
  VIEW_ALL_LOGS: 'view_all_logs',
  VIEW_SHARED_LOGS_ONLY: 'view_shared_logs_only',
  EDIT_OWN_LOGS: 'edit_own_logs',
  EDIT_ANY_LOGS: 'edit_any_logs',
  DELETE_OWN_LOGS: 'delete_own_logs',
  DELETE_ANY_LOGS: 'delete_any_logs',
  
  // View & Export
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_MEDICAL_INFO: 'view_medical_info',
  EXPORT_REPORTS: 'export_reports'
};

// =============================================================================
// LOG VISIBILITY LEVELS
// =============================================================================

export const LOG_VISIBILITY = {
  EVERYONE: 'everyone',           // All team members can see (default)
  FAMILY_ONLY: 'family_only',     // Care Owner + Care Partners only
  OWNER_ONLY: 'owner_only',       // Care Owner only
  THERAPIST_NOTES: 'therapist_notes' // Therapist professional notes
};

export const VISIBILITY_DISPLAY = {
  [LOG_VISIBILITY.EVERYONE]: {
    label: '👥 Everyone',
    description: 'All team members can see this log',
    icon: '👥',
    color: '#10B981'
  },
  [LOG_VISIBILITY.FAMILY_ONLY]: {
    label: '👨‍👩‍👧‍👦 Family Only', 
    description: 'Only family members can see this log',
    icon: '👨‍👩‍👧‍👦',
    color: '#F59E0B'
  },
  [LOG_VISIBILITY.OWNER_ONLY]: {
    label: '👑 Owner Only',
    description: 'Only the care owner can see this log',
    icon: '👑', 
    color: '#8B5CF6'
  },
  [LOG_VISIBILITY.THERAPIST_NOTES]: {
    label: '🩺 Therapist Notes',
    description: 'Professional notes from therapists',
    icon: '🩺',
    color: '#64748B'
  }
};

// =============================================================================
// ROLE-PERMISSION MATRIX
// =============================================================================

export const ROLE_PERMISSIONS = {
  [USER_ROLES.CARE_OWNER]: [
    // Full control - exactly one per child
    PERMISSIONS.CREATE_CHILD,
    PERMISSIONS.EDIT_CHILD, 
    PERMISSIONS.DELETE_CHILD,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_PRIVACY,
    PERMISSIONS.TRANSFER_OWNERSHIP,
    PERMISSIONS.INVITE_CARE_PARTNER,
    PERMISSIONS.INVITE_CAREGIVER,
    PERMISSIONS.INVITE_THERAPIST,
    PERMISSIONS.REMOVE_TEAM_MEMBERS,
    PERMISSIONS.ADD_DAILY_LOGS,
    PERMISSIONS.ADD_DAILY_HABITS,
    PERMISSIONS.ADD_PROFESSIONAL_NOTES,
    PERMISSIONS.VIEW_ALL_LOGS,
    PERMISSIONS.EDIT_OWN_LOGS,
    PERMISSIONS.EDIT_ANY_LOGS,
    PERMISSIONS.DELETE_OWN_LOGS,
    PERMISSIONS.DELETE_ANY_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO,
    PERMISSIONS.EXPORT_REPORTS
  ],
  
  [USER_ROLES.CARE_PARTNER]: [
    // Family members - full data access but NO invitation permissions
    PERMISSIONS.ADD_DAILY_LOGS,
    PERMISSIONS.ADD_DAILY_HABITS,
    PERMISSIONS.VIEW_ALL_LOGS,
    PERMISSIONS.EDIT_OWN_LOGS,
    PERMISSIONS.DELETE_OWN_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO,
    PERMISSIONS.EXPORT_REPORTS
    // NOTE: NO INVITE_* permissions - only Care Owner can invite
  ],
  
  [USER_ROLES.CAREGIVER]: [
    // Professional helpers - restricted access
    PERMISSIONS.ADD_DAILY_LOGS,
    PERMISSIONS.ADD_DAILY_HABITS,
    PERMISSIONS.VIEW_SHARED_LOGS_ONLY,
    PERMISSIONS.EDIT_OWN_LOGS,
    PERMISSIONS.DELETE_OWN_LOGS
  ],
  
  [USER_ROLES.THERAPIST]: [
    // Professional advisors - view all + professional notes only
    PERMISSIONS.VIEW_ALL_LOGS,
    PERMISSIONS.ADD_PROFESSIONAL_NOTES, // Only professional notes, no daily logs
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_MEDICAL_INFO,
    PERMISSIONS.EXPORT_REPORTS
  ]
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if role has permission
 */
export const roleHasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Array} - Array of permissions
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Get role display information
 * @param {string} role - User role
 * @returns {Object} - Display information object
 */
export const getRoleDisplay = (role) => {
  return ROLE_DISPLAY[role] || {
    label: 'Unknown Role',
    description: 'Unknown role type',
    badge: 'Unknown',
    color: '#EF4444',
    priority: 999,
    icon: '❓'
  };
};

/**
 * Check if user can see log based on role and visibility
 * @param {string} userRole - User's role
 * @param {string} logVisibility - Log's visibility level
 * @param {boolean} isLogOwner - Whether user created the log
 * @param {boolean} therapistCanSeeFamilyLogs - Owner setting for therapist family log access
 * @returns {boolean} - True if user can see the log
 */
export const canViewLog = (userRole, logVisibility, isLogOwner = false, therapistCanSeeFamilyLogs = false) => {
  // Owner can always see their own logs
  if (isLogOwner) return true;
  
  // Care Owner can see all logs
  if (userRole === USER_ROLES.CARE_OWNER) return true;
  
  switch (logVisibility) {
    case LOG_VISIBILITY.EVERYONE:
      return true; // All roles can see
      
    case LOG_VISIBILITY.FAMILY_ONLY:
      // Care Partners can always see family logs
      if (userRole === USER_ROLES.CARE_PARTNER) return true;
      // Therapists can see if owner allows it
      if (userRole === USER_ROLES.THERAPIST) return therapistCanSeeFamilyLogs;
      // Caregivers cannot see family logs
      return false;
      
    case LOG_VISIBILITY.OWNER_ONLY:
      return userRole === USER_ROLES.CARE_OWNER;
      
    case LOG_VISIBILITY.THERAPIST_NOTES:
      // Therapists and Care Owner can see therapist notes
      return [USER_ROLES.CARE_OWNER, USER_ROLES.THERAPIST].includes(userRole);
      
    default:
      return false;
  }
};

/**
 * Get highest priority role (in case user has multiple roles for a child)
 * @param {Array} roles - Array of user roles
 * @returns {string} - Highest priority role
 */
export const getHighestPriorityRole = (roles) => {
  if (!roles || roles.length === 0) return null;
  
  const sortedRoles = roles
    .map(role => ({ role, priority: ROLE_DISPLAY[role]?.priority || 999 }))
    .sort((a, b) => a.priority - b.priority);
    
  return sortedRoles[0]?.role || null;
};

/**
 * Get available visibility options for a user role
 * @param {string} userRole - User's role
 * @returns {Array} - Array of visibility options user can set
 */
export const getAvailableVisibilityOptions = (userRole) => {
  switch (userRole) {
    case USER_ROLES.CARE_OWNER:
      return [
        LOG_VISIBILITY.EVERYONE,
        LOG_VISIBILITY.FAMILY_ONLY,
        LOG_VISIBILITY.OWNER_ONLY
      ];
      
    case USER_ROLES.CARE_PARTNER:
      return [
        LOG_VISIBILITY.EVERYONE,
        LOG_VISIBILITY.FAMILY_ONLY
      ];
      
    case USER_ROLES.CAREGIVER:
      return [
        LOG_VISIBILITY.EVERYONE
      ];
      
    case USER_ROLES.THERAPIST:
      return [
        LOG_VISIBILITY.THERAPIST_NOTES,
        LOG_VISIBILITY.EVERYONE // Can add general notes visible to everyone
      ];
      
    default:
      return [LOG_VISIBILITY.EVERYONE];
  }
};

/**
 * Check if a user can invite others (any role)
 * @param {string} userRole - User's role
 * @returns {boolean} - True if user can invite team members
 */
export const canInviteTeamMembers = (userRole) => {
  return roleHasPermission(userRole, PERMISSIONS.INVITE_CARE_PARTNER) ||
         roleHasPermission(userRole, PERMISSIONS.INVITE_CAREGIVER) ||
         roleHasPermission(userRole, PERMISSIONS.INVITE_THERAPIST);
};

/**
 * Get invitation options available to a user role
 * @param {string} userRole - User's role
 * @returns {Array} - Array of role types they can invite
 */
export const getInvitationOptions = (userRole) => {
  const options = [];
  
  if (roleHasPermission(userRole, PERMISSIONS.INVITE_CARE_PARTNER)) {
    options.push(USER_ROLES.CARE_PARTNER);
  }
  if (roleHasPermission(userRole, PERMISSIONS.INVITE_CAREGIVER)) {
    options.push(USER_ROLES.CAREGIVER);
  }
  if (roleHasPermission(userRole, PERMISSIONS.INVITE_THERAPIST)) {
    options.push(USER_ROLES.THERAPIST);
  }
  
  return options;
};

// =============================================================================
// CLEAN ROLE SYSTEM - NO LEGACY CODE
// =============================================================================