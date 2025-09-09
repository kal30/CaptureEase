/**
 * Authentication Navigation Service
 * Handles post-login redirects for all authentication methods
 */

import { AUTH_STORAGE_KEYS, DEFAULT_ROUTES, AUTH_ERRORS } from './constants';

/**
 * Stores the current invitation URL for later redirect after authentication
 * @param {string} invitationUrl - The full invitation URL with token
 */
export const storeInvitationContext = (invitationUrl) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.RETURN_URL, invitationUrl);
    sessionStorage.setItem(AUTH_STORAGE_KEYS.RETURN_URL, invitationUrl);
  } catch (error) {
    console.warn(AUTH_ERRORS.STORAGE_FAILED, error);
  }
};

/**
 * Gets the return URL from various sources (invitation context, state, etc.)
 * @param {object} location - React Router location object (optional)
 * @returns {string} The URL to redirect to after authentication
 */
export const getPostAuthRedirectUrl = (location = null) => {
  const storedUrl = localStorage.getItem(AUTH_STORAGE_KEYS.RETURN_URL) || 
                   sessionStorage.getItem(AUTH_STORAGE_KEYS.RETURN_URL);
  
  const stateUrl = location?.state?.returnTo;
  
  return storedUrl || stateUrl || DEFAULT_ROUTES.DASHBOARD;
};

/**
 * Clears stored authentication context
 */
export const clearAuthContext = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.RETURN_URL);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.RETURN_URL);
  } catch (error) {
    console.warn(AUTH_ERRORS.STORAGE_FAILED, error);
  }
};

/**
 * Main function to handle post-authentication redirect
 * Use this in ALL authentication success handlers
 * @param {function} navigate - React Router navigate function
 * @param {object} location - React Router location object (optional)
 * @param {object} user - Authenticated user object (optional, for logging)
 */
export const handlePostAuthRedirect = (navigate, location = null, user = null) => {
  const returnUrl = getPostAuthRedirectUrl(location);
  
  // Clear stored context before redirecting
  clearAuthContext();
  
  // Redirect to the appropriate URL
  navigate(returnUrl);
};