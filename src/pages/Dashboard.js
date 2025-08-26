import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Tooltip,
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
import GroupIcon from "@mui/icons-material/Group";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import { useTheme } from "@mui/material/styles";

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

  // User role helpers
  const canManageChildren = () => userRoles.includes('primary_parent') || userRoles.includes('co_parent');

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
          console.log('Dashboard userRole set to:', currentRole);
          console.log('Dashboard userRoles set to:', currentRoles);
        } else {
          setUserRole(null);
          setUserRoles([]);
        }

        let childrenQuery;
        const parentRoles = ['parent', 'primary_parent', 'co_parent'];
        if (parentRoles.some(role => currentRoles.includes(role))) {
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
        {/* Professional Header Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            p: 5,
            mb: 5,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            position: "relative",
          }}
        >

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
              <Tooltip title={
                children.length === 0 
                  ? "Add a child first to invite team members" 
                  : children.length > 1 
                    ? "Use the invite button on individual child cards for multiple children"
                    : "Invite team members for this child"
              }>
                <span>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (children.length === 1) {
                        setSelectedChild(children[0]);
                        setInviteTeamMemberOpen(true);
                      }
                    }}
                    startIcon={<GroupIcon />}
                    disabled={children.length !== 1}
                sx={{
                  bgcolor: "background.paper",
                  borderColor: "text.secondary",
                  color: "text.secondary",
                  borderRadius: 1,
                  px: 3,
                  py: 1.5,
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  "&:hover": {
                    bgcolor: "primary.main",
                    borderColor: "primary.main",
                    color: "white",
                  },
                  "&:disabled": {
                    bgcolor: "grey.50",
                    borderColor: "grey.300",
                    color: "grey.400",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                    Invite Team
                  </Button>
                </span>
              </Tooltip>
              <Button
                variant="contained"
                onClick={() => setAddChildOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  px: 3,
                  py: 1.5,
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Add Child
              </Button>
            </Box>
          )}

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Professional Welcome Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1.75rem", md: "2rem", lg: "2.25rem" },
                  letterSpacing: "-0.01em",
                }}
              >
                Welcome back, {userDisplayName}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Manage your children's care coordination and track their progress with your team
              </Typography>
            </Box>

            {/* Professional Stats Cards */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: "background.paper",
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  minWidth: { xs: 160, md: 180 },
                  transition: "border-color 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ChildCareIcon
                      sx={{ color: "text.secondary", fontSize: 24 }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ color: "text.primary", fontWeight: 600, mb: 0.5, fontSize: "1.5rem" }}
                      >
                        {children.length}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.9rem" }}
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
                  bgcolor: "background.paper",
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  minWidth: { xs: 160, md: 180 },
                  transition: "border-color 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <GroupIcon sx={{ color: "text.secondary", fontSize: 24 }} />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: "text.primary", fontWeight: 600, mb: 0.5, fontSize: "1.1rem" }}
                      >
                        Care Team
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.9rem" }}
                      >
                        Active
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
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <ChildCareIcon sx={{ fontSize: 32, color: "text.secondary" }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.primary",
                    fontWeight: 500,
                    mb: 2,
                    fontSize: "1.25rem",
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
                    fontSize: "1rem",
                    lineHeight: 1.6,
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
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Add Your First Child
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={4}>
                {children.map((child) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={children.length === 1 ? 12 : children.length === 2 ? 6 : 4}
                    lg={children.length === 1 ? 12 : children.length <= 3 ? 4 : 3}
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

          </>
        )}
    </ResponsiveLayout>
  );
};

export default Dashboard;
