import { useEffect, useMemo, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

const getStandaloneMode = () => {
  if (!isBrowser) return false;

  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true
  );
};

const useStandaloneMode = () => {
  const [isStandalone, setIsStandalone] = useState(() => getStandaloneMode());

  useEffect(() => {
    if (!isBrowser) return undefined;

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleChange = () => setIsStandalone(getStandaloneMode());

    handleChange();

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleChange);
      }
    }

    window.addEventListener('focus', handleChange);
    window.addEventListener('pageshow', handleChange);

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleChange);
        } else if (typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(handleChange);
        }
      }

      window.removeEventListener('focus', handleChange);
      window.removeEventListener('pageshow', handleChange);
    };
  }, []);

  return useMemo(() => isStandalone, [isStandalone]);
};

export default useStandaloneMode;
