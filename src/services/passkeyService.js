import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const ENDPOINT_BASE =
  'https://us-central1-captureease-ef82f.cloudfunctions.net';

/**
 * Check if passkeys are supported in this browser
 */
export const isPasskeySupported = () => {
  return !!(navigator.credentials && navigator.credentials.create);
};

const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in first');
  }
  return user.getIdToken();
};

const postJson = async (path, body, token = null) => {
  const response = await fetch(`${ENDPOINT_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error || 'Request failed';
    const err = new Error(message);
    err.code = response.status;
    throw err;
  }
  return data;
};

/**
 * Register a new passkey for a user
 */
export const registerPasskey = async () => {
  try {
    if (!isPasskeySupported()) {
      throw new Error('Passkeys are not supported in this browser');
    }

    const token = await getAuthToken();
    const { options, challengeId } = await postJson(
      'passkeyRegisterOptions',
      {},
      token
    );
    if (!options || !challengeId) {
      throw new Error('Passkey registration unavailable. Please try again.');
    }
    if (!options.user || !options.user.id) {
      throw new Error('Passkey setup failed. Please refresh and try again.');
    }
    if (!options.challenge) {
      throw new Error('Passkey setup failed. Please refresh and try again.');
    }

    const registrationResponse = await startRegistration(options);
    if (!registrationResponse || !registrationResponse.id) {
      throw new Error('Passkey registration was not completed.');
    }
    await postJson(
      'passkeyRegisterVerify',
      { challengeId, response: registrationResponse },
      token
    );

    return { success: true, credentialID: registrationResponse.id };
  } catch (error) {
    console.error('Passkey registration failed:', error);
    throw error;
  }
};

/**
 * Authenticate using passkey
 */
export const authenticateWithPasskey = async (userEmail = null) => {
  try {
    if (!isPasskeySupported()) {
      throw new Error('Passkeys are not supported in this browser');
    }

    const { options, challengeId } = await postJson('passkeyAuthOptions', {
      email: userEmail || null,
    });

    const authenticationResponse = await startAuthentication(options);
    const { customToken, userId } = await postJson('passkeyAuthVerify', {
      challengeId,
      response: authenticationResponse,
    });

    const auth = getAuth();
    const credential = await signInWithCustomToken(auth, customToken);

    return {
      success: true,
      credentialID: authenticationResponse.id,
      userHandle: authenticationResponse.response.userHandle,
      userId,
      user: credential.user,
    };
  } catch (error) {
    console.error('Passkey authentication failed:', error);
    throw error;
  }
};

/**
 * Check if user has any registered passkeys
 */
export const hasPasskeys = async () => {
  try {
    const token = await getAuthToken();
    const data = await postJson('passkeyList', {}, token);
    return (data.passkeys || []).length > 0;
  } catch (error) {
    console.error('Error checking for passkeys:', error);
    return false;
  }
};

/**
 * Remove a passkey from user's account
 */
export const removePasskey = async (userID, credentialID) => {
  try {
    const token = await getAuthToken();
    return await postJson('passkeyRemove', { credentialID }, token);
  } catch (error) {
    console.error('Error removing passkey:', error);
    throw error;
  }
};

/**
 * Get user's passkeys list
 */
export const getUserPasskeys = async () => {
  try {
    const token = await getAuthToken();
    const data = await postJson('passkeyList', {}, token);
    return (data.passkeys || []).map((passkey) => ({
      credentialID: passkey.credentialID,
      deviceType: passkey.deviceType,
      createdAt: passkey.createdAt,
      lastUsed: passkey.lastUsed,
    }));
  } catch (error) {
    console.error('Error getting user passkeys:', error);
    return [];
  }
};
