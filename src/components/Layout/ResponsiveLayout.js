import React from 'react';
import { useDeviceType } from '../../utils/deviceDetection';
import MobileLayout from './MobileLayout';
import TabletLayout from './TabletLayout';
import DesktopLayout from './DesktopLayout';

/**
 * Universal responsive layout wrapper
 * Automatically chooses the right layout based on device type
 */
const ResponsiveLayout = ({ 
  children, 
  pageTitle,
  showBottomNav = true,
  showSidebar = true,
  fullWidth = false,
  customMobile = null,
  customTablet = null,
  customDesktop = null,
  sx = {}
}) => {
  const { isMobileDevice, isTabletDevice } = useDeviceType();

  // If custom layouts provided, use those
  if (isMobileDevice && customMobile) {
    return customMobile;
  }
  
  if (isTabletDevice && customTablet) {
    return customTablet;
  }
  
  if (customDesktop) {
    return customDesktop;
  }

  // Default responsive layouts
  if (isMobileDevice) {
    return (
      <MobileLayout 
        pageTitle={pageTitle}
        showBottomNav={showBottomNav}
      >
        {children}
      </MobileLayout>
    );
  }

  if (isTabletDevice) {
    return (
      <TabletLayout 
        pageTitle={pageTitle}
        showSidebar={showSidebar}
      >
        {children}
      </TabletLayout>
    );
  }

  // Desktop layout (default web experience)
  return (
    <DesktopLayout 
      pageTitle={pageTitle}
      fullWidth={fullWidth}
      sx={sx}
    >
      {children}
    </DesktopLayout>
  );
};

export default ResponsiveLayout;