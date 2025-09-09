/**
 * Completely suppresses ResizeObserver errors using multiple approaches
 * This is the nuclear option - it will eliminate all ResizeObserver loop errors
 */

const suppressAllResizeObserverErrors = () => {
  if (typeof window === 'undefined') return;

  // 1. Override console.error to filter ResizeObserver messages
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Convert all arguments to strings and check for ResizeObserver
    const message = args.map(arg => String(arg)).join(' ');
    if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return; // Completely ignore these errors
    }
    return originalConsoleError.apply(console, args);
  };

  // 2. Override window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
      return true; // Suppress the error
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // 3. Override window.addEventListener to catch error events
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error') {
      const wrappedListener = function(event) {
        if (event.message && event.message.includes('ResizeObserver loop')) {
          event.stopImmediatePropagation();
          event.preventDefault();
          return false;
        }
        if (typeof listener === 'function') {
          return listener.call(this, event);
        } else if (listener && typeof listener.handleEvent === 'function') {
          return listener.handleEvent.call(listener, event);
        }
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // 4. Handle unhandled promise rejections
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    if (event.reason && event.reason.toString().includes('ResizeObserver loop')) {
      event.preventDefault();
      return true;
    }
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(this, event);
    }
    return false;
  };

  // 5. Replace ResizeObserver with a safer version
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    
    window.ResizeObserver = class SafeResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.observer = new OriginalResizeObserver((entries, observer) => {
          // Use setTimeout to break the synchronous call chain
          setTimeout(() => {
            try {
              this.callback(entries, observer);
            } catch (error) {
              // Silently ignore ResizeObserver loop errors
              if (!error.message || !error.message.includes('ResizeObserver loop')) {
                console.error('ResizeObserver callback error:', error);
              }
            }
          }, 0);
        });
      }

      observe(...args) {
        return this.observer.observe(...args);
      }

      unobserve(...args) {
        return this.observer.unobserve(...args);
      }

      disconnect(...args) {
        return this.observer.disconnect(...args);
      }
    };
  }

  // 6. Monkey patch Error constructor for extra safety
  const OriginalError = window.Error;
  window.Error = function(message, ...args) {
    if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
      // Return a neutered error that won't show up
      const silentError = new OriginalError('Suppressed ResizeObserver error', ...args);
      silentError.message = '';
      silentError.toString = () => '';
      return silentError;
    }
    return new OriginalError(message, ...args);
  };
  
  // Preserve Error prototype
  window.Error.prototype = OriginalError.prototype;
};

export default suppressAllResizeObserverErrors;