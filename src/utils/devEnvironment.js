export const isLocalDevHost = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

export const DEV_BUILD_LABEL = 'LOCAL BUILD';
