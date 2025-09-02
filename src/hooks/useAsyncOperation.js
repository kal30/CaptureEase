import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for handling async operations with consistent loading/error states
 * Eliminates boilerplate and provides consistent UX across the app
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback when operation succeeds
 * @param {Function} options.onError - Callback when operation fails
 * @param {boolean} options.preventDuplicates - Prevent duplicate executions (default: true)
 * @returns {Object} - { execute, loading, error, success, reset }
 */
export const useAsyncOperation = (options = {}) => {
  const {
    onSuccess,
    onError,
    preventDuplicates = true
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Track current operation to prevent duplicates
  const currentOperation = useRef(null);

  /**
   * Execute an async operation with consistent error handling
   * @param {Function} operation - Async function to execute
   * @param {Object} operationOptions - Per-operation options
   */
  const execute = useCallback(async (operation, operationOptions = {}) => {
    // Prevent duplicate executions if enabled
    if (preventDuplicates && loading) {
      console.warn('useAsyncOperation: Preventing duplicate execution');
      return null;
    }

    // Clear previous state
    setError(null);
    setSuccess(false);
    setLoading(true);

    const operationId = Symbol('operation');
    currentOperation.current = operationId;

    try {
      // Execute the operation
      const result = await operation();
      
      // Check if this operation is still current (prevents race conditions)
      if (currentOperation.current !== operationId) {
        console.warn('useAsyncOperation: Operation was superseded');
        return null;
      }

      // Success!
      setSuccess(true);
      setLoading(false);

      // Call success callbacks
      if (onSuccess) onSuccess(result);
      if (operationOptions.onSuccess) operationOptions.onSuccess(result);

      return result;

    } catch (err) {
      // Check if this operation is still current
      if (currentOperation.current !== operationId) {
        console.warn('useAsyncOperation: Failed operation was superseded');
        return null;
      }

      // Handle error
      const errorMessage = err?.message || 'An unexpected error occurred';
      setError(errorMessage);
      setSuccess(false);
      setLoading(false);

      // Call error callbacks
      if (onError) onError(err);
      if (operationOptions.onError) operationOptions.onError(err);

      // Re-throw if no error handlers (allows component to handle if needed)
      if (!onError && !operationOptions.onError) {
        throw err;
      }

      return null;
    }
  }, [loading, onSuccess, onError, preventDuplicates]);

  /**
   * Reset all states to initial values
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    currentOperation.current = null;
  }, []);

  /**
   * Clear error state only
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if operation can be executed (not loading if duplicate prevention is on)
   */
  const canExecute = !preventDuplicates || !loading;

  return {
    execute,
    loading,
    error,
    success,
    reset,
    clearError,
    canExecute
  };
};

/**
 * Variant hook for operations that should show success briefly then auto-clear
 * @param {Object} options - Same as useAsyncOperation plus autoResetDelay
 */
export const useAsyncOperationWithAutoReset = (options = {}) => {
  const { autoResetDelay = 3000, ...baseOptions } = options;
  const operation = useAsyncOperation(baseOptions);
  const timeoutRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const result = await operation.execute(...args);
    
    // Auto-reset after success
    if (result !== null) {
      timeoutRef.current = setTimeout(() => {
        operation.reset();
      }, autoResetDelay);
    }

    return result;
  }, [operation, autoResetDelay]);

  return {
    ...operation,
    execute
  };
};

export default useAsyncOperation;