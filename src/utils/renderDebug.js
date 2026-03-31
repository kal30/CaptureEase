import { useEffect } from 'react';

const isDev = process.env.NODE_ENV === 'development';

const getStore = () => {
  if (!isDev || typeof window === 'undefined') {
    return null;
  }

  if (!window.__captureezRenderDebug) {
    window.__captureezRenderDebug = {};
  }

  return window.__captureezRenderDebug;
};

export const trackRenderDebug = (name, details = {}) => {
  const store = getStore();
  if (!store) {
    return;
  }

  const current = store[name] || {
    mounts: 0,
    unmounts: 0,
    renders: 0,
    details: {},
    lastRenderAt: null,
  };

  current.renders += 1;
  current.details = details;
  current.lastRenderAt = new Date().toLocaleTimeString();

  store[name] = current;
};

export const useMountDebug = (name) => {
  useEffect(() => {
    const store = getStore();
    if (!store) {
      return undefined;
    }

    const current = store[name] || {
      mounts: 0,
      unmounts: 0,
      renders: 0,
      details: {},
      lastRenderAt: null,
    };

    current.mounts += 1;
    store[name] = current;

    return () => {
      const latest = getStore()?.[name];
      if (latest) {
        latest.unmounts += 1;
      }
    };
  }, [name]);
};

export const getRenderDebugSnapshot = () => {
  return getStore() || {};
};
