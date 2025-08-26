import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
  Badge,
  Modal,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Timeline as TimelineIcon,
  AutoAwesome as SparkleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalHospital as HospitalIcon,
  Psychology as TherapyIcon,
  FamilyRestroom as FamilyIcon,
  MedicalInformation as DiagnosisIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import { useChildContext } from "../contexts/ChildContext";
import { getChildren } from "../services/childService";
import {
  getTimelineEntries,
  TIMELINE_TYPES,
} from "../services/timelineService";
import StyledButton from "../components/UI/StyledButton";
import QuickCheckIn from "../components/Mobile/QuickCheckIn";
import MicroDataCollector from "../components/Mobile/MicroDataCollector";
import InviteTeamMemberModal from "../components/InviteTeamMemberModal";
import AddChildModal from "../components/Dashboard/AddChildModal";
import EditChildModal from "../components/Dashboard/EditChildModal";
import ActionGroup from "../components/Dashboard/ActionGroup";
import DailyCareModal from "../components/DailyCare/DailyCareModal";
import { useRole } from "../contexts/RoleContext";
import { usePermissions } from "../hooks/usePermissions";
import { getPermissionsForRole } from "../services/rolePermissionService";
import ChildCard from "../components/Dashboard/ChildCard";

const PanelDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [userIsParent, setUserIsParent] = useState(false);
  const { currentChildId, setCurrentChildId } = useChildContext();
  const {
    loading: roleLoading,
    childrenWithAccess,
    getUserRoleForChild,
    canAddDataForChild,
    isReadOnlyForChild,
    canInviteOthers,
    canManageChild,
    refreshRoles,
    USER_ROLES,
  } = useRole();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState([]);
  const [quickDataStatus, setQuickDataStatus] = useState({});
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [entryType, setEntryType] = useState("micro"); // 'micro' or 'full'
  const [expandedCategories, setExpandedCategories] = useState({}); // Track expanded categories per child
  const [highlightedActions, setHighlightedActions] = useState({}); // Track highlighted actions per child
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteChildId, setInviteChildId] = useState(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [selectedChildForEdit, setSelectedChildForEdit] = useState(null);
  const [showDailyCareModal, setShowDailyCareModal] = useState(false);
  const [dailyCareAction, setDailyCareAction] = useState(null);
  const [dailyCareChild, setDailyCareChild] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Load children based on role access
  useEffect(() => {
    if (roleLoading) return;

    const loadChildren = async () => {
      try {
        // Use children from role context (includes role information)
        const childrenWithRoles = childrenWithAccess || [];

        // Use real children only - no mock data to avoid fake child ID issues
        const testData = childrenWithRoles;

        setChildren(testData);
        if (testData.length > 0 && !currentChildId) {
          setCurrentChildId(testData[0].id);
        }
      } catch (error) {
        console.error("Error loading children:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [roleLoading, childrenWithAccess, currentChildId, setCurrentChildId]);

  // Load recent timeline entries for all children (organized by child)
  useEffect(() => {
    const unsubscribes = [];
    const entriesByChild = {};

    children.forEach((child) => {
      const unsubscribe = getTimelineEntries(child.id, (entries) => {
        // Get recent entries (last 7 days)
        const recentTimelineEntries = entries
          .filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return entryDate >= weekAgo;
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5); // Keep only 5 most recent per child

        entriesByChild[child.id] = recentTimelineEntries;
        setRecentEntries({ ...entriesByChild });
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }, [children]);

  // Check if user has parent role
  useEffect(() => {
    const checkParentRole = async () => {
      if (!user) {
        setUserIsParent(false);
        return;
      }

      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../services/firebase");
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const hasParentRole =
            userData.roles?.includes("parent") ||
            userData.roles?.includes("primary_parent") ||
            userData.roles?.includes("co_parent") ||
            userData.role === "parent" ||
            userData.role === "primary_parent" ||
            userData.role === "co_parent";
          setUserIsParent(hasParentRole);
        }
      } catch (error) {
        console.error("Error checking parent role:", error);
      }
    };

    checkParentRole();
  }, [user]);

  // Mock quick data status (replace with real implementation)
  useEffect(() => {
    const mockStatus = {};
    children.forEach((child) => {
      // Generate some sample quick entry status (this would come from real data in production)
      const mood = Math.random() > 0.5;
      const sleep = Math.random() > 0.4;
      const energy = Math.random() > 0.6;

      // Calculate progress based on completed quick entries
      const quickEntries = [mood, sleep, energy];
      const completedQuickEntries = quickEntries.filter(Boolean).length;
      const quickCompletionRate = Math.round(
        (completedQuickEntries / quickEntries.length) * 100
      );

      // Simple calculation: Daily Care completion based on mood, sleep, energy only
      const dailyCareCompletion = quickCompletionRate;

      mockStatus[child.id] = {
        mood,
        sleep,
        energy,
        dataCompleteness: dailyCareCompletion,
      };
    });
    setQuickDataStatus(mockStatus);
  }, [children, recentEntries]);

  const handleQuickDataEntry = (child, type, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Check if user has permission to add data for this child
    if (!canAddDataForChild(child.id)) {
      return;
    }

    setCurrentChildId(child.id);

    // For mood, sleep, energy - open the Daily Care modal directly
    if (type === "mood" || type === "sleep" || type === "energy") {
      // Open the Daily Care modal for this action
      setDailyCareAction(type);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
      
      // Also expand Daily Care section and highlight for visual feedback
      setExpandedCategories(prev => ({
        ...prev,
        [`${child.id}-daily_care`]: true
      }));
      
      // Highlight the corresponding action
      setHighlightedActions(prev => ({
        ...prev,
        [`${child.id}-${type}`]: true
      }));
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedActions(prev => ({
          ...prev,
          [`${child.id}-${type}`]: false
        }));
      }, 3000);
      
      return;
    }

    // For "complete" or other types, show the modal as before
    if (type === "complete") {
      setSelectedChild(child);
      setEntryType("micro");
      setShowQuickEntry(true);
    } else {
      setSelectedChild(child);
      setEntryType("full");
      setShowQuickEntry(true);
    }
  };

  const handleDetailedEntry = (type) => {
    if (!currentChildId) return;

    // Check if user has permission to add data for this child
    if (!canAddDataForChild(currentChildId)) {
      return;
    }

    // Map our consolidated button types to actual entry types
    const buttonMappings = {
      daily: "daily_note",
      food_health: "food_log",
      behavior_sensory: "behavior",
      progress: "progress_note",
    };

    // Use mapping if it exists, otherwise use type directly
    const actualType = buttonMappings[type] || type;

    // Navigation strategy: Dedicated pages first, tabs as fallback
    const dedicatedPages = {
      daily_note: "/log/daily-note",
      progress_note: "/log/progress-note",
      behavior: "/log/behavior",
      mood_log: "/log/mood",
      // Add new dedicated pages here
    };

    // Fallback tab mapping (for types without dedicated pages yet)
    const tabFallbackMap = {
      daily_note: 0,
      progress_note: 1,
      sensory_log: 2,
      behavior: 3,
      mood_log: 4,
    };

    // Try dedicated page first, then fallback to tabs
    if (dedicatedPages[actualType]) {
      navigate(dedicatedPages[actualType]);
    } else if (tabFallbackMap[actualType] !== undefined) {
      navigate(`/log?tab=${tabFallbackMap[actualType]}`);
    } else {
      // For new types, navigate to specific pages or show implementation message
      switch (actualType) {
        case "medication_log":
          alert(
            "Medication Log: Navigate to dedicated medication tracking page (to be implemented)"
          );
          break;
        case "food_log":
          alert(
            "Food Log: Navigate to detailed food tracking page (to be implemented)"
          );
          break;
        case "medical_event":
          alert(
            "Medical Event: Navigate to medical events page (to be implemented)"
          );
          break;
        case "sleep_log":
          alert(
            "Sleep Log: Navigate to detailed sleep tracking page (to be implemented)"
          );
          break;
        default:
          alert(
            `Entry type "${actualType}" will be implemented in the next phase.`
          );
      }
    }
  };

  const handleQuickEntryComplete = (data) => {
    // Here you would save the data to your backend
    setShowQuickEntry(false);
    setSelectedChild(null);

    // Refresh data to show the new entry
    // You can implement this based on your data flow
  };

  const handleQuickEntrySkip = () => {
    setShowQuickEntry(false);
    setSelectedChild(null);
  };

  const toggleCategory = (childId, category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [`${childId}-${category}`]: !prev[`${childId}-${category}`],
    }));
  };

  const isCategoryExpanded = (childId, category) => {
    return expandedCategories[`${childId}-${category}`] || false;
  };

  const isActionHighlighted = (childId, actionKey) => {
    return highlightedActions[`${childId}-${actionKey}`] || false;
  };

  const handleInviteTeamMember = (childId) => {
    // For now, allow all invitations - remove permission check temporarily
    // TODO: Re-enable permission check once role system is properly configured
    // if (!canInviteOthers(childId)) {
    //   return;
    // }

    setInviteChildId(childId);
    setShowInviteModal(true);
  };

  const handleEditChild = (child) => {
    // TODO: Open edit child modal
    setSelectedChildForEdit(child);
    setShowEditChildModal(true);
  };

  const handleInviteSuccess = (result) => {
    // Refresh the role context to pick up new assignments
    refreshRoles();
  };

  const handleAddChildSuccess = () => {
    setShowAddChildModal(false);
    // Refresh the role context to pick up new child
    refreshRoles();
  };

  const handleEditChildSuccess = () => {
    setShowEditChildModal(false);
    setSelectedChildForEdit(null);
    // Refresh the role context to pick up child changes
    refreshRoles();
  };

  const handleDailyCareComplete = (actionType, entryData) => {
    // Update the completion status for the child
    setQuickDataStatus(prev => ({
      ...prev,
      [entryData.childId]: {
        ...prev[entryData.childId],
        [actionType]: true,
      }
    }));
    
    // TODO: Refresh from database instead of local state
  };

  const handleCloseDailyCareModal = () => {
    setShowDailyCareModal(false);
    setDailyCareAction(null);
    setDailyCareChild(null);
  };

  // Define grouped action structure with enhanced visual design
  const getActionGroups = (userRole) => {
    // Common groups for parents and caregivers with improved color schemes
    const parentGroups = [
      {
        id: 'daily_care',
        title: 'Daily Care',
        icon: '💜',
        color: '#6D28D9', // Updated purple
        tooltip: 'Essential daily wellness tracking for mood, sleep, energy and health',
        actions: [
          { key: 'mood', label: 'Mood Check', icon: '😊', types: ['mood_log'], trackingType: 'daily' },
          { key: 'sleep', label: 'Sleep Quality', icon: '😴', types: ['sleep_log'], trackingType: 'daily' },
          { key: 'energy', label: 'Energy Level', icon: '⚡', types: ['energy_log'], trackingType: 'daily' },
          { key: 'food_health', label: 'Food & Medicine', icon: '🍎', types: ['food_log', 'medication_log', 'medical_event'], trackingType: 'daily' },
          { key: 'safety', label: 'Safety Check', icon: '🛡️', types: ['safety_log'], trackingType: 'task' },
        ],
      },
      {
        id: 'behavior_progress',
        title: 'Behavior & Progress',
        icon: '🧠',
        color: '#334155', // Darker slate gray
        tooltip: 'Track behavioral patterns, sensory responses, and developmental progress',
        actions: [
          { key: 'daily', label: 'Daily Notes', icon: '📝', types: ['daily_note'], trackingType: 'daily' },
          { key: 'behavior_sensory', label: 'Behavior & Sensory', icon: '🧠', types: ['behavior', 'sensory_log'], trackingType: 'task' },
          { key: 'progress', label: 'Progress Review', icon: '📈', types: ['progress_note'], trackingType: 'task' },
        ],
      },
      {
        id: 'planning_reminders',
        title: 'Planning & Reminders',
        icon: '🌸',
        color: '#DB2777', // Updated coral pink
        tooltip: 'Organize schedules, coordinate with team, and manage shared access',
        actions: [
          { key: 'routines', label: 'Schedule & Appointments', icon: '📅', types: ['routine', 'appointment'], trackingType: 'task' },
          { key: 'notes', label: 'Team Notes', icon: '📋', types: ['caregiver_note'], trackingType: 'task' },
          { key: 'access', label: 'Share Access', icon: '👥', types: ['access_management'], trackingType: 'task' },
        ],
      },
    ];

    // Therapist-specific groups with enhanced styling
    const therapistGroups = [
      {
        id: 'professional_tools',
        title: 'Professional Tools',
        icon: '🩺',
        color: '#64748B', // Professional slate blue
        tooltip: 'Clinical assessment tools and professional documentation',
        actions: [
          { key: 'professional_note', label: 'Clinical Notes', icon: '📝', trackingType: 'task' },
          { key: 'timeline', label: 'View Timeline', icon: '📈', trackingType: 'task' },
          { key: 'report', label: 'Generate Report', icon: '📊', trackingType: 'task' },
        ],
      },
    ];

    // Return appropriate groups based on role
    if (userRole === USER_ROLES.THERAPIST) {
      return therapistGroups;
    }
    
    return parentGroups;
  };

  // Unified action handler that maintains existing functionality
  const handleGroupActionClick = (action, child) => {
    setCurrentChildId(child.id);

    // Handle Daily Care actions with new modal
    if (['mood', 'sleep', 'energy', 'food_health', 'safety'].includes(action.key)) {
      setDailyCareAction(action.key);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
      return;
    }

    // Handle existing detailed entries
    if (['daily', 'behavior_sensory', 'progress'].includes(action.key)) {
      handleDetailedEntry(action.key);
      return;
    }

    // Handle therapist actions
    if (action.key === 'professional_note') {
      return;
    }
    
    if (action.key === 'timeline') {
      return;
    }
    
    if (action.key === 'report') {
      return;
    }

    // Handle new actions (placeholder implementations)
    switch (action.key) {
      case 'routines':
        alert('Routines & Appointments: Navigate to scheduling page (to be implemented)');
        break;
      case 'notes':
        alert('Caregiver Notes: Navigate to notes management (to be implemented)');
        break;
      case 'access':
        alert('Shared Access: Navigate to access management (to be implemented)');
        break;
      default:
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteChildId(null);
  };

  const getTypeConfig = (type) => {
    return (
      Object.values(TIMELINE_TYPES).find((t) => t.type === type) || {
        icon: "📝",
        color: theme.palette.primary.main,
        label: type,
      }
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const entryTime = new Date(timestamp);
    const diffMs = now - entryTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  if (loading || roleLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Beautiful Header */}
      <Box
        sx={{
          mb: 6,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          py: 4,
          px: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header Content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          {/* Left: User Name & Title */}
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <SparkleIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textAlign: "left",
                }}
              >
                {user?.displayName || user?.email?.split("@")[0] || "Your"}{" "}
                Dashboard
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  textAlign: "left",
                  fontSize: "1.1rem",
                  mt: 0.5,
                }}
              >
                {children.some((child) => !isReadOnlyForChild(child.id))
                  ? "Support and track progress for the individuals you care for — personally or professionally."
                  : "Monitor updates and stay connected to the people you support."}
              </Typography>
            </Box>
          </Box>

          {/* Right: Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Invite Team Member - Show only if user can manage at least one child */}
            {children?.some((child) => {
              const userRole = getUserRoleForChild?.(child.id);
              return (
                userRole === USER_ROLES.PRIMARY_PARENT ||
                userRole === USER_ROLES.CO_PARENT
              );
            }) && (
              <StyledButton
                variant="outlined"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  setInviteChildId(null); // No specific child selected - let user choose
                  setShowInviteModal(true);
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  "&:hover": {
                    borderColor: theme.palette.success.dark,
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 25px ${alpha(theme.palette.success.main, 0.4)}`,
                  },
                }}
              >
                Invite Team Member
              </StyledButton>
            )}

            {/* Add Child - Show for everyone */}
            <StyledButton
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setShowAddChildModal(true)}
              sx={{
                py: 1.5,
                px: 3,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Add Child
            </StyledButton>
          </Box>
        </Box>
      </Box>

      {/* Child Cards - Grouped by Relationship */}
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        {(() => {
          // Group children by relationship type
          const ownChildren = [];
          const familyChildren = [];
          const professionalChildren = [];

          children?.forEach((child) => {
            const userRole = getUserRoleForChild
              ? getUserRoleForChild(child.id)
              : null;
            if (userRole === USER_ROLES.PRIMARY_PARENT) {
              ownChildren.push(child);
            } else if (
              userRole === USER_ROLES.CO_PARENT ||
              userRole === USER_ROLES.FAMILY_MEMBER
            ) {
              familyChildren.push(child);
            } else if (
              userRole === USER_ROLES.CAREGIVER ||
              userRole === USER_ROLES.THERAPIST
            ) {
              professionalChildren.push(child);
            }
          });

          return (
            <>
              {/* Your Children Section */}
              {ownChildren.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      🏠 In Your Full Care
                    </Typography>
                    <Chip
                      label={ownChildren.length}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Stack spacing={3}>
                    {ownChildren.map((child) => {
                      return <ChildCard
                      child={child}
                      expanded={expanded}
                      onAccordionChange={() => setExpanded(!expanded)}
                      onEditChild={handleEditChild}
                      onDeleteChild={()=>{}}
                      onInviteTeamMember={handleInviteTeamMember}
                      onLogMood={()=>{}}
                      onSmartDataTracking={()=>{}}
                      userRole={getUserRoleForChild(child.id)}
                    />;
                    })}
                  </Stack>
                </Box>
              )}

              {/* Family Children Section */}
              {familyChildren.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.calendar.accent,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      👨‍👩‍👧‍👦 Family Children
                    </Typography>
                    <Chip
                      label={familyChildren.length}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.calendar.accent, 0.15),
                        color: theme.palette.calendar.accent,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Stack spacing={3}>
                    {familyChildren.map((child) => {
                      return <ChildCard
                      child={child}
                      expanded={expanded}
                      onAccordionChange={() => setExpanded(!expanded)}
                      onEditChild={handleEditChild}
                      onDeleteChild={()=>{}}
                      onInviteTeamMember={handleInviteTeamMember}
                      onLogMood={()=>{}}
                      onSmartDataTracking={()=>{}}
                      userRole={getUserRoleForChild(child.id)}
                    />;
                    })}
                  </Stack>
                </Box>
              )}

              {/* Professional Assignments Section */}
              {professionalChildren.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.tertiary.dark,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      💼 Professional Assignments
                    </Typography>
                    <Chip
                      label={professionalChildren.length}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.tertiary.dark, 0.15),
                        color: theme.palette.tertiary.dark,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Stack spacing={2}>
                    {professionalChildren.map((child) => {
                      return <ChildCard
                      child={child}
                      expanded={expanded}
                      onAccordionChange={() => setExpanded(!expanded)}
                      onEditChild={handleEditChild}
                      onDeleteChild={()=>{}}
                      onInviteTeamMember={handleInviteTeamMember}
                      onLogMood={()=>{}}
                      onSmartDataTracking={()=>{}}
                      userRole={getUserRoleForChild(child.id)}
                    />;
                    })}
                  </Stack>
                </Box>
              )}
            </>
          );
        })()}
      </Box>

      {/* Quick Entry Modal */}
      <Modal
        open={showQuickEntry}
        onClose={handleQuickEntrySkip}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {selectedChild && entryType === "micro" && (
            <MicroDataCollector
              child={selectedChild}
              onComplete={handleQuickEntryComplete}
              onSkip={handleQuickEntrySkip}
            />
          )}
          {selectedChild && entryType === "full" && (
            <QuickCheckIn
              child={selectedChild}
              onComplete={handleQuickEntryComplete}
              onSkip={handleQuickEntrySkip}
            />
          )}
        </Box>
      </Modal>

      {/* Invitation Modal */}
      <InviteTeamMemberModal
        open={showInviteModal}
        onClose={handleCloseInviteModal}
        children={children}
        selectedChildId={inviteChildId}
        onInviteSuccess={handleInviteSuccess}
      />

      <AddChildModal
        open={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSuccess={handleAddChildSuccess}
      />
      <EditChildModal
        open={showEditChildModal}
        child={selectedChildForEdit}
        userRole={
          selectedChildForEdit
            ? getUserRoleForChild?.(selectedChildForEdit.id)
            : null
        }
        onClose={() => {
          setShowEditChildModal(false);
          setSelectedChildForEdit(null);
        }}
        onSuccess={handleEditChildSuccess}
      />

      {/* Daily Care Modal */}
      <DailyCareModal
        open={showDailyCareModal}
        onClose={handleCloseDailyCareModal}
        child={dailyCareChild}
        actionType={dailyCareAction}
        onComplete={handleDailyCareComplete}
      />
    </Container>
  );
};

export default PanelDashboard;