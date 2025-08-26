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
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";
import MobileDashboard from "../components/Mobile/MobileDashboard";
import TabletDashboard from "../components/Tablet/TabletDashboard";
import QuickDataSection from "../components/Dashboard/QuickDataSection";
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
  const [userRoles, setUserRoles] = useState([]);
  const [loadingUserRole, setLoadingUserRole] = useState(true);

  const theme = useTheme();

  // Helper function to check if user has a specific role
  const hasRole = (role) => userRoles.includes(role);
  
  // Helper to check if user can manage children (add/edit)
  const canManageChildren = () => userRoles.includes('primary_parent') || userRoles.includes('co_parent');
  
  // Helper to check if user is any type of parent
  const isParent = () => userRoles.includes('primary_parent') || userRoles.includes('co_parent') || userRoles.includes('parent');

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserDisplayName(user.displayName || user.email || "User");
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let currentRole = null;
        let currentRoles = [];
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          currentRole = userData.role;
          currentRoles = userData.roles || [userData.role].filter(Boolean);
          setUserRole(currentRole);
          setUserRoles(currentRoles);
        } else {
          setUserRole(null);
          setUserRoles([]);
        }

        let childrenQuery;
        if (currentRoles.includes("parent") || currentRoles.includes("primary_parent") || currentRoles.includes("co_parent")) {
          childrenQuery = query(
            collection(db, "children"),
            where("users.parent", "==", user.uid)
          );
        } else if (currentRoles.includes("therapist")) {
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
    <ResponsiveLayout 
      pageTitle="Dashboard"
      customMobile={
        <MobileDashboard 
          children={children} 
          user={{ displayName: userDisplayName }}
          onEditChild={(child) => {
            setSelectedChild(child);
            setEditChildOpen(true);
          }}
          onDeleteChild={(child) => {
            // Add delete functionality if needed
            console.log('Delete child:', child);
          }}
          onInviteTeamMember={(child) => {
            setSelectedChild(child);
            setInviteTeamMemberOpen(true);
          }}
          onLogMood={(child) => {
            setSelectedChild(child);
            setLogMoodOpen(true);
          }}
          userRole={userRole}
          onAddChild={() => setAddChildOpen(true)}
          modals={
            <>
              <AddChildModal
                open={addChildOpen}
                onClose={() => setAddChildOpen(false)}
              />
              <InviteTeamMemberModal
                open={inviteTeamMemberOpen}
                onClose={() => setInviteTeamMemberOpen(false)}
                child={selectedChild}
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
          }
        />
      }
      customTablet={<TabletDashboard children={children} user={{ displayName: userDisplayName }} />}
    >
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

          {/* Action Buttons - Cleaner positioning */}
          {canManageChildren() && (
            <Box
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                display: "flex",
                gap: 2,
                zIndex: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  if (children.length === 1) {
                    setSelectedChild(children[0]);
                    setInviteTeamMemberOpen(true);
                  } else if (children.length > 1) {
                    // For multiple children, we'll still need to expand a card or add child selection
                    // For now, just alert the user
                    alert("Please click on a child card and use the 'Add Team Member' button inside to invite team members for that specific child.");
                  }
                }}
                startIcon={<GroupIcon />}
                disabled={children.length === 0}
                sx={{
                  bgcolor: "background.paper",
                  borderColor: "success.main",
                  color: "success.main",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "success.main",
                    color: "white",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  },
                  "&:disabled": {
                    bgcolor: "grey.100",
                    borderColor: "grey.300",
                    color: "grey.500",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Invite Team
              </Button>
              <Button
                variant="contained"
                onClick={() => setAddChildOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontWeight: 600,
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
            </Box>
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
                  fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem", xl: "3.5rem" },
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
                  fontSize: { xs: "1.1rem", md: "1.2rem", lg: "1.3rem" },
                  fontWeight: 400,
                  maxWidth: { xs: 600, lg: 800, xl: 1000 },
                }}
              >
                Keep track of your children's progress and collaborate with your
                care team
              </Typography>
            </Box>

            {/* Refined Stats Cards */}
            <Box sx={{ display: "flex", gap: { xs: 2, md: 3, lg: 4 }, flexWrap: "wrap" }}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  borderRadius: { xs: 2, md: 3 },
                  minWidth: { xs: 140, md: 160, lg: 180 },
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
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
                  borderRadius: { xs: 2, md: 3 },
                  minWidth: { xs: 140, md: 160, lg: 180 },
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
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

        {/* Smart Data Collection Section */}
        <QuickDataSection 
          children={children} 
          userRole={userRole} 
          onEditChild={(child) => {
            setSelectedChild(child);
            setEditChildOpen(true);
          }}
          onDeleteChild={(child) => {
            // Add delete functionality if needed
            console.log('Delete child:', child);
          }}
        />

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
                  {canManageChildren()
                    ? "Start by adding your first child to begin tracking their care and progress."
                    : "No children have been assigned to you yet."}
                </Typography>
                {canManageChildren() && (
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
              <Grid container spacing={{ xs: 3, md: 4, lg: 5 }}>
                {children.map((child) => (
                  <Grid
                    item
                    xs={12}
                    sm={children.length > 1 ? 6 : 12}
                    md={children.length > 2 ? 4 : children.length > 1 ? 6 : 12}
                    lg={children.length > 4 ? 3 : children.length > 2 ? 4 : children.length > 1 ? 6 : 12}
                    xl={children.length > 5 ? 2 : children.length > 3 ? 3 : children.length > 1 ? 6 : 12}
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
              child={selectedChild}
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
    </ResponsiveLayout>
  );
};

export default Dashboard;
