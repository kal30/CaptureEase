import { useMemo } from 'react';
import { USER_ROLES, ROLE_DISPLAY } from '../constants/roles';
import { getRoleColor, getRoleColorAlpha } from '../assets/theme/roleColors';


const useChildCardChips = (userRole, completedToday) => {
  // Helper function to map user roles to role color keys
  const getRoleKey = (role) => {
    const roleMap = {
      [USER_ROLES.CARE_OWNER]: 'careOwner',
      [USER_ROLES.CARE_PARTNER]: 'carePartner',
      [USER_ROLES.CAREGIVER]: 'caregiver',
      [USER_ROLES.THERAPIST]: 'therapist'
    };
    return roleMap[role] || 'careOwner';
  };
  const roleConfig = useMemo(() => ({
    [USER_ROLES.CARE_OWNER]: { 
      label: ROLE_DISPLAY[USER_ROLES.CARE_OWNER].label, 
      color: getRoleColor('careOwner', 'primary'),
      bgColor: getRoleColorAlpha('careOwner', 'primary', 0.1)
    },
    [USER_ROLES.CARE_PARTNER]: { 
      label: ROLE_DISPLAY[USER_ROLES.CARE_PARTNER].label, 
      color: getRoleColor('carePartner', 'primary'),
      bgColor: getRoleColorAlpha('carePartner', 'primary', 0.1)
    },
    [USER_ROLES.CAREGIVER]: { 
      label: ROLE_DISPLAY[USER_ROLES.CAREGIVER].label, 
      color: getRoleColor('caregiver', 'primary'),
      bgColor: getRoleColorAlpha('caregiver', 'primary', 0.1)
    },
    [USER_ROLES.THERAPIST]: { 
      label: ROLE_DISPLAY[USER_ROLES.THERAPIST].label, 
      color: getRoleColor('therapist', 'primary'),
      bgColor: getRoleColorAlpha('therapist', 'primary', 0.1)
    }
  }), []);

  const allChips = useMemo(() => {
    const chips = [];

    if (completedToday) {
      chips.push({
        label: 'Daily care complete',
        color: 'success',
        variant: 'outlined'
      });
    }

    if (userRole) {
      const config = roleConfig[userRole] || { 
        label: userRole, 
        color: getRoleColor('careOwner', 'primary'),
        bgColor: getRoleColorAlpha('careOwner', 'primary', 0.1)
      };
      
      chips.push({
        label: config.label,
        variant: 'filled',
        sx: { 
          fontWeight: 600,
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${getRoleColorAlpha(getRoleKey(userRole), 'primary', 0.3)}`
        }
      });
    }
    
    return chips;
  }, [userRole, completedToday, roleConfig]);

  return allChips;
};

export default useChildCardChips;
