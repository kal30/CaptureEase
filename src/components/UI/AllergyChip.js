import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * AllergyChip - Reusable component for displaying allergies with smart prioritization
 * 
 * @param {string} allergy - Allergy name
 * @param {string} variant - Display variant: 'compact' | 'detailed'
 * @param {boolean} showSeverity - Whether to show severity indicator
 * @param {function} onClick - Click handler (optional)
 * @param {boolean} inForm - Whether chip is used in a form (disables custom click handlers)
 */
const AllergyChip = ({ 
  allergy, 
  variant = 'compact',
  showSeverity = true,
  onClick,
  inForm = false,
  ...chipProps
}) => {
  // Allergy-based styling, emojis, and priority
  const getAllergyConfig = (allergyName) => {
    const name = allergyName.toLowerCase();
    
    // Life-threatening allergies (highest priority)
    if (name.includes('nut') || name.includes('peanut') || name.includes('tree nut')) {
      return { color: "#DC2626", emoji: "🥜", severity: "High", priority: 0 };
    }
    if (name.includes('shellfish') || name.includes('seafood')) {
      return { color: "#DC2626", emoji: "🦐", severity: "High", priority: 1 };
    }
    if (name.includes('bee') || name.includes('wasp') || name.includes('sting')) {
      return { color: "#DC2626", emoji: "🐝", severity: "High", priority: 2 };
    }
    
    // Common allergies (medium priority)
    if (name.includes('dairy') || name.includes('milk') || name.includes('lactose')) {
      return { color: "#EA580C", emoji: "🥛", severity: "Medium", priority: 3 };
    }
    if (name.includes('gluten') || name.includes('wheat') || name.includes('celiac')) {
      return { color: "#EA580C", emoji: "🌾", severity: "Medium", priority: 4 };
    }
    if (name.includes('egg')) {
      return { color: "#EA580C", emoji: "🥚", severity: "Medium", priority: 5 };
    }
    if (name.includes('soy') || name.includes('soya')) {
      return { color: "#EA580C", emoji: "🫘", severity: "Medium", priority: 6 };
    }
    
    // Less common allergies (lower priority)
    if (name.includes('sesame')) {
      return { color: "#D97706", emoji: "🌱", severity: "Low", priority: 7 };
    }
    if (name.includes('fish')) {
      return { color: "#D97706", emoji: "🐟", severity: "Medium", priority: 8 };
    }
    if (name.includes('citrus') || name.includes('orange') || name.includes('lemon')) {
      return { color: "#D97706", emoji: "🍊", severity: "Low", priority: 9 };
    }
    if (name.includes('chocolate') || name.includes('cocoa')) {
      return { color: "#D97706", emoji: "🍫", severity: "Low", priority: 10 };
    }
    if (name.includes('dye') || name.includes('artificial')) {
      return { color: "#7C3AED", emoji: "🌈", severity: "Low", priority: 11 };
    }
    
    // Default/unknown allergies - make them more visible
    return { color: "#374151", emoji: "⚠️", severity: "Unknown", priority: 12 };
  };

  const allergyConfig = getAllergyConfig(allergy);

  if (variant === 'compact') {
    // Make unknown allergies more visible with higher alpha
    const isUnknown = allergyConfig.severity === "Unknown";
    const backgroundAlpha = isUnknown ? 0.25 : 0.15;
    const hoverAlpha = isUnknown ? 0.35 : 0.25;
    
    return (
      <Chip
        {...chipProps}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            <Typography sx={{ fontSize: "0.8rem" }}>
              {allergyConfig.emoji}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>
              {allergy}
            </Typography>
          </Box>
        }
        size="small"
        onClick={inForm ? undefined : onClick}
        sx={{
          height: 20,
          fontSize: "0.65rem",
          bgcolor: alpha(allergyConfig.color, backgroundAlpha),
          color: allergyConfig.color,
          fontWeight: 500,
          borderRadius: 0.5,
          cursor: (inForm || !onClick) ? 'default' : 'pointer',
          border: isUnknown ? `1px solid ${alpha(allergyConfig.color, 0.3)}` : 'none',
          '&:hover': (inForm || !onClick) ? {} : {
            bgcolor: alpha(allergyConfig.color, hoverAlpha),
          },
          ...chipProps?.sx
        }}
      />
    );
  }

  // Detailed variant for popover
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      borderRadius: 1,
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        bgcolor: alpha(allergyConfig.color, 0.05)
      }
    }}
    onClick={onClick}
    >
      <Typography sx={{ fontSize: "1.4rem" }}>
        {allergyConfig.emoji}
      </Typography>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {allergy}
        </Typography>
        {showSeverity && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: allergyConfig.color,
              fontSize: '0.75rem'
            }}
          >
            {allergyConfig.severity} Risk
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Helper function to sort allergies by severity/priority
export const sortAllergiesByPriority = (allergies) => {
  if (!allergies || !Array.isArray(allergies)) return [];
  
  return [...allergies].sort((a, b) => {
    const getAllergyConfig = (allergyName) => {
      const name = allergyName.toLowerCase();
      if (name.includes('nut') || name.includes('peanut')) return { priority: 0 };
      if (name.includes('shellfish')) return { priority: 1 };
      if (name.includes('dairy') || name.includes('milk')) return { priority: 3 };
      if (name.includes('gluten') || name.includes('wheat')) return { priority: 4 };
      if (name.includes('egg')) return { priority: 5 };
      // Add more as needed...
      return { priority: 12 };
    };
    
    return getAllergyConfig(a).priority - getAllergyConfig(b).priority;
  });
};

export default AllergyChip;