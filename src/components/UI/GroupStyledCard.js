import React from 'react';
import { Card } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import colors from '../../assets/theme/colors';

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
      borderRadius: 1,
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      position: 'relative'
    };

    switch (groupType) {
      case "own":
        return {
          ...baseStyle,
          borderColor: alpha(colors.brand.ink, 0.35),
          backgroundColor: alpha(colors.landing.pageBackground, 0.75),
          '&:hover': onClick ? {
            boxShadow: `0 6px 20px ${alpha(colors.brand.ink, 0.14)}`
          } : {},
          ...(isExpanded && {
            borderColor: alpha(colors.brand.ink, 0.55),
            backgroundColor: alpha(colors.landing.tealLight, 0.85)
          }),
          ...(isHovered && {
            borderColor: alpha(colors.brand.ink, 0.7),
            backgroundColor: alpha(colors.landing.tealLight, 0.95)
          })
        };

      case "family":
        const familyColor = colors.brand.tint;
        return {
          ...baseStyle,
          borderColor: alpha(familyColor, 0.4),
          backgroundColor: alpha(colors.landing.panelSoft, 0.85),
          '&:hover': onClick ? {
            boxShadow: `0 6px 20px ${alpha(familyColor, 0.14)}`
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
        const professionalColor = colors.brand.deep;
        return {
          ...baseStyle,
          borderColor: alpha(professionalColor, 0.4),
          backgroundColor: alpha(colors.landing.sageLight, 0.9),
          '&:hover': onClick ? {
            boxShadow: `0 6px 20px ${alpha(professionalColor, 0.14)}`
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
            boxShadow: theme.shadows[3]
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
