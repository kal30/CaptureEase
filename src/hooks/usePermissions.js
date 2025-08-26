import { useRole } from '../contexts/RoleContext';
import { PERMISSIONS, USER_ROLES } from '../services/rolePermissionService';

/**
 * Hook for easy permission checking in components
 */
export const usePermissions = (childId) => {
  const {
    getUserRoleForChild,
    hasPermissionForChild,
    canAddDataForChild,
    isReadOnlyForChild,
    getDisplayInfoForChild,
    isPrimaryCaregiver,
    canInviteOthers,
    canManageChild,
    loading
  } = useRole();

  // Return null if childId not provided
  if (!childId) {
    return {
      userRole: null,
      displayInfo: null,
      canAddData: false,
      isReadOnly: true,
      isPrimary: false,
      canInvite: false,
      canManage: false,
      hasPermission: () => false,
      loading
    };
  }

  const userRole = getUserRoleForChild(childId);
  const displayInfo = getDisplayInfoForChild(childId);

  return {
    // Basic info
    userRole,
    displayInfo,
    loading,

    // Common permission checks
    canAddData: canAddDataForChild(childId),
    isReadOnly: isReadOnlyForChild(childId),
    isPrimary: isPrimaryCaregiver(childId),
    canInvite: canInviteOthers(childId),
    canManage: canManageChild(childId),

    // Specific permissions
    canAddDailyEntries: hasPermissionForChild(childId, PERMISSIONS.ADD_DAILY_ENTRIES),
    canAddDetailedEntries: hasPermissionForChild(childId, PERMISSIONS.ADD_DETAILED_ENTRIES),
    canAddMedicalEntries: hasPermissionForChild(childId, PERMISSIONS.ADD_MEDICAL_ENTRIES),
    canEditProfile: hasPermissionForChild(childId, PERMISSIONS.EDIT_CHILD_PROFILE),
    canViewTimeline: hasPermissionForChild(childId, PERMISSIONS.VIEW_TIMELINE),
    canViewAnalytics: hasPermissionForChild(childId, PERMISSIONS.VIEW_ANALYTICS),
    canExportData: hasPermissionForChild(childId, PERMISSIONS.EXPORT_DATA),

    // Generic permission checker
    hasPermission: (permission) => hasPermissionForChild(childId, permission),

    // Role checks
    isCaregiver: userRole === USER_ROLES.CAREGIVER || userRole === USER_ROLES.PRIMARY_CAREGIVER,
    isTherapist: userRole === USER_ROLES.THERAPIST,
    hasCaregiverRole: userRole === USER_ROLES.CAREGIVER,
    hasPrimaryCaregiverRole: userRole === USER_ROLES.PRIMARY_CAREGIVER,
    hasTherapistRole: userRole === USER_ROLES.THERAPIST,

    // Helper functions for UI
    getRoleBadge: () => displayInfo?.badgeText || "No Access",
    getRoleColor: () => displayInfo?.badgeColor || "#EF4444",
    getRoleDescription: () => displayInfo?.description || "No access to this child"
  };
};

export default usePermissions;