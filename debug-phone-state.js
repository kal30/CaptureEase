// Debug script to check phone verification state
// Run this in the browser console on any CaptureEase page

async function checkPhoneState() {
  try {
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    
    const auth = getAuth();
    const db = getFirestore();
    
    if (!auth.currentUser) {
      console.log('❌ Not authenticated');
      return;
    }
    
    console.log('🔍 Checking phone state for user:', auth.currentUser.uid);
    
    // Check user document
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📄 User data:', {
        phone: userData.phone,
        phoneVerified: userData.phoneVerified,
        phoneLinked: userData.phoneLinked,
        defaultChildId: userData.defaultChildId
      });
      
      // Check phone index if phone exists
      if (userData.phone) {
        const phoneIndexDoc = await getDoc(doc(db, 'phone_index', userData.phone));
        console.log('📞 Phone index exists:', phoneIndexDoc.exists());
        if (phoneIndexDoc.exists()) {
          console.log('📞 Phone index data:', phoneIndexDoc.data());
        }
      }
    } else {
      console.log('❌ User document not found');
    }
    
    // Check Firebase Auth providers
    const providers = auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      phoneNumber: p.phoneNumber
    }));
    console.log('🔐 Auth providers:', providers);
    
  } catch (error) {
    console.error('Error checking phone state:', error);
  }
}

// Run the check
checkPhoneState();