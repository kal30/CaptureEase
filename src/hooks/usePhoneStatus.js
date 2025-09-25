import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase';

/**
 * Hook to manage phone verification status and child SMS notification settings
 * 
 * @param {string} uid - User ID (optional, will use current auth user if not provided)
 * @param {Object} childDoc - Child document data (optional)
 * @returns {Object} Phone and notification status
 */
export const usePhoneStatus = (uid = null, childDoc = null) => {
  const [phoneStatus, setPhoneStatus] = useState({
    verified: false,
    phone: null,
    linked: false,
    childSmsEnabled: false,
    loading: true,
    error: null
  });

  const auth = getAuth();
  const currentUid = uid || auth.currentUser?.uid;

  useEffect(() => {
    let mounted = true;

    const loadPhoneStatus = async () => {
      if (!currentUid) {
        if (mounted) {
          setPhoneStatus(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      try {
        // Load user phone verification status
        const userDoc = await getDoc(doc(db, 'users', currentUid));
        let userPhoneStatus = {
          verified: false,
          phone: null,
          linked: false
        };

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userPhoneStatus = {
            verified: userData.phoneVerified === true && !!userData.phone,
            phone: userData.phone || null,
            linked: userData.phoneLinked === true
          };
        } else {
          // Check Firebase Auth providers as fallback
          if (auth.currentUser) {
            const phoneProvider = auth.currentUser.providerData.find(p => p.providerId === 'phone');
            if (phoneProvider && phoneProvider.phoneNumber) {
              userPhoneStatus = {
                verified: true,
                phone: phoneProvider.phoneNumber,
                linked: false // Will be checked separately
              };

              // Check if phone is linked by checking phone_index
              try {
                const phoneIndexDoc = await getDoc(doc(db, 'phone_index', phoneProvider.phoneNumber));
                const isLinked = phoneIndexDoc.exists() && phoneIndexDoc.data().uid === currentUid;
                userPhoneStatus.linked = isLinked;
              } catch (error) {
                console.warn('Could not check phone linking status:', error);
              }
            }
          }
        }

        // Get child SMS notification setting
        let childSmsEnabled = false;
        if (childDoc) {
          childSmsEnabled = childDoc.settings?.notifications?.smsEnabled === true;
        }

        if (mounted) {
          setPhoneStatus({
            ...userPhoneStatus,
            childSmsEnabled,
            loading: false,
            error: null
          });
        }

      } catch (error) {
        console.error('Error loading phone status:', error);
        if (mounted) {
          setPhoneStatus(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
        }
      }
    };

    loadPhoneStatus();

    return () => {
      mounted = false;
    };
  }, [currentUid, childDoc?.id, childDoc?.settings?.notifications?.smsEnabled]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      // Reload status when auth changes
      setPhoneStatus(prev => ({ ...prev, loading: true }));
    });

    return unsubscribe;
  }, []);

  return phoneStatus;
};

export default usePhoneStatus;