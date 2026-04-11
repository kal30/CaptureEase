import React from 'react';
import { Box, Typography } from '@mui/material';
import colors from '../../assets/theme/colors';
import { BRAND_WORDMARK_VARIANTS } from '../../constants/brand';
import lifelogMark from '../../assets/image/logo/lifelog-handdrawn-192.png';

const BrandWordmark = ({
  variant = 'navbar',
  color = colors.landing.heroText,
  showDot = false,
  showIcon = true,
  dotColor = colors.brand.ink,
  sx = {},
  ...props
}) => {
  const wordmarkVariant = BRAND_WORDMARK_VARIANTS[variant] || BRAND_WORDMARK_VARIANTS.navbar;
  const iconSize = typeof wordmarkVariant.iconSize === 'object'
    ? wordmarkVariant.iconSize
    : { xs: wordmarkVariant.iconSize, md: wordmarkVariant.iconSize };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showIcon ? 0.85 : 0,
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: wordmarkVariant.letterSpacing,
        lineHeight: wordmarkVariant.lineHeight,
        whiteSpace: 'nowrap',
        color,
        ...sx,
      }}
      {...props}
    >
      {showIcon ? (
        <Box
          component="img"
          src={lifelogMark}
          alt=""
          aria-hidden="true"
          sx={{
            display: 'block',
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
            flexShrink: 0,
          }}
          />
      ) : null}
      <Typography
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'baseline',
          fontSize: 0,
          lineHeight: wordmarkVariant.lineHeight,
          color,
          fontWeight: 400,
        }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            display: 'inline-block',
            fontSize: wordmarkVariant.fontSize,
            lineHeight: wordmarkVariant.lineHeight,
          }}
        >
          {'life'}
        </Box>
        <Box
          component="span"
          sx={{
            fontWeight: 400,
            display: 'inline-block',
            fontSize: wordmarkVariant.fontSize,
            lineHeight: wordmarkVariant.lineHeight,
          }}
        >
          {'log'}
        </Box>
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
