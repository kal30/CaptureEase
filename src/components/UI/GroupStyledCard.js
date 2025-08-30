import React from 'react';
import { Card } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * GroupStyledCard - Card component with group-based styling
 * Applies different styling based on child group type (own, family, professional)
 * Handles hover effects and responsive behavior
 * 
 * @param {Object} props
 * @param {string} props.groupType - Group type: 'own', 'family', 'professional'
 * @param {boolean} props.isExpanded - Whether card is in expanded state
 * @param {boolean} props.isHovered - Whether card is being hovered
 * @param {function} props.onClick - Click handler for the card
 * @param {Object} props.sx - Additional styling overrides
 * @param {React.ReactNode} props.children - Card content
 */
const GroupStyledCard = ({ 
  groupType = 'own',
  isExpanded = false,
  isHovered = false,
  onClick,
  sx = {},
  children,
  ...props
}) => {
  const theme = useTheme();

  // Generate group-specific styling
  const getGroupStyling = () => {
    const baseStyle = {
      borderRadius: 3,
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    };

    switch (groupType) {
      case "own":
        return {
          ...baseStyle,
          borderColor: alpha(theme.palette.primary.main, 0.4),
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`
          } : {},
          ...(isExpanded && {
            borderColor: alpha(theme.palette.primary.main, 0.6),
            backgroundColor: alpha(theme.palette.primary.main, 0.05)
          }),
          ...(isHovered && {
            borderColor: alpha(theme.palette.primary.main, 0.8),
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          })
        };

      case "family":
        const familyColor = theme.palette.calendar?.accent || theme.palette.secondary.main;
        return {
          ...baseStyle,
          borderColor: alpha(familyColor, 0.4),
          backgroundColor: alpha(familyColor, 0.03),
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px ${alpha(familyColor, 0.2)}`
          } : {},
          ...(isExpanded && {
            borderColor: alpha(familyColor, 0.6),
            backgroundColor: alpha(familyColor, 0.05)
          }),
          ...(isHovered && {
            borderColor: alpha(familyColor, 0.8),
            backgroundColor: alpha(familyColor, 0.08)
          })
        };

      case "professional":
        const professionalColor = theme.palette.success?.main || '#4caf50';
        return {
          ...baseStyle,
          borderColor: alpha(professionalColor, 0.4),
          backgroundColor: alpha(professionalColor, 0.03),
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px ${alpha(professionalColor, 0.2)}`
          } : {},
          ...(isExpanded && {
            borderColor: alpha(professionalColor, 0.6),
            backgroundColor: alpha(professionalColor, 0.05)
          }),
          ...(isHovered && {
            borderColor: alpha(professionalColor, 0.8),
            backgroundColor: alpha(professionalColor, 0.08)
          })
        };

      default:
        return {
          ...baseStyle,
          borderColor: alpha(theme.palette.grey[300], 0.4),
          backgroundColor: theme.palette.background.paper,
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          } : {}
        };
    }
  };

  const cardStyling = getGroupStyling();

  return (
    <Card
      onClick={onClick}
      elevation={isExpanded ? 4 : 2}
      sx={{
        ...cardStyling,
        ...sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GroupStyledCard;