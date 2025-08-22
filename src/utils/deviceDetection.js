import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

/**
 * Custom hook to detect device type and screen size
 */
export const useDeviceType = () => {
  const theme = useTheme();
  
  // MUI breakpoints: xs (0-600px), sm (600-900px), md (900-1200px), lg (1200-1536px), xl (1536px+)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // > 900px
  
  // More specific tablet detection
  const isIPad = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isLandscapeTablet = useMediaQuery('(min-width: 900px) and (max-width: 1200px) and (orientation: landscape)');
  
  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isIPad,
    isLandscapeTablet,
    isTouchDevice,
    // Specific device categories
    isMobileDevice: isMobile,
    isTabletDevice: isTablet || isIPad,
    isDesktopDevice: isDesktop && !isTouchDevice
  };
};

/**
 * Device-specific component wrapper
 */
export const DeviceSpecific = ({ 
  mobile, 
  tablet, 
  desktop, 
  children,
  fallback = null 
}) => {
  const { isMobileDevice, isTabletDevice, isDesktopDevice } = useDeviceType();
  
  if (isMobileDevice && mobile) return mobile;
  if (isTabletDevice && tablet) return tablet;
  if (isDesktopDevice && desktop) return desktop;
  
  return children || fallback;
};

/**
 * Get device-specific styles
 */
export const useDeviceStyles = () => {
  const { isMobileDevice, isTabletDevice, isDesktopDevice } = useDeviceType();
  
  return {
    container: {
      padding: isMobileDevice ? '8px' : isTabletDevice ? '16px' : '24px',
      maxWidth: isMobileDevice ? '100%' : isTabletDevice ? '768px' : '1200px',
      margin: '0 auto'
    },
    spacing: isMobileDevice ? 1 : isTabletDevice ? 2 : 3,
    fontSize: {
      h1: isMobileDevice ? '1.5rem' : isTabletDevice ? '2rem' : '2.5rem',
      h2: isMobileDevice ? '1.25rem' : isTabletDevice ? '1.5rem' : '2rem',
      body: isMobileDevice ? '0.875rem' : isTabletDevice ? '1rem' : '1rem'
    }
  };
};