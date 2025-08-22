import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configuration for WebAuthn
const rpName = 'CaptureEz';
const rpID = window.location.hostname;

/**
 * Check if passkeys are supported in this browser
 */
export const isPasskeySupported = () => {
  return !!(navigator.credentials && navigator.credentials.create);
};

/**
 * Generate registration options for a new passkey
 */
const generateRegistrationOptions = (userEmail, userName, userID) => {
  return {
    rp: {
      name: rpName,
      id: rpID,
    },
    user: {
      id: new TextEncoder().encode(userID),
      name: userEmail,
      displayName: userName || userEmail,
    },
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    timeout: 60000,
    attestation: 'direct',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  };
};

/**
 * Generate authentication options for existing passkey
 */
const generateAuthenticationOptions = (allowCredentials = []) => {
  return {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    timeout: 60000,
    rpId: rpID,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    userVerification: 'preferred',
  };
};

/**
 * Register a new passkey for a user
 */
export const registerPasskey = async (userID, userEmail, userName) => {
  try {
    if (!isPasskeySupported()) {
      throw new Error('Passkeys are not supported in this browser');
    }

    // Generate registration options
    const options = generateRegistrationOptions(userEmail, userName, userID);
    
    // Start registration process
    const registrationResponse = await startRegistration(options);

    // Store the passkey credential in Firestore
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);
    
    const passkeyData = {
      credentialID: registrationResponse.id,
      credentialPublicKey: registrationResponse.response.publicKey,
      counter: registrationResponse.response.counter || 0,
      deviceType: registrationResponse.response.authenticatorData ? 'platform' : 'cross-platform',
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    if (userDoc.exists()) {
      // Add passkey to existing user
      await updateDoc(userRef, {
        passkeys: userDoc.data().passkeys ? [...userDoc.data().passkeys, passkeyData] : [passkeyData],
        updatedAt: new Date(),
      });
    } else {
      // Create new user document with passkey
      await setDoc(userRef, {
        email: userEmail,
        displayName: userName || userEmail,
        passkeys: [passkeyData],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

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

    let allowCredentials = [];
    
    // If email provided, try to get their saved credentials
    if (userEmail) {
      // In a real implementation, you'd query your backend for this user's credentials
      // For now, we'll let the browser handle credential selection
    }

    // Generate authentication options
    const options = generateAuthenticationOptions(allowCredentials);
    
    // Start authentication process
    const authenticationResponse = await startAuthentication(options);

    // Here you would normally verify the response with your backend
    // For this demo, we'll simulate a successful authentication
    return {
      success: true,
      credentialID: authenticationResponse.id,
      userHandle: authenticationResponse.response.userHandle,
    };
  } catch (error) {
    console.error('Passkey authentication failed:', error);
    throw error;
  }
};

/**
 * Check if user has any registered passkeys
 */
export const hasPasskeys = async (userID) => {
  try {
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().passkeys) {
      return userDoc.data().passkeys.length > 0;
    }
    
    return false;
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
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().passkeys) {
      const updatedPasskeys = userDoc.data().passkeys.filter(
        passkey => passkey.credentialID !== credentialID
      );
      
      await updateDoc(userRef, {
        passkeys: updatedPasskeys,
        updatedAt: new Date(),
      });
      
      return { success: true };
    }
    
    throw new Error('No passkeys found for this user');
  } catch (error) {
    console.error('Error removing passkey:', error);
    throw error;
  }
};

/**
 * Get user's passkeys list
 */
export const getUserPasskeys = async (userID) => {
  try {
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().passkeys) {
      return userDoc.data().passkeys.map(passkey => ({
        credentialID: passkey.credentialID,
        deviceType: passkey.deviceType,
        createdAt: passkey.createdAt,
        lastUsed: passkey.lastUsed,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user passkeys:', error);
    return [];
  }
};