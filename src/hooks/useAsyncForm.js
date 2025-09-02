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
    ...baseOptions
  } = options;

  const operation = useAsyncOperation({
    ...baseOptions,
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
  const submitForm = async (submitOperation, formData) => {
    try {
      // Run validation if provided
      if (validate) {
        await validate(formData);
      }

      // Execute the operation
      return await operation.execute(submitOperation);
      
    } catch (validationError) {
      // Handle validation errors
      operation.reset(); // Clear loading state
      throw validationError;
    }
  };

  /**
   * Check if form can be submitted (not loading and validation passes)
   */
  const canSubmit = operation.canExecute;

  return {
    ...operation,
    submitForm,
    canSubmit
  };
};

export default useAsyncForm;