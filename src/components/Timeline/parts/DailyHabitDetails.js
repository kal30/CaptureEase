import React from 'react';
import { Box, Typography } from '@mui/material';
import { getHabitScale } from '../../../constants/habitTypes';

const DailyHabitDetails = ({ entry }) => {
  return (
    <Box>
      {entry.categoryLabel && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {entry.categoryLabel}
        </Typography>
      )}

      {entry.level && entry.categoryId && (() => {
        const habitScale = getHabitScale(entry.categoryId);
        const levelInfo = habitScale[entry.level];
        return levelInfo ? (
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
            {levelInfo.label} ({entry.level}/10) - {levelInfo.description}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
            Level {entry.level}/10
          </Typography>
        );
      })()}

      {entry.notes && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
          {entry.notes}
        </Typography>
      )}

      {entry.mediaUrls && entry.mediaUrls.length > 0 && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          📎 {entry.mediaUrls.length} attachment{entry.mediaUrls.length > 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(DailyHabitDetails);
