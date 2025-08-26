import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Reusable Completion Badge Component
 * Shows "All done ✅" or "2 of 3 ✅" status
 */
const CompletionBadge = ({ 
  completed, 
  total, 
  variant = 'caption',
  showIcon = true 
}) => {
  const theme = useTheme();
  const isAllComplete = completed === total;
  
  return (
    <Typography
      variant={variant}
      sx={{
        color: isAllComplete ? theme.palette.success.dark : 'text.secondary',
        fontSize: '0.8rem',
        fontWeight: isAllComplete ? 600 : 400,
      }}
    >
      {isAllComplete 
        ? `All done${showIcon ? ' ✅' : ''}` 
        : `${completed} of ${total}${showIcon ? ' ✅' : ''}`
      }
    </Typography>
  );
};

export default CompletionBadge;