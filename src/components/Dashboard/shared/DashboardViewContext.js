import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const DashboardViewContext = createContext(null);

export const DashboardViewProvider = ({
  children,
  childOptions = [],
  initialActiveChildId = null,
  onActiveChildChange,
}) => {
  const childOptionsKey = useMemo(
    () => childOptions.map((child) => child.id).join('|'),
    [childOptions]
  );
  const firstChildId = childOptions[0]?.id || null;
  const [activeChildId, setActiveChildId] = useState(initialActiveChildId || childOptions[0]?.id || null);
  const [mobileView, setMobileView] = useState(childOptions.length > 0 ? 'child' : 'switchboard');
  const lastSyncedChildIdRef = useRef(null);

  useEffect(() => {
    if (!childOptions.length) {
      setActiveChildId((current) => (current !== null ? null : current));
      setMobileView((current) => (current !== 'switchboard' ? 'switchboard' : current));
      return;
    }

    const hasActiveChild = childOptions.some((child) => child.id === activeChildId);
    if (!hasActiveChild) {
      const nextChildId = initialActiveChildId && childOptions.some((child) => child.id === initialActiveChildId)
        ? initialActiveChildId
        : firstChildId;
      setActiveChildId((current) => (current !== nextChildId ? nextChildId : current));
    }

    if (childOptions.length === 1) {
      setMobileView((current) => (current !== 'child' ? 'child' : current));
    }
  }, [activeChildId, childOptions.length, childOptionsKey, firstChildId, initialActiveChildId]);

  useEffect(() => {
    if (activeChildId && lastSyncedChildIdRef.current !== activeChildId) {
      lastSyncedChildIdRef.current = activeChildId;
      onActiveChildChange?.(activeChildId);
    }
  }, [activeChildId, onActiveChildChange]);

  useEffect(() => {
    const handleOpenSwitchboard = () => {
      setMobileView('switchboard');
    };

    window.addEventListener('captureez:open-switchboard', handleOpenSwitchboard);
    return () => window.removeEventListener('captureez:open-switchboard', handleOpenSwitchboard);
  }, []);

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
