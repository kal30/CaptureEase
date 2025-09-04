import { useMemo } from 'react';
import { USER_ROLES, ROLE_DISPLAY } from '../constants/roles';

const useChildCardChips = (userRole, completedToday) => {
  const roleConfig = useMemo(() => ({
    [USER_ROLES.CARE_OWNER]: { label: ROLE_DISPLAY[USER_ROLES.CARE_OWNER].label, color: 'primary' },
    [USER_ROLES.CARE_PARTNER]: { label: ROLE_DISPLAY[USER_ROLES.CARE_PARTNER].label, color: 'secondary' },
    [USER_ROLES.CAREGIVER]: { label: ROLE_DISPLAY[USER_ROLES.CAREGIVER].label, color: 'warning' },
    [USER_ROLES.THERAPIST]: { label: ROLE_DISPLAY[USER_ROLES.THERAPIST].label, color: 'success' }
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
      const config = roleConfig[userRole] || { label: userRole, color: 'default' };
      chips.push({
        label: config.label,
        color: config.color,
        variant: 'outlined',
        sx: { fontWeight: 600 }
      });
    }

    return chips;
  }, [userRole, completedToday, roleConfig]);

  return allChips;
};

export default useChildCardChips;
