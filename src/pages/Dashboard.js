import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import GroupIcon from "@mui/icons-material/Group";
import ChildCareIcon from "@mui/icons-material/ChildCare";

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
          console.log("User role set to:", currentRole);
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

  const isCompact = children.length > 2;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        padding: "16px 0",
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "16px",
            padding: { xs: "18px 8px", sm: "28px 18px" },
            marginBottom: "16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: "120px", sm: "140px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: "primary.main",
                fontWeight: 300,
                marginBottom: 1,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.7rem",
                  md: "2.1rem",
                  lg: "2.3rem",
                },
                lineHeight: 1.18,
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Welcome back, {userDisplayName}!
              <EmojiEmotionsIcon
                sx={{
                  fontSize: { xs: 22, sm: 28 },
                  color: "accent.main",
                  ml: 1,
                  mb: -0.5,
                  animation: "wave 1.5s infinite",
                }}
              />
            </Typography>
            <style>{`
              @keyframes wave {
                0% { transform: rotate(0deg); }
                10% { transform: rotate(14deg); }
                20% { transform: rotate(-8deg); }
                30% { transform: rotate(14deg); }
                40% { transform: rotate(-4deg); }
                50% { transform: rotate(10deg); }
                60% { transform: rotate(0deg); }
                100% { transform: rotate(0deg); }
              }
            `}</style>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.98rem", sm: "1.05rem" },
                fontWeight: 400,
                marginBottom: 2,
                maxWidth: "500px",
                lineHeight: 1.5,
                letterSpacing: "0.01em",
              }}
            >
              Manage your children's care and track their progress with our
              comprehensive tools
            </Typography>

            {/* Quick Stats */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                marginTop: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  padding: "6px 14px",
                  bgcolor: "primary.main",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minWidth: "90px",
                }}
              >
                <ChildCareIcon
                  sx={{ color: "#FFFFFF", fontSize: 16, mr: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {children.length}{" "}
                  {children.length === 1 ? "Child" : "Children"}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  padding: "6px 14px",
                  backgroundColor: "rgba(91,140,81,0.1)",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minWidth: "110px",
                }}
              >
                <GroupIcon
                  sx={{ color: "secondary.main", fontSize: 16, mr: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "secondary.main",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Active Care Team
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {loadingUserRole ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress
              size={60}
              sx={{
                color: "primary.main",
              }}
            />
          </Box>
        ) : (
          <>
            {userRole === "parent" && (
              <Box
                sx={{
                  marginBottom: "32px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => setAddChildOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: "primary.main",
                    color: "#FFFFFF",
                    padding: "16px 32px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: "16px",
                    boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                    "&:hover": {
                      bgcolor: "primary.dark",
                      cursor: "pointer",
                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Add New Child
                </Button>
              </Box>
            )}

            {children.length === 0 && !loadingUserRole ? (
              <Paper
                sx={{
                  padding: "48px 24px",
                  textAlign: "center",
                  borderRadius: "20px",
                  background: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.04)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  No children added yet
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    marginBottom: 3,
                  }}
                >
                  {userRole === "parent"
                    ? "Start by adding your first child to begin tracking their care and progress."
                    : "No children have been assigned to you yet."}
                </Typography>
                {userRole === "parent" && (
                  <Button
                    variant="contained"
                    onClick={() => setAddChildOpen(true)}
                    startIcon={<AddIcon />}
                    sx={{
                      bgcolor: "primary.main",
                      color: "#FFFFFF",
                      padding: "12px 24px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      borderRadius: "12px",
                      boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                      "&:hover": {
                        bgcolor: "primary.dark",
                        cursor: "pointer",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    Add Your First Child
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {children.map((child) => (
                  <Grid
                    item
                    xs={12}
                    sm={isCompact ? 6 : 12}
                    md={isCompact ? 4 : 12}
                    lg={isCompact ? 3 : 12}
                    key={child.id}
                  >
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
                      compact={isCompact}
                      iconSpacing={0.5}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

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
    </Box>
  );
};

export default Dashboard;
