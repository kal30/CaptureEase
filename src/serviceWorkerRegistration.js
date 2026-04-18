// This is a simple service worker registration file to enable PWA functionality.

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const UPDATE_AVAILABLE_EVENT = 'lifelog:sw-update-available';
const RELOAD_REQUESTED_KEY = 'lifelog:sw-update-reload-requested';
let registrationStarted = false;
let loadListenerAttached = false;

function announceServiceWorkerUpdate(registration) {
  if (typeof window === 'undefined' || !registration?.waiting) return;

  window.dispatchEvent(
    new CustomEvent(UPDATE_AVAILABLE_EVENT, {
      detail: { registration },
    })
  );
}

export function register() {
  if (!('serviceWorker' in navigator) || registrationStarted) {
    return;
  }

  const startRegistration = () => {
    if (registrationStarted) {
      return;
    }

    registrationStarted = true;
    const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

    navigator.serviceWorker.register(swUrl).then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);

      registration.update();
      announceServiceWorkerUpdate(registration);

      const updateCheck = window.setInterval(() => {
        registration.update().catch((error) => {
          console.error('Service Worker update check failed:', error);
        });
      }, UPDATE_CHECK_INTERVAL_MS);

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        const shouldReload = window.sessionStorage.getItem(RELOAD_REQUESTED_KEY) === '1';
        if (!shouldReload) {
          return;
        }

        window.sessionStorage.removeItem(RELOAD_REQUESTED_KEY);
        window.location.reload();
      });

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            announceServiceWorkerUpdate(registration);
          }
        });
      });

      window.addEventListener('beforeunload', () => {
        window.clearInterval(updateCheck);
      });
    }).catch((error) => {
      registrationStarted = false;
      console.error('Service Worker registration failed:', error);
    });
  };

  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    startRegistration();
    return;
  }

  if (!loadListenerAttached) {
    loadListenerAttached = true;
    window.addEventListener('load', startRegistration, { once: true });
  }
}

export function requestServiceWorkerReload() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(RELOAD_REQUESTED_KEY, '1');
}

// Unregister the service worker (optional, for testing or disabling the PWA)
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
