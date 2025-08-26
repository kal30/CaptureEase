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
import ChildCard from "../components/Dashboard/ChildCard";
import DailyCareModal from "../components/DailyCare/DailyCareModal";
import DailyReportModal from "../components/DailyCare/DailyReportModal";
import { useRole } from "../contexts/RoleContext";
import { usePermissions } from "../hooks/usePermissions";
import { getPermissionsForRole } from "../services/rolePermissionService";

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
  const [expandedCards, setExpandedCards] = useState({}); // Track expanded cards per child
  const [highlightedActions, setHighlightedActions] = useState({}); // Track highlighted actions per child
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteChildId, setInviteChildId] = useState(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [selectedChildForEdit, setSelectedChildForEdit] = useState(null);
  const [showDailyCareModal, setShowDailyCareModal] = useState(false);
  const [dailyCareAction, setDailyCareAction] = useState(null);
  const [dailyCareChild, setDailyCareChild] = useState(null);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [dailyReportChild, setDailyReportChild] = useState(null);

  // Load children based on role access
  useEffect(() => {
    if (roleLoading) return;

    const loadChildren = async () => {
      try {
        console.log("Loading children with role access...");

        // Use children from role context (includes role information)
        const childrenWithRoles = childrenWithAccess || [];
        console.log("Children with roles:", childrenWithRoles);
        console.log(
          "childrenWithAccess from role context:",
          childrenWithAccess
        );

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
      console.log("User does not have permission to add data for this child");
      return;
    }

    console.log("Quick data entry clicked:", type, child.name);
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

    // For "complete" (Daily Report), show the Daily Report modal
    if (type === "complete") {
      setDailyReportChild(child);
      setShowDailyReportModal(true);
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
      console.log("User does not have permission to add data for this child");
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
      console.log("Navigating to dedicated page:", dedicatedPages[actualType]);
      navigate(dedicatedPages[actualType]);
    } else if (tabFallbackMap[actualType] !== undefined) {
      console.log(
        "Using tab fallback for:",
        actualType,
        "tab:",
        tabFallbackMap[actualType]
      );
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
          console.log(`Navigation for ${actualType} not yet implemented`);
          alert(
            `Entry type "${actualType}" will be implemented in the next phase.`
          );
      }
    }

    console.log("handleDetailedEntry completed for:", actualType);
  };

  const handleQuickEntryComplete = (data) => {
    console.log("Quick entry completed:", data);
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

  const toggleCard = (childId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [childId]: !prev[childId],
    }));
  };

  const isCardExpanded = (childId) => {
    return expandedCards[childId] || false;
  };

  const isActionHighlighted = (childId, actionKey) => {
    return highlightedActions[`${childId}-${actionKey}`] || false;
  };

  const handleInviteTeamMember = (childId) => {
    // For now, allow all invitations - remove permission check temporarily
    // TODO: Re-enable permission check once role system is properly configured
    // if (!canInviteOthers(childId)) {
    //   console.log('User does not have permission to invite team members for this child');
    //   return;
    // }

    setInviteChildId(childId);
    setShowInviteModal(true);
  };

  const handleEditChild = (child) => {
    console.log("Edit child clicked:", child.name);
    // TODO: Open edit child modal
    setSelectedChildForEdit(child);
    setShowEditChildModal(true);
  };

  const handleInviteSuccess = (result) => {
    console.log("Invitation sent successfully:", result);
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
    console.log('Daily care completed:', actionType, entryData);
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

  const handleDailyReportEdit = (actionType) => {
    // When user clicks edit in Daily Report, open the Daily Care modal
    setDailyCareAction(actionType);
    setDailyCareChild(dailyReportChild);
    setShowDailyCareModal(true);
  };

  const handleDailyReport = (child) => {
    setDailyReportChild(child);
    setShowDailyReportModal(true);
  };

  const handleCloseDailyReportModal = () => {
    setShowDailyReportModal(false);
    setDailyReportChild(null);
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
      console.log('Add professional note for child:', child.id);
      return;
    }
    
    if (action.key === 'timeline') {
      console.log('View timeline for child:', child.id);
      return;
    }
    
    if (action.key === 'report') {
      console.log('Generate report for child:', child.id);
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
        console.log(`Action ${action.key} not yet implemented`);
    }
  };

  // Render individual child card with group-specific styling
  const renderChildCard = (child, groupType) => {
    const status = quickDataStatus[child.id] || {};
    const childEntries = (recentEntries && recentEntries[child.id]) || [];
    const completedToday = status.mood && status.sleep && status.energy;
    const userRole = getUserRoleForChild ? getUserRoleForChild(child.id) : null;
    const isReadOnly = isReadOnlyForChild
      ? isReadOnlyForChild(child.id)
      : false;
    const canAddData = canAddDataForChild ? canAddDataForChild(child.id) : true;
    const canInvite = canInviteOthers ? canInviteOthers(child.id) : true;

    // Group-specific styling
    const getGroupStyling = () => {
      switch (groupType) {
        case "own":
          return {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
            hoverShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
          };
        case "family":
          return {
            borderColor: alpha(theme.palette.calendar.accent, 0.4),
            backgroundColor: alpha(theme.palette.calendar.accent, 0.03),
            headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.calendar.accent, 0.12)} 0%, ${alpha(theme.palette.calendar.accent, 0.06)} 100%)`,
            hoverShadow: `0 8px 32px ${alpha(theme.palette.calendar.accent, 0.15)}`,
          };
        case "professional":
          return {
            borderColor: alpha(theme.palette.tertiary.dark, 0.3),
            backgroundColor: alpha(theme.palette.tertiary.dark, 0.02),
            headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.tertiary.dark, 0.08)} 0%, ${alpha(theme.palette.tertiary.dark, 0.04)} 100%)`,
            hoverShadow: `0 8px 32px ${alpha(theme.palette.tertiary.dark, 0.1)}`,
          };
        default:
          return {
            borderColor: theme.palette.divider,
            backgroundColor: "background.paper",
            headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            hoverShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          };
      }
    };

    const groupStyle = getGroupStyling();

    console.log(`Child ${child.name} (${child.id}):`, {
      userRole,
      isReadOnly,
      canAddData,
      canInvite,
      groupType,
      childData: child,
    });

    return (
      <Card
        key={child.id}
        elevation={0}
        onClick={(e) => {
          // Make the entire card clickable to expand/collapse
          e.stopPropagation();
          toggleCategory(child.id, "careTeam");
        }}
        sx={{
          // ELEGANT ROLE-BASED STYLING
          border:
            userRole === "therapist"
              ? "1px solid #E3F2FD"
              : userRole === "caregiver"
                ? "1px solid #FFF3E0"
                : userRole && userRole.includes("parent")
                  ? "1px solid #E8F5E8"
                  : "1px solid #f0f0f0",
          borderLeft:
            userRole === "therapist"
              ? "6px solid #1976D2"
              : userRole === "caregiver"
                ? "6px solid #F57C00"
                : userRole && userRole.includes("parent")
                  ? "6px solid #388E3C"
                  : "4px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor:
            userRole === "therapist"
              ? "#FAFCFF"
              : userRole === "caregiver"
                ? "#FFFDF9"
                : userRole && userRole.includes("parent")
                  ? "#FAFFFE"
                  : "#fafafa",
          transition: "all 0.2s ease",
          cursor: "pointer",
          position: "relative",
          boxShadow:
            userRole === "therapist"
              ? "0 2px 8px rgba(25,118,210,0.08)"
              : userRole === "caregiver"
                ? "0 2px 8px rgba(245,124,0,0.08)"
                : userRole && userRole.includes("parent")
                  ? "0 2px 8px rgba(56,142,60,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.05)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              userRole === "therapist"
                ? "0 4px 16px rgba(25,118,210,0.15)"
                : userRole === "caregiver"
                  ? "0 4px 16px rgba(245,124,0,0.15)"
                  : userRole && userRole.includes("parent")
                    ? "0 4px 16px rgba(56,142,60,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
            borderColor:
              userRole === "therapist"
                ? "#BBDEFB"
                : userRole === "caregiver"
                  ? "#FFCC80"
                  : userRole && userRole.includes("parent")
                    ? "#C8E6C9"
                    : "#ddd",
          },
        }}
      >
        {/* ELEGANT ROLE INDICATOR */}
        <Box
          style={{
            background:
              userRole === "therapist"
                ? "linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)"
                : userRole === "caregiver"
                  ? "linear-gradient(90deg, #FFF3E0 0%, #FFCC80 100%)"
                  : userRole && userRole.includes("parent")
                    ? "linear-gradient(90deg, #E8F5E8 0%, #C8E6C9 100%)"
                    : "linear-gradient(90deg, #f5f5f5 0%, #eeeeee 100%)",
            color:
              userRole === "therapist"
                ? "#1565C0"
                : userRole === "caregiver"
                  ? "#EF6C00"
                  : userRole && userRole.includes("parent")
                    ? "#2E7D32"
                    : "#666",
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: "600",
            textAlign: "left",
            borderBottom:
              userRole === "therapist"
                ? "2px solid #E3F2FD"
                : userRole === "caregiver"
                  ? "2px solid #FFF3E0"
                  : userRole && userRole.includes("parent")
                    ? "2px solid #E8F5E8"
                    : "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Box component="span" style={{ fontSize: "20px" }}>
            {userRole === "therapist"
              ? "🩺"
              : userRole === "caregiver"
                ? "🤗"
                : userRole && userRole.includes("parent")
                  ? "👑"
                  : "👤"}
          </Box>
          <Box component="span" style={{ flex: 1 }}>
            {userRole === "therapist"
              ? "Clinical Therapist"
              : userRole === "caregiver"
                ? "Caregiver"
                : userRole && userRole.includes("parent")
                  ? "Parent/Guardian"
                  : "Team Member"}
          </Box>
          <Box
            component="span"
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color:
                userRole === "therapist"
                  ? "#0D47A1"
                  : userRole === "caregiver"
                    ? "#BF360C"
                    : userRole && userRole.includes("parent")
                      ? "#1B5E20"
                      : "#424242",
            }}
          >
            {child.name}
          </Box>
        </Box>

        {/* Compact Horizontal Layout */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            background: completedToday
              ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
              : groupStyle.headerGradient,
            position: "relative",
            cursor: "pointer",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        >
          {/* Status Indicators & Expand Icon */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 8,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {/* Individual completion indicators */}
            <Box
              sx={{
                display: "flex",
                gap: 0.25,
              }}
            >
              {status.mood && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#6D28D9", // Daily Care color
                  }}
                />
              )}
              {status.sleep && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#6D28D9", // Daily Care color
                  }}
                />
              )}
              {status.energy && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#6D28D9", // Daily Care color
                  }}
                />
              )}
            </Box>

            {/* Subtle interaction hint */}
            <Box
              sx={{
                ml: 1,
                width: 4,
                height: 20,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                transition: "all 0.2s ease",
                opacity: 0.7,
              }}
            />
          </Box>

          {/* Left: Avatar & Basic Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Badge
              badgeContent={childEntries.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "1.1rem",
                  minWidth: "16px",
                  height: "16px",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: completedToday
                    ? theme.palette.success.main
                    : theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  borderRadius: 1,
                }}
              >
                {child.name[0]}
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, fontSize: "1.4rem" }}
                >
                  {child.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "1.2rem" }}
                >
                  Age {child.age}
                </Typography>
                
                {/* Edit Button - Right next to child name for easy access */}
                {(userRole === "primary_parent" || userRole === "co_parent") && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditChild(child);
                    }}
                    sx={{
                      ml: 1,
                      width: 28,
                      height: 28,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Role Badge - Compact */}
                {userRole && (
                  <Chip
                    label={(() => {
                      switch (userRole) {
                        case USER_ROLES.PRIMARY_PARENT:
                          return "👑 Primary Parent";
                        case USER_ROLES.CO_PARENT:
                          return "👨‍👩‍👧‍👦 Co-Parent";
                        case USER_ROLES.FAMILY_MEMBER:
                          return "👵 Family";
                        case USER_ROLES.CAREGIVER:
                          return "🤱 Caregiver";
                        case USER_ROLES.THERAPIST:
                          return "👩‍⚕️ Therapist";
                        default:
                          return userRole;
                      }
                    })()}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.95rem",
                      bgcolor:
                        userRole === USER_ROLES.PRIMARY_PARENT
                          ? alpha(theme.palette.primary.main, 0.2)
                          : userRole === USER_ROLES.CO_PARENT
                            ? alpha(theme.palette.primary.main, 0.15)
                            : userRole === USER_ROLES.THERAPIST
                              ? alpha("#FF6B6B", 0.15)
                              : alpha("#10B981", 0.15),
                      color:
                        userRole === USER_ROLES.PRIMARY_PARENT
                          ? theme.palette.primary.main
                          : userRole === USER_ROLES.CO_PARENT
                            ? theme.palette.primary.main
                            : userRole === USER_ROLES.THERAPIST
                              ? "#FF6B6B"
                              : "#10B981",
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* Care Team Count */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <HospitalIcon sx={{ color: "#9B59B6", fontSize: 14 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "1.05rem",
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {(() => {
                      const coParents = child.users?.co_parents?.length || 0;
                      const family = child.users?.family_members?.length || 0;
                      const caregivers = child.users?.caregivers?.length || 0;
                      const therapists = child.users?.therapists?.length || 0;
                      const totalMembers =
                        coParents + family + caregivers + therapists;
                      return `${totalMembers} team`;
                    })()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Quick Entry Circles OR Status Display */}
          <Box sx={{ display: "flex", gap: 1, px: 2 }}>
            {userRole === USER_ROLES.THERAPIST ? (
              // Read-only status display for therapists
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#94A3B8", 0.1),
                  border: `1px solid ${alpha("#94A3B8", 0.3)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#94A3B8",
                  }}
                >
                  Today's Status:
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {[
                    { key: "mood", emoji: "😊", color: "#6D28D9" }, // Daily Care color
                    { key: "sleep", emoji: "😴", color: "#6D28D9" }, // Daily Care color
                    { key: "energy", emoji: "⚡", color: "#6D28D9" }, // Daily Care color
                  ].map((item) => (
                    <Box
                      key={item.key}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: `1px solid ${status[item.key] ? item.color : theme.palette.divider}`,
                        bgcolor: status[item.key]
                          ? alpha(item.color, 0.1)
                          : "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.2rem" }}>
                        {status[item.key] ? "✓" : item.emoji}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              // Interactive quick entry circles for other roles - matching Daily Care colors
              [
                { key: "mood", emoji: "😊", color: "#6D28D9", label: "Mood", description: "Quick mood check" }, 
                { key: "sleep", emoji: "😴", color: "#6D28D9", label: "Sleep", description: "Last night's sleep" }, 
                {
                  key: "energy",
                  emoji: "⚡",
                  color: "#6D28D9", 
                  label: "Energy",
                  description: "Current energy level",
                },
              ].map((item) => (
                <Box
                  key={item.key}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card expansion
                    handleQuickDataEntry(child, item.key, e);
                  }}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `2px solid #6D28D9`, // Always purple outline
                    bgcolor: status[item.key]
                      ? alpha('#6D28D9', 0.1) // Purple background when completed
                      : "background.paper",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: '#6D28D9', // Purple on hover
                      bgcolor: alpha('#6D28D9', 0.1), // Purple background on hover
                      transform: "scale(1.1)",
                    },
                  }}
                  title={`${item.description} - Click for quick entry`}
                >
                  <Typography sx={{ fontSize: "1.2rem" }}>
                    {status[item.key] ? "✓" : item.emoji}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {/* Right: Progress & Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              alignSelf: "stretch",
              pt: 1.5,
            }}
          >

            {/* Action Buttons */}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}
            >
              {userRole === USER_ROLES.THERAPIST ? (
                // Professional tools for therapists
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card expansion
                      // TODO: Navigate to analytics/insights page
                      console.log("View Analytics for child:", child.id);
                    }}
                    sx={{
                      py: 0.5,
                      px: 1.5,
                      fontSize: "1.2rem",
                      minWidth: "auto",
                      borderRadius: 1,
                      background:
                        "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #64748B 0%, #475569 100%)",
                      },
                    }}
                  >
                    📊 Analytics
                  </Button>
                </>
              ) : (
                // Interactive buttons for other roles
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card expansion
                      handleQuickDataEntry(child, "complete", e);
                    }}
                    sx={{
                      py: 0.5,
                      px: 1.5,
                      fontSize: "1.1rem",
                      minWidth: "auto",
                      borderRadius: 1,
                      background: completedToday
                        ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                    title="View today's daily care summary with timestamps and edit options"
                  >
                    {completedToday ? "Daily Report" : "Daily Report"}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Expandable Content */}
        <Collapse in={isCategoryExpanded(child.id, "careTeam")}>
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            {/* Diagnosis Chips */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <DiagnosisIcon sx={{ color: "#FF6B6B", fontSize: 16 }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#FF6B6B" }}
                >
                  Diagnosis
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pl: 2 }}>
                {child.concerns?.map((concern, index) => (
                  <Chip
                    key={index}
                    label={concern.label || concern}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.95rem",
                      borderRadius: 1,
                      bgcolor: alpha("#FF6B6B", 0.15),
                      color: "#FF6B6B",
                      fontWeight: 600,
                    }}
                  />
                )) ||
                  [
                    { name: "Autism Spectrum", color: "#FF6B6B" },
                    { name: "ADHD", color: "#4ECDC4" },
                  ].map((diagnosis, index) => (
                    <Chip
                      key={index}
                      label={diagnosis.name}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.95rem",
                        borderRadius: 1,
                        bgcolor: alpha(diagnosis.color, 0.15),
                        color: diagnosis.color,
                        fontWeight: 600,
                      }}
                    />
                  ))}
              </Box>
            </Box>

            {/* Care Team Details */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <HospitalIcon sx={{ color: "#9B59B6", fontSize: 16 }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#9B59B6" }}
                >
                  Care Team
                </Typography>
                {/* Only show + button for parents */}
                {(userRole === "primary_parent" ||
                  userRole === "co_parent") && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInviteTeamMember(child.id);
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 12, color: "white" }} />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ pl: 2 }}>
                {/* Professional Team */}
                {child.users?.therapists?.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "1.2rem",
                        color: "text.secondary",
                        mb: 0.5,
                        display: "block",
                      }}
                    >
                      Professional
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {child.users.therapists.map((therapistId, index) => (
                        <Chip
                          key={index}
                          label={
                            therapistId === user?.uid
                              ? "You"
                              : `Therapist ${index + 1}`
                          }
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.95rem",
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Family & Caregivers */}
                {(() => {
                  const members = [
                    ...(child.users?.co_parents || []).map((id) => ({
                      id,
                      role: "Co-Parent",
                    })),
                    ...(child.users?.family_members || []).map((id) => ({
                      id,
                      role: "Family",
                    })),
                    ...(child.users?.caregivers || []).map((id) => ({
                      id,
                      role: "Caregiver",
                    })),
                  ];
                  return (
                    members.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "1.2rem",
                            color: "text.secondary",
                            mb: 0.5,
                            display: "block",
                          }}
                        >
                          Family & Caregivers
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {members.map((member, index) => {
                            const color =
                              member.role === "Co-Parent"
                                ? theme.palette.primary.main
                                : member.role === "Family"
                                  ? "#EB684A"
                                  : "#FF8C42";

                            return (
                              <Chip
                                key={index}
                                label={
                                  member.id === user?.uid
                                    ? `You (${member.role})`
                                    : member.role
                                }
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.95rem",
                                  borderRadius: 1,
                                  bgcolor: alpha(color, 0.15),
                                  color: color,
                                  fontWeight: 600,
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    )
                  );
                })()}

                {/* Empty state */}
                {!child.users?.therapists?.length &&
                  !child.users?.co_parents?.length &&
                  !child.users?.family_members?.length &&
                  !child.users?.caregivers?.length && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontStyle: "italic",
                        fontSize: "1.05rem",
                      }}
                    >
                      No team members added yet
                    </Typography>
                  )}
              </Box>
            </Box>

            {/* Enhanced Grouped Action Layout */}
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 3, 
                mt: 3,
                '& > *': {
                  animationDelay: (index) => `${index * 0.1}s`,
                }
              }}
            >
              {getActionGroups(userRole).map((group, index) => (
                <Box
                  key={group.id}
                  sx={{
                    opacity: 0,
                    animation: 'slideIn 0.6s ease-out forwards',
                    animationDelay: `${index * 0.15}s`,
                    '@keyframes slideIn': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(20px)',
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0px)',
                      },
                    },
                  }}
                >
                  <ActionGroup
                    key={group.id}
                    group={group}
                    child={child}
                    onActionClick={handleGroupActionClick}
                    completionStatus={{
                      // Map existing status to new structure
                      mood: status.mood,
                      sleep: status.sleep,
                      energy: status.energy,
                      // For now, other actions are not tracked
                      daily: false,
                      food_health: false,
                      behavior_sensory: false,
                      progress: false,
                      safety: false,
                      routines: false,
                      notes: false,
                      access: false,
                    }}
                    defaultExpanded={isCategoryExpanded(child.id, group.id)}
                    highlightedActions={{
                      mood: isActionHighlighted(child.id, 'mood'),
                      sleep: isActionHighlighted(child.id, 'sleep'),
                      energy: isActionHighlighted(child.id, 'energy'),
                    }}
                  />
                </Box>
              ))}


              {/* Show completed quick entries as badges */}
              {(status.mood || status.sleep || status.energy) && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.95rem", color: "text.secondary", mr: 1 }}
                  >
                    Logged:
                  </Typography>
                  {status.mood && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        py: 0.25,
                        px: 0.75,
                        borderRadius: 1,
                        bgcolor: alpha("#E91E63", 0.1),
                      }}
                    >
                      <Typography sx={{ fontSize: "1.1rem" }}>😊</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "1.1rem",
                          color: "#E91E63",
                          fontWeight: 500,
                        }}
                      >
                        Mood
                      </Typography>
                    </Box>
                  )}

                  {status.sleep && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        py: 0.25,
                        px: 0.75,
                        borderRadius: 1,
                        bgcolor: alpha("#673AB7", 0.1),
                      }}
                    >
                      <Typography sx={{ fontSize: "1.1rem" }}>😴</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "1.1rem",
                          color: "#673AB7",
                          fontWeight: 500,
                        }}
                      >
                        Sleep
                      </Typography>
                    </Box>
                  )}

                  {status.energy && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        py: 0.25,
                        px: 0.75,
                        borderRadius: 1,
                        bgcolor: alpha("#FF9800", 0.1),
                      }}
                    >
                      <Typography sx={{ fontSize: "1.1rem" }}>⚡</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "1.1rem",
                          color: "#FF9800",
                          fontWeight: 500,
                        }}
                      >
                        Energy
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Collapse>
      </Card>
    );
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
                      return renderChildCard(child, "own");
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
                      return renderChildCard(child, "family");
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
                      return renderChildCard(child, "professional");
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

      {/* Daily Report Modal */}
      <DailyReportModal
        open={showDailyReportModal}
        onClose={handleCloseDailyReportModal}
        child={dailyReportChild}
        onEditAction={handleDailyReportEdit}
      />
    </Container>
  );
};

export default PanelDashboard;
