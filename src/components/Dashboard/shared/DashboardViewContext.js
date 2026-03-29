import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DashboardViewContext = createContext(null);

export const DashboardViewProvider = ({
  children,
  childOptions = [],
  initialActiveChildId = null,
  onActiveChildChange,
}) => {
  const [activeChildId, setActiveChildId] = useState(initialActiveChildId || childOptions[0]?.id || null);
  const [mobileView, setMobileView] = useState(childOptions.length === 1 ? 'child' : 'switchboard');

  useEffect(() => {
    if (initialActiveChildId && initialActiveChildId !== activeChildId) {
      const exists = childOptions.some((child) => child.id === initialActiveChildId);
      if (exists) {
        setActiveChildId(initialActiveChildId);
      }
    }
  }, [activeChildId, childOptions, initialActiveChildId]);

  useEffect(() => {
    if (!childOptions.length) {
      setActiveChildId(null);
      setMobileView('switchboard');
      return;
    }

    const hasActiveChild = childOptions.some((child) => child.id === activeChildId);
    if (!hasActiveChild) {
      const nextChildId = initialActiveChildId && childOptions.some((child) => child.id === initialActiveChildId)
        ? initialActiveChildId
        : childOptions[0].id;
      setActiveChildId(nextChildId);
    }

    if (childOptions.length === 1) {
      setMobileView('child');
    }
  }, [activeChildId, childOptions, initialActiveChildId]);

  useEffect(() => {
    if (activeChildId) {
      onActiveChildChange?.(activeChildId);
    }
  }, [activeChildId, onActiveChildChange]);

  const value = useMemo(() => ({
    activeChildId,
    setActiveChildId,
    mobileView,
    setMobileView,
    enterChild: (childId) => {
      setActiveChildId(childId);
      setMobileView('child');
    },
    goToSwitchboard: () => setMobileView('switchboard'),
  }), [activeChildId, mobileView]);

  return (
    <DashboardViewContext.Provider value={value}>
      {children}
    </DashboardViewContext.Provider>
  );
};

export const useDashboardView = () => {
  const context = useContext(DashboardViewContext);
  if (!context) {
    throw new Error('useDashboardView must be used within DashboardViewProvider');
  }
  return context;
};
