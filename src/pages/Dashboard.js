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
import { alpha, useTheme } from "@mui/material/styles";

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

  const theme = useTheme();
  const isCompact = children.length > 2;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        padding: "16px 0",
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "20px",
            padding: { xs: "22px 16px", sm: "30px 22px" },
            marginBottom: "16px",
            boxShadow: "0 6px 20px rgba(17,24,39,0.06)",
            border: `1px solid ${alpha("#000", 0.04)}`,
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: "140px", sm: "160px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            backgroundImage: `linear-gradient(90deg, ${alpha("#5B8C51", 0.06)} 0%, ${alpha("#CB6318", 0.06)} 100%)`,
          }}
        >
          {/* Add New Child button for parents, absolutely positioned */}
          {userRole === "parent" && (
            <Button
              variant="contained"
              onClick={() => setAddChildOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                position: "absolute",
                top: { xs: 12, sm: 18 },
                right: { xs: 12, sm: 22 },
                bgcolor: "primary.main",
                color: "#FFFFFF",
                padding: "10px 18px",
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: "16px",
                boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                minWidth: "0",
                zIndex: 10,
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
          )}
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: "#5B8C51",
                fontFamily: "Dancing Script, cursive",
                fontWeight: 600,
                marginBottom: 1,
                fontSize: {
                  xs: "1.4rem",
                  sm: "1.8rem",
                  md: "2.2rem",
                  lg: "2.4rem",
                },
                lineHeight: 1.18,
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Welcome, {userDisplayName}!
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
                fontSize: { xs: "1.08rem", sm: "1.15rem" },
                fontWeight: 400,
                marginBottom: 2,
                maxWidth: "500px",
                lineHeight: 1.5,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Manage your children's care and track their progress easily
            </Typography>

            {/* Quick Stats */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                marginTop: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  padding: "6px 12px",
                  bgcolor: "primary.main",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                  fontWeight: 500,
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
                    fontWeight: 500,
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
                  padding: "6px 12px",
                  backgroundColor: alpha("#5B8C51", 0.12),
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minWidth: "110px",
                }}
              >
                <GroupIcon sx={{ color: "#2F5E27", fontSize: 16, mr: 0.5 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#2F5E27",
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
            {children.length === 0 && !loadingUserRole ? (
              <Paper
                sx={{
                  padding: "56px 28px",
                  textAlign: "center",
                  borderRadius: "24px",
                  background: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.04)",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <ChildCareIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
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
                    md={isCompact ? 4 : 6}
                    lg={isCompact ? 3 : 4}
                    xl={3}
                    key={child.id}
                  >
                    <ChildCard
                      child={child}
                      onEditChild={() => {
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
                      expanded={expandedChildId === child.id}
                      onAccordionChange={() =>
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
