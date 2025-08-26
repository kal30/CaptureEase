import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { 
  getCurrentUserRoleForChild, 
  hasCurrentUserPermission,
  getUserDisplayInfo,
  getChildrenWithRoles,
  USER_ROLES,
  PERMISSIONS 
} from '../services/rolePermissionService';

const RoleContext = createContext({});

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [userRoles, setUserRoles] = useState({}); // childId -> role mapping
  const [userPermissions, setUserPermissions] = useState({}); // childId -> permissions array
  const [userDisplayInfo, setUserDisplayInfo] = useState({}); // childId -> display info
  const [childrenWithAccess, setChildrenWithAccess] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's roles and permissions for all children
  useEffect(() => {
    const loadUserRolesAndPermissions = async () => {
      if (!user) {
        setUserRoles({});
        setUserPermissions({});
        setUserDisplayInfo({});
        setChildrenWithAccess([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get all children with roles
        const childrenWithRoles = await getChildrenWithRoles();
        setChildrenWithAccess(childrenWithRoles);

        // Build role, permission, and display info mappings
        const roleMap = {};
        const permissionMap = {};
        const displayInfoMap = {};

        for (const child of childrenWithRoles) {
          roleMap[child.id] = child.userRole;
          permissionMap[child.id] = child.permissions || [];
          
          // Get display info
          const displayInfo = await getUserDisplayInfo(user.uid, child.id);
          displayInfoMap[child.id] = displayInfo;
        }

        setUserRoles(roleMap);
        setUserPermissions(permissionMap);
        setUserDisplayInfo(displayInfoMap);
      } catch (error) {
        console.error('Error loading user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRolesAndPermissions();
  }, [user]);

  // Helper functions
  const getUserRoleForChild = (childId) => {
    return userRoles[childId] || null;
  };

  const hasPermissionForChild = (childId, permission) => {
    const permissions = userPermissions[childId] || [];
    return permissions.includes(permission);
  };

  const canAddDataForChild = (childId) => {
    return hasPermissionForChild(childId, PERMISSIONS.ADD_DAILY_ENTRIES);
  };

  const isReadOnlyForChild = (childId) => {
    return getUserRoleForChild(childId) === USER_ROLES.THERAPIST;
  };

  const getDisplayInfoForChild = (childId) => {
    return userDisplayInfo[childId] || null;
  };

  const isPrimaryCaregiver = (childId) => {
    return getUserRoleForChild(childId) === USER_ROLES.PRIMARY_CAREGIVER;
  };

  const canInviteOthers = (childId) => {
    return hasPermissionForChild(childId, PERMISSIONS.INVITE_CAREGIVERS) || 
           hasPermissionForChild(childId, PERMISSIONS.INVITE_THERAPISTS);
  };

  const canManageChild = (childId) => {
    return hasPermissionForChild(childId, PERMISSIONS.MANAGE_CHILD);
  };

  // Refresh roles (useful after inviting new members)
  const refreshRoles = async () => {
    if (!user) return;
    
    try {
      const childrenWithRoles = await getChildrenWithRoles();
      setChildrenWithAccess(childrenWithRoles);

      const roleMap = {};
      const permissionMap = {};
      const displayInfoMap = {};

      for (const child of childrenWithRoles) {
        roleMap[child.id] = child.userRole;
        permissionMap[child.id] = child.permissions || [];
        
        const displayInfo = await getUserDisplayInfo(user.uid, child.id);
        displayInfoMap[child.id] = displayInfo;
      }

      setUserRoles(roleMap);
      setUserPermissions(permissionMap);
      setUserDisplayInfo(displayInfoMap);
    } catch (error) {
      console.error('Error refreshing roles:', error);
    }
  };

  const value = {
    // State
    userRoles,
    userPermissions,
    userDisplayInfo,
    childrenWithAccess,
    loading,

    // Helper functions
    getUserRoleForChild,
    hasPermissionForChild,
    canAddDataForChild,
    isReadOnlyForChild,
    getDisplayInfoForChild,
    isPrimaryCaregiver,
    canInviteOthers,
    canManageChild,
    refreshRoles,

    // Constants for easy access
    USER_ROLES,
    PERMISSIONS
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export default RoleContext;