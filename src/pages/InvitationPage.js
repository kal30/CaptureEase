import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../services/firebase";
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";

const InvitationPage = () => {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!currentUser) {
        setError("Please log in to accept the invitation.");
        setLoading(false);
        return;
      }

      try {
        const invitationRef = doc(db, "invitations", invitationId);
        const invitationSnap = await getDoc(invitationRef);

        if (invitationSnap.exists()) {
          const invitationData = invitationSnap.data();
          // Support both old therapistEmail and new generic email field
          const invitedEmail = invitationData.email || invitationData.therapistEmail;
          if (invitedEmail === currentUser.email) {
            setInvitation(invitationData);
          } else {
            setError("This invitation is not intended for you.");
          }
        } else {
          setError("Invalid invitation link.");
        }
      } catch (err) {
        setError("Failed to fetch invitation details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId, currentUser]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      // 1. Update the child document based on role
      const childRef = doc(db, "children", invitation.childId);
      const childSnap = await getDoc(childRef);
      if (childSnap.exists()) {
        const childData = childSnap.data();
        const role = invitation.role || 'therapist'; // Default to therapist for backward compatibility
        
        let updateField;
        switch (role) {
          case 'care_partner':
            updateField = "users.care_partners";
            break;
          case 'caregiver':
            updateField = "users.caregivers";
            break;
          case 'therapist':
          default:
            updateField = "users.therapists";
            break;
        }
        
        const currentUsers = childData.users?.[role === 'care_partner' ? 'care_partners' : role === 'caregiver' ? 'caregivers' : 'therapists'] || [];
        const updatedUsers = [...currentUsers, currentUser.uid];
        
        await updateDoc(childRef, {
          [updateField]: updatedUsers,
        });
      }

      // 2. Update the invitation document
      const invitationRef = doc(db, "invitations", invitationId);
      await updateDoc(invitationRef, {
        status: "accepted",
        acceptedBy: currentUser.uid,
        acceptedAt: new Date(),
      });

      // 3. Redirect to the dashboard
      navigate("/dashboard");

      const functions = getFunctions(app, 'us-central1');
      const sendInvitationEmail = httpsCallable(
        functions,
        "sendInvitationEmail"
      );

      try {
        const invitedEmail = invitation.email || invitation.therapistEmail;
        await sendInvitationEmail({
          to: invitedEmail,
          subject: "Invitation Accepted",
          message: `You have been added to the care team for child ${invitation.childId}.`,
        });
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }
    } catch (err) {
      setError("Failed to accept invitation.");
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Invitation
        </Typography>
        {invitation && (
          <>
            <Typography variant="body1" sx={{ mb: 4 }}>
              You have been invited to join the care team for a child.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              disabled={loading}
            >
              Accept Invitation
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default InvitationPage;
