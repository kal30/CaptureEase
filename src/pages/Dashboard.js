import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Card,
  CardContent,
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
  const [expandedChildId, setExpandedChildId] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loadingUserRole, setLoadingUserRole] = useState(true);

  const theme = useTheme();

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot = null;
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
        } else {
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
        setChildren([]);
        setLoadingUserRole(false);
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Refined Header Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 4,
            mb: 4,
            bgcolor: "background.paper",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle background accent */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              zIndex: 0,
            }}
          />

          {/* Add Child Button - Cleaner positioning */}
          {userRole === "parent" && (
            <Button
              variant="contained"
              onClick={() => setAddChildOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                bgcolor: "primary.main",
                borderRadius: 2,
                px: 3,
                py: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontWeight: 600,
                zIndex: 2,
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Add Child
            </Button>
          )}

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Cleaner Welcome Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                Welcome back, {userDisplayName}
                <EmojiEmotionsIcon
                  sx={{
                    fontSize: { xs: 28, md: 32 },
                    color: "primary.main",
                    ml: 1,
                    verticalAlign: "middle",
                  }}
                />
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: "1.1rem",
                  fontWeight: 400,
                  maxWidth: 600,
                }}
              >
                Keep track of your children's progress and collaborate with your
                care team
              </Typography>
            </Box>

            {/* Refined Stats Cards */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  borderRadius: 2,
                  minWidth: 140,
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ChildCareIcon
                      sx={{ color: "primary.main", fontSize: 20 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: "primary.main", fontWeight: 700, mb: 0 }}
                      >
                        {children.length}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "primary.main", fontWeight: 500 }}
                      >
                        {children.length === 1 ? "Child" : "Children"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                  borderRadius: 2,
                  minWidth: 140,
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <GroupIcon sx={{ color: "success.main", fontSize: 20 }} />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: "success.main", fontWeight: 700, mb: 0 }}
                      >
                        Active
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "success.main", fontWeight: 500 }}
                      >
                        Care Team
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Paper>

        {/* Content Section */}
        {loadingUserRole ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <CircularProgress size={48} sx={{ color: "primary.main" }} />
          </Box>
        ) : (
          <>
            {children.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <ChildCareIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  No children added yet
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                    maxWidth: 400,
                    mx: "auto",
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
                    size="large"
                    sx={{
                      bgcolor: "primary.main",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "primary.dark",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
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
                    sm={children.length > 1 ? 6 : 12}
                    md={children.length > 2 ? 4 : children.length > 1 ? 6 : 12}
                    lg={children.length > 3 ? 3 : children.length > 1 ? 6 : 12}
                    key={child.id}
                  >
                    <ChildCard
                      child={child}
                      onEditChild={() => {
                        setSelectedChild(child);
                        setEditChildOpen(true);
                      }}
                      onInviteTeamMember={() => {
                        setSelectedChild(child);
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
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Modals */}
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
