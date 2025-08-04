import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import AddChildModal from "../components/Dashboard/AddChildModal";
import InviteTeamMemberModal from "../components/Dashboard/InviteTeamMemberModal";
import EditChildModal from "../components/Dashboard/EditChildModal";
import ChildCard from "../components/Dashboard/ChildCard";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../services/firebase";
import LogMoodModal from "../components/Dashboard/LogMoodModal";

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [inviteTeamMemberOpen, setInviteTeamMemberOpen] = useState(false);
  const [editChildOpen, setEditChildOpen] = useState(false);
  const [logMoodOpen, setLogMoodOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // New state for expanded child
  const [expandedChildId, setExpandedChildId] = useState(null);

  // Fetch all children from Firestore in real-time
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loadingUserRole, setLoadingUserRole] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot = null; // Declare and initialize unsubscribeSnapshot here
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserDisplayName(user.displayName || user.email || "User");
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let currentRole = null;
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          currentRole = userData.role;
          setUserRole(currentRole);
          console.log("User role set to:", currentRole); // Add this line
        } else {
          console.log("User document not found.");
          setUserRole(null);
        }

        let childrenQuery;
        if (currentRole === "parent") {
          childrenQuery = query(
            collection(db, "children"),
            where("parentId", "==", user.uid)
          );
        } else if (currentRole === "therapist") {
          childrenQuery = query(
            collection(db, "children"),
            where("users.therapists", "array-contains", user.uid)
          );
        } else {
          // Handle other roles or no role, or user document not found
          setChildren([]);
          setLoadingUserRole(false);
          return;
        }

        let currentUnsubscribeSnapshot = onSnapshot(
          childrenQuery,
          (snapshot) => {
            const childrenData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setChildren(childrenData);
          }
        );
        unsubscribeSnapshot = currentUnsubscribeSnapshot;
        setLoadingUserRole(false);
      } else {
        // If user logs out, ensure children are cleared and loading state is handled
        setChildren([]);
        setLoadingUserRole(false);
        // Also, if there was a previous snapshot listener, unsubscribe it
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {userDisplayName}!
      </Typography>

      {loadingUserRole ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {userRole === 'parent' && (
            <Box sx={{ mb: 4 }}>
              <Button variant="contained" onClick={() => setAddChildOpen(true)}>
                Add Child
              </Button>
            </Box>
          )}

          <Grid container spacing={3}>
            {children.map((child) => (
              <Grid item xs={12} sm={12} md={12} key={child.id}>
                <ChildCard
                  child={child}
                  onEditClick={() => {
                    setSelectedChild(child);
                    setEditChildOpen(true);
                  }}
                  onAssignCaregiver={() => {
                    setSelectedChild(child);
                    setInviteTeamMemberOpen(true);
                  }}
                  onInviteTherapist={() => {
                    setInviteTeamMemberOpen(true);
                  }}
                  onLogMood={() => {
                    setSelectedChild(child);
                    setLogMoodOpen(true);
                  }}
                  isExpanded={expandedChildId === child.id}
                  onToggleExpand={() =>
                    setExpandedChildId(
                      expandedChildId === child.id ? null : child.id
                    )
                  }
                  userRole={userRole}
                />
              </Grid>
            ))}
          </Grid>

          <AddChildModal
            open={addChildOpen}
            onClose={() => setAddChildOpen(false)}
          />
          <InviteTeamMemberModal
            open={inviteTeamMemberOpen}
            onClose={() => setInviteTeamMemberOpen(false)}
            allChildren={children}
          />
          {editChildOpen && selectedChild && (
            <EditChildModal
              open={editChildOpen}
              onClose={() => setEditChildOpen(false)}
              child={selectedChild}
            />
          )}
          {logMoodOpen && selectedChild && (
            <LogMoodModal
              open={logMoodOpen}
              onClose={() => setLogMoodOpen(false)}
              child={selectedChild}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default Dashboard;
