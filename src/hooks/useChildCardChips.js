import { useMemo } from 'react';

const useChildCardChips = (userRole, completedToday) => {
  const roleConfig = useMemo(() => ({
    'primary_parent': { label: '👑 Primary Parent', color: 'primary' },
    'co_parent': { label: '👨‍👩‍👧‍👦 Co-Parent', color: 'secondary' },
    'family_member': { label: '👵 Family', color: 'info' },
    'caregiver': { label: '🤱 Caregiver', color: 'warning' },
    'therapist': { label: '🩺 Therapist', color: 'success' }
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
