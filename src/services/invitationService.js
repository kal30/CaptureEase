import { db } from "./firebase";
import { collection, doc, getDoc, updateDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import { USER_ROLES } from '../constants/roles';
import { getUserRoleForChild } from './rolePermissionService';
import { updateMembersField } from './migrations/usersMembersMigration';

// Initialize Firebase Functions
const functions = getFunctions(app, 'us-central1');

// Get references to the callable Cloud Functions
const sendInvitationEmailCallable = httpsCallable(functions, 'sendInvitationEmail');


// Function to send an invitation to a team member
// IRON-CLAD SECURITY: Only Care Owner can invite
export const sendInvitation = async (childId, email, role, specialization = null, personalMessage = null) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("User not logged in.");
    }

    // CRITICAL: Server-side validation - ONLY Care Owner can invite
    const requesterRole = await getUserRoleForChild(currentUser.uid, childId);
    if (requesterRole !== USER_ROLES.CARE_OWNER) {
        throw new Error("Access denied. Only the Care Owner can invite team members for this child.");
    }

    // Validate role is one of the allowed invitation types
    const validRoles = [USER_ROLES.CARE_PARTNER, USER_ROLES.CAREGIVER, USER_ROLES.THERAPIST];
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}. Can only invite Care Partners, Caregivers, or Therapists.`);
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


    // Enhanced invitation link with role context
    const tokenData = {
        email,
        childId,
        role,
        timestamp: Date.now(),
        childName
    };
    const encodedToken = encodeURIComponent(btoa(JSON.stringify(tokenData)));
    const encodedChildName = encodeURIComponent(childName);
    const encodedRole = encodeURIComponent(role);
    
    const invitationLink = `${window.location.origin}/accept-invite?token=${encodedToken}&childName=${encodedChildName}&role=${encodedRole}`;

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
                
                // Get current data to update members field
                const childDoc = await getDoc(childRef);
                const childData = childDoc.data();
                const currentUsers = childData.users || {};
                
                // Clean role structure - NO LEGACY CODE with users.members optimization
                let updatedUsers = { ...currentUsers };
                switch (role) {
                    case USER_ROLES.CARE_PARTNER:
                        updatedUsers.care_partners = [...(currentUsers.care_partners || []), userId];
                        await updateDoc(childRef, {
                            "users.care_partners": arrayUnion(userId),
                            "users.members": updateMembersField(updatedUsers)
                        });
                        break;
                    case USER_ROLES.CAREGIVER:
                        updatedUsers.caregivers = [...(currentUsers.caregivers || []), userId];
                        await updateDoc(childRef, {
                            "users.caregivers": arrayUnion(userId),
                            "users.members": updateMembersField(updatedUsers)
                        });
                        break;
                    case USER_ROLES.THERAPIST:
                        updatedUsers.therapists = [...(currentUsers.therapists || []), userId];
                        await updateDoc(childRef, {
                            "users.therapists": arrayUnion(userId),
                            "users.members": updateMembersField(updatedUsers)
                        });
                        break;
                    default:
                        throw new Error(`Invalid role: ${role}`);
                }
                return { status: "assigned", message: `User ${email} assigned as ${role}.` };
            } else {
                // User exists in Auth but not in Firestore 'users' collection (unlikely but possible)
                console.warn(`User ${email} exists in Auth but not in Firestore users collection. Sending invitation email.`);
                // Send email via Cloud Function
                const emailResult = await sendInvitationEmailCallable({
                    recipientEmail: email,
                    childName,
                    role,
                    senderName,
                    invitationLink,
                    personalMessage // Pass the personal message
                });
                console.log('Email sent successfully:', emailResult.data);
                // Optional: Send SMS notification (uncomment and provide recipientPhoneNumber if you collect it)
                // await sendSmsNotificationCallable({ recipientPhoneNumber: '+15551234567', messageBody: `Hi! ${senderName} invited you to ${childName}'s CareTeam. Check your email.` });
                return { status: "invited", message: `Invitation email sent to ${email}.` };
            }
        } else {
            // User does not exist: Send invitation email via Cloud Function
            const emailResult = await sendInvitationEmailCallable({
                recipientEmail: email,
                childName,
                role,
                senderName,
                invitationLink,
                personalMessage // Pass the personal message
            });
            console.log('Email sent successfully:', emailResult.data);
            // Optional: Send SMS notification (uncomment and provide recipientPhoneNumber if you collect it)
            // await sendSmsNotificationCallable({ recipientPhoneNumber: '+15551234567', messageBody: `Hi! ${senderName} invited you to ${childName}'s CareTeam. Check your email.` });
            return { status: "invited", message: `Invitation email sent to ${email}.` };
        }
    } catch (error) {
        console.error("Error sending invitation:", error);
        throw error;
    }
};

