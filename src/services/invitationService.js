import { db } from "./firebase";
import { collection, doc, getDoc, updateDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import functions SDK

// Initialize Firebase Functions
const functions = getFunctions(); // Use default region. If you set a specific region for your functions, pass it here: getFunctions(app, 'your-region')

// Get references to the callable Cloud Functions
const sendInvitationEmailCallable = httpsCallable(functions, 'sendInvitationEmail');


// Function to send an invitation to a team member
export const sendInvitation = async (childId, email, role, specialization = null, personalMessage = null) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("User not logged in.");
    }

    const senderName = currentUser.displayName || currentUser.email || 'A parent';

    // --- Fetch Child Name ---
    // This is crucial for the email content.
    let childName = 'A Child'; // Default placeholder
    try {
        const childDocRef = doc(db, "children", childId);
        const childDocSnap = await getDoc(childDocRef);
        if (childDocSnap.exists()) {
            childName = childDocSnap.data().name;
        } else {
            console.warn(`Child document with ID ${childId} not found.`);
        }
    } catch (error) {
        console.error("Error fetching child name:", error);
    }
    // --- End Fetch Child Name ---


    // Example invitation link - adjust to your actual registration/acceptance flow
    // This link should ideally point to a page where the invited user can register
    // and their role/child association is handled based on these URL parameters.
    const invitationLink = `${window.location.origin}/register?inviteEmail=${encodeURIComponent(email)}&childId=${childId}&role=${role}`;

    try {
        // 1. Check if the user already exists in Firebase Auth
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);

        if (signInMethods.length > 0) {
            // User exists: Assign role directly in Firestore
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userId = userDoc.id;

                const childRef = doc(db, "children", childId);
                if (role === "caregiver") {
                    await updateDoc(childRef, {
                        "users.caregivers": arrayUnion(userId),
                    });
                } else if (role === "therapist") {
                    await updateDoc(childRef, {
                        "users.therapists": arrayUnion(userId),
                    });
                    // Optionally update therapist's specialization if needed
                    // await updateDoc(userDoc.ref, { specialization: specialization });
                }
                return { status: "assigned", message: `User ${email} assigned as ${role}.` };
            } else {
                // User exists in Auth but not in Firestore 'users' collection (unlikely but possible)
                console.warn(`User ${email} exists in Auth but not in Firestore users collection. Sending invitation email.`);
                // Send email via Cloud Function
                await sendInvitationEmailCallable({
                    recipientEmail: email,
                    childName,
                    role,
                    senderName,
                    invitationLink,
                    personalMessage // Pass the personal message
                });
                // Optional: Send SMS notification (uncomment and provide recipientPhoneNumber if you collect it)
                // await sendSmsNotificationCallable({ recipientPhoneNumber: '+15551234567', messageBody: `Hi! ${senderName} invited you to ${childName}'s CareTeam. Check your email.` });
                return { status: "invited", message: `Invitation email sent to ${email}.` };
            }
        } else {
            // User does not exist: Send invitation email via Cloud Function
            await sendInvitationEmailCallable({
                recipientEmail: email,
                childName,
                role,
                senderName,
                invitationLink,
                personalMessage // Pass the personal message
            });
            // Optional: Send SMS notification (uncomment and provide recipientPhoneNumber if you collect it)
            // await sendSmsNotificationCallable({ recipientPhoneNumber: '+15551234567', messageBody: `Hi! ${senderName} invited you to ${childName}'s CareTeam. Check your email.` });
            return { status: "invited", message: `Invitation email sent to ${email}.` };
        }
    } catch (error) {
        console.error("Error sending invitation:", error);
        throw error;
    }
};
