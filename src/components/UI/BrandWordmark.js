import React from 'react';
import { Box, Typography } from '@mui/material';
import colors from '../../assets/theme/colors';
import { BRAND_WORDMARK_VARIANTS } from '../../constants/brand';

const BrandWordmark = ({
  variant = 'navbar',
  color = colors.landing.heroText,
  showDot = false,
  dotColor = colors.brand.ink,
  sx = {},
  ...props
}) => {
  const wordmarkVariant = BRAND_WORDMARK_VARIANTS[variant] || BRAND_WORDMARK_VARIANTS.navbar;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: wordmarkVariant.letterSpacing,
        lineHeight: wordmarkVariant.lineHeight,
        whiteSpace: 'nowrap',
        color,
        ...sx,
      }}
      {...props}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: wordmarkVariant.fontSize,
          lineHeight: wordmarkVariant.lineHeight,
          color,
        }}
      >
        life
      </Typography>
      <Typography
        component="span"
        sx={{
          fontWeight: 400,
          fontSize: wordmarkVariant.fontSize,
          lineHeight: wordmarkVariant.lineHeight,
          color,
        }}
      >
        log
      </Typography>
      {showDot ? (
        <Box
          component="span"
          sx={{
            width: 10,
            height: 10,
            ml: 0.5,
            borderRadius: '50%',
            bgcolor: dotColor,
            boxShadow: `0 0 0 4px ${dotColor}22`,
            flexShrink: 0,
          }}
        />
      ) : null}
    </Box>
  );
};

export default BrandWordmark;