// Function to send a single invitation for multiple children
// IRON-CLAD SECURITY: Only Care Owner can invite for ALL children
export const sendMultiChildInvitation = async (childIds, email, role, specialization = null, personalMessage = null) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("User not logged in.");
    }

    // CRITICAL: Validate user is Care Owner for ALL children
    for (const childId of childIds) {
        const requesterRole = await getUserRoleForChild(currentUser.uid, childId);
        if (requesterRole !== USER_ROLES.CARE_OWNER) {
            throw new Error(`Access denied. You must be the Care Owner for all selected children to send invitations.`);
        }
    }

    // Validate role is one of the allowed invitation types
    const validRoles = [USER_ROLES.CARE_PARTNER, USER_ROLES.CAREGIVER, USER_ROLES.THERAPIST];
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}. Can only invite Care Partners, Caregivers, or Therapists.`);
    }

    const senderName = currentUser.displayName || currentUser.email || 'A parent';

    // Fetch all child names
    const children = [];
    for (const childId of childIds) {
        try {
            const childDocRef = doc(db, "children", childId);
            const childDocSnap = await getDoc(childDocRef);
            if (childDocSnap.exists()) {
                children.push({
                    id: childId,
                    name: childDocSnap.data().name
                });
            }
        } catch (error) {
            console.error(`Error fetching child ${childId}:`, error);
        }
    }

    if (children.length === 0) {
        throw new Error("No valid children found for invitation");
    }

    // Create multi-child invitation token
    const tokenData = {
        email,
        childIds: children.map(c => c.id),
        childNames: children.map(c => c.name),
        role,
        timestamp: Date.now(),
        specialization
    };
    const invitationToken = btoa(JSON.stringify(tokenData));
    const encodedToken = encodeURIComponent(invitationToken);

    const invitationLink = `${window.location.origin}/accept-invite?token=${encodedToken}`;

    try {
        // Check if the user already exists
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        const userExists = signInMethods && signInMethods.length > 0;

        if (userExists) {
            // User exists: Still send invitation email (they can just log in and get access)
            const emailResult = await sendInvitationEmailCallable({
                recipientEmail: email,
                childNames: children.map(c => c.name), // Pass array of child names
                role,
                senderName,
                invitationLink,
                personalMessage,
                multiChild: true // Flag for multi-child email template
            });
            console.log('Multi-child invitation email sent to existing user:', emailResult.data);
            return { 
                status: "invited_existing_user", 
                message: `Invitation sent to existing user ${email} for ${children.length} children.`,
                children: children.map(c => c.name)
            };
        } else {
            // User doesn't exist: Send invitation to create account
            const emailResult = await sendInvitationEmailCallable({
                recipientEmail: email,
                childNames: children.map(c => c.name),
                role,
                senderName,
                invitationLink,
                personalMessage,
                multiChild: true
            });
            console.log('Multi-child invitation email sent to new user:', emailResult.data);
            return { 
                status: "invited_new_user", 
                message: `Invitation sent to ${email} for ${children.length} children.`,
                children: children.map(c => c.name)
            };
        }
    } catch (error) {
        console.error("Error sending multi-child invitation:", error);
        throw error;
    }
};
