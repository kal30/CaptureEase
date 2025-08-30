import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

/**
 * ChildBasicInfo - Reusable component for displaying child's basic information
 * Shows name, age, and optional subtitle/status information
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object with name, age, etc.
 * @param {string} props.subtitle - Optional subtitle text
 * @param {string} props.variant - Display variant: 'default', 'compact', 'detailed'
 * @param {boolean} props.showAge - Whether to show age (default: true)
 * @param {Array} props.chips - Optional array of chip data to display
 * @param {Object} props.sx - Additional styling
 */
const ChildBasicInfo = ({ 
  child, 
  subtitle,
  variant = 'default',
  showAge = true,
  chips = [],
  sx = {} 
}) => {
  const getTypographyProps = () => {
    switch (variant) {
      case 'compact':
        return {
          name: { variant: 'subtitle1', sx: { fontWeight: 600, fontSize: '1rem' } },
          age: { variant: 'caption', sx: { fontSize: '0.75rem' } },
          subtitle: { variant: 'caption', sx: { fontSize: '0.7rem' } }
        };
      case 'detailed':
        return {
          name: { variant: 'h5', sx: { fontWeight: 700, letterSpacing: '-0.5px' } },
          age: { variant: 'body1', sx: { fontSize: '1.1rem' } },
          subtitle: { variant: 'body2', sx: { fontSize: '0.9rem' } }
        };
      default:
        return {
          name: { variant: 'h6', sx: { fontWeight: 600, letterSpacing: '-0.2px' } },
          age: { variant: 'body2', sx: { fontSize: '1rem' } },
          subtitle: { variant: 'body2', sx: { fontSize: '0.85rem' } }
        };
    }
  };

  const typographyProps = getTypographyProps();

  return (
    <Box sx={{ flex: 1, minWidth: 0, ...sx }}>
      {/* Child Name */}
      <Typography
        {...typographyProps.name}
        sx={{
          ...typographyProps.name.sx,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'text.primary'
        }}
        title={child.name} // Show full name on hover
      >
        {child.name}
      </Typography>

      {/* Age and Subtitle Row */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mt: variant === 'detailed' ? 0.5 : 0.25 
      }}>
        {showAge && (
          <Typography
            {...typographyProps.age}
            sx={{
              ...typographyProps.age.sx,
              color: 'text.secondary'
            }}
          >
            Age {child.age}
          </Typography>
        )}

        {subtitle && (
          <>
            {showAge && (
              <Typography 
                sx={{ 
                  color: 'text.disabled',
                  fontSize: typographyProps.age.sx?.fontSize || '1rem'
                }}
              >
                •
              </Typography>
            )}
            <Typography
              {...typographyProps.subtitle}
              sx={{
                ...typographyProps.subtitle.sx,
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={subtitle}
            >
              {subtitle}
            </Typography>
          </>
        )}
      </Box>

      {/* Optional Chips */}
      {chips.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          mt: 0.5, 
          flexWrap: 'wrap' 
        }}>
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip.label}
              size="small"
              variant={chip.variant || 'outlined'}
              color={chip.color || 'default'}
              sx={{
                height: variant === 'compact' ? 18 : 22,
                fontSize: variant === 'compact' ? '0.65rem' : '0.75rem',
                ...chip.sx
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ChildBasicInfo;