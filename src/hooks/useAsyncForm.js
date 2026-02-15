import { useState, useCallback } from 'react';
import { useAsyncOperation } from './useAsyncOperation';

/**
 * Specialized hook for form submissions with async operations
 * Provides form-specific functionality like validation and auto-close
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback (receives result)
 * @param {Function} options.onError - Error callback (receives error)
 * @param {Function} options.validate - Validation function (should throw if invalid)
 * @param {boolean} options.autoClose - Auto-close form on success (default: true)
 * @param {Function} options.onClose - Close callback
 * @returns {Object} - Extended useAsyncOperation result with form helpers
 */
export const useAsyncForm = (options = {}) => {
  const {
    validate,
    autoClose = true,
    onClose,
    onSuccess,
    onError,
    ...baseOptions
  } = options;

  // Local error state for validation errors
  const [validationError, setValidationError] = useState(null);

  const operation = useAsyncOperation({
    ...baseOptions,
    onError: (err) => {
      // Call original error handler if provided
      if (onError) onError(err);
    },
    onSuccess: (result) => {
      // Call original success handler
      if (onSuccess) onSuccess(result);
      
      // Auto-close if enabled
      if (autoClose && onClose) {
        onClose();
      }
    }
  });

  /**
   * Submit form with validation and error handling
   * @param {Function} submitOperation - Async operation to perform
   * @param {any} formData - Form data to validate (optional)
   */
  const submitForm = useCallback(async (submitOperation, formData) => {
    // Clear any previous validation error
    setValidationError(null);
    
    try {
      // Run validation if provided
      if (validate) {
        await validate(formData);
      }

      // Execute the operation
      return await operation.execute(submitOperation);
      
    } catch (validationErr) {
      // Handle validation errors by storing them in state
      console.error('Form validation error:', validationErr);
      const errorMessage = validationErr?.message || 'Validation failed';
      setValidationError(errorMessage);
      
      // Call error handler if provided
      if (onError) onError(validationErr);
      
      return null;
    }
  }, [validate, operation, onError]);

  /**
   * Reset form state including validation errors
   */
  const reset = useCallback(() => {
    setValidationError(null);
    operation.reset();
  }, [operation]);

  /**
   * Clear error state (both validation and operation errors)
   */
  const clearError = useCallback(() => {
    setValidationError(null);
    operation.clearError();
  }, [operation]);

  /**
   * Check if form can be submitted (not loading and validation passes)
   */
  const canSubmit = operation.canExecute;

  // Combine validation error with operation error
  const error = validationError || operation.error;

  return {
    ...operation,
    error,
    loading: operation.loading,
    success: operation.success,
    submitForm,
    canSubmit,
    reset,
    clearError
  };
};

export default useAsyncForm;