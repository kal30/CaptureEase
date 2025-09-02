import React from 'react';
import { CircularProgress, Box, Fade, Zoom } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import GradientButton from './GradientButton';

/**
 * EnhancedLoadingButton - Beautiful loading button with multiple animation styles
 * 
 * Loading Styles Available:
 * - 'spinner' - Classic spinning circle
 * - 'dots' - Animated dots
 * - 'pulse' - Pulsing effect
 * - 'waves' - Wave animation
 * - 'heartbeat' - Heartbeat pulse
 * 
 * Usage:
 * <EnhancedLoadingButton 
 *   loading={isSubmitting}
 *   loadingStyle="waves"
 *   loadingText="Saving..."
 *   variant="gradient"
 * >
 *   Save Changes
 * </EnhancedLoadingButton>
 */
const EnhancedLoadingButton = ({
  loading = false,
  loadingStyle = 'spinner', // 'spinner', 'dots', 'pulse', 'waves', 'heartbeat'
  loadingText = 'Loading...',
  loadingIcon = null, // Custom loading icon/image
  disabled = false,
  children,
  ...buttonProps
}) => {
  const theme = useTheme();

  // Animated dots component
  const AnimatedDots = () => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            animation: 'dotPulse 1.4s ease-in-out infinite both',
            animationDelay: `${i * 0.2}s`,
            '@keyframes dotPulse': {
              '0%, 80%, 100%': {
                transform: 'scale(0.8)',
                opacity: 0.5,
              },
              '40%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );

  // Pulse animation component
  const PulseAnimation = () => (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(0.8)',
            opacity: 1,
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: 0.7,
          },
          '100%': {
            transform: 'scale(0.8)',
            opacity: 1,
          },
        },
      }}
    />
  );

  // Wave animation component
  const WaveAnimation = () => (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            height: 16,
            backgroundColor: 'currentColor',
            borderRadius: 1,
            animation: 'wave 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
            '@keyframes wave': {
              '0%, 40%, 100%': {
                transform: 'scaleY(0.4)',
                opacity: 0.7,
              },
              '20%': {
                transform: 'scaleY(1)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );

  // Heartbeat animation component
  const HeartbeatAnimation = () => (
    <Box
      sx={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '"♥"',
          fontSize: '18px',
          color: 'currentColor',
          animation: 'heartbeat 1.5s ease-in-out infinite',
        },
        '@keyframes heartbeat': {
          '0%': {
            transform: 'scale(1)',
          },
          '14%': {
            transform: 'scale(1.3)',
          },
          '28%': {
            transform: 'scale(1)',
          },
          '42%': {
            transform: 'scale(1.3)',
          },
          '70%': {
            transform: 'scale(1)',
          },
        },
      }}
    />
  );

  // Get loading component based on style
  const getLoadingComponent = () => {
    if (loadingIcon) {
      return (
        <Zoom in={loading}>
          <Box component="img" src={loadingIcon} sx={{ width: 20, height: 20 }} />
        </Zoom>
      );
    }

    switch (loadingStyle) {
      case 'dots':
        return <AnimatedDots />;
      case 'pulse':
        return <PulseAnimation />;
      case 'waves':
        return <WaveAnimation />;
      case 'heartbeat':
        return <HeartbeatAnimation />;
      case 'spinner':
      default:
        return (
          <CircularProgress
            size={20}
            sx={{
              color: 'currentColor',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
        );
    }
  };

  // Enhanced button styles for loading state
  const getLoadingStyles = () => {
    const baseLoadingStyles = {
      cursor: 'not-allowed',
      position: 'relative',
      overflow: 'hidden',
    };

    // Add shimmer effect for gradient buttons
    if (buttonProps.variant === 'gradient' || buttonProps.variant?.includes('gradient')) {
      return {
        ...baseLoadingStyles,
        '&::before': loading ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: 'shimmer 2s infinite',
        } : {},
        '@keyframes shimmer': {
          '0%': {
            left: '-100%',
          },
          '100%': {
            left: '100%',
          },
        },
      };
    }

    return baseLoadingStyles;
  };

  return (
    <GradientButton
      {...buttonProps}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getLoadingComponent()}
            </Box>
          </Fade>
        ) : (
          buttonProps.startIcon
        )
      }
      sx={{
        ...getLoadingStyles(),
        ...(buttonProps.sx || {}),
      }}
    >
      <Fade in={!loading} unmountOnExit>
        <span>{children}</span>
      </Fade>
      <Fade in={loading} unmountOnExit>
        <Box
          sx={{
            position: loading ? 'absolute' : 'static',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {!buttonProps.startIcon && getLoadingComponent()}
          <span>{loadingText}</span>
        </Box>
      </Fade>
    </GradientButton>
  );
};

export default EnhancedLoadingButton;