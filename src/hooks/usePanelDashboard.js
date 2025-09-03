import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import { useChildContext } from "../contexts/ChildContext";
import { getTimelineEntries, TIMELINE_TYPES } from "../services/timelineService";
import { useRole } from "../contexts/RoleContext";
import { useDailyCareStatus } from "./useDailyCareStatus";
import { listenForFollowUps, initializeNotificationsForPendingFollowUps, processQuickResponses, startQuickResponseListener } from "../services/followUpService";
import { analyzeOtherIncidentPatterns, getIncidents } from "../services/incidentService";

export const usePanelDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { currentChildId, setCurrentChildId } = useChildContext();
  const {
    loading: roleLoading,
    childrenWithAccess,
    getUserRoleForChild,
    canAddDataForChild,
    isReadOnlyForChild,
    refreshRoles,
    USER_ROLES,
  } = useRole();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState({});
  const [incidents, setIncidents] = useState({}); // Store incidents by child ID
  
  // Use separated Daily Care status hook
  const { 
    completionStatus: quickDataStatus, 
    refreshChildStatus: refreshDailyCareStatus,
    loading: dailyCareLoading 
  } = useDailyCareStatus(children);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [entryType, setEntryType] = useState("micro"); // 'micro' or 'full'
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [highlightedActions, setHighlightedActions] = useState({});
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
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentChild, setIncidentChild] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpIncident, setFollowUpIncident] = useState(null);
  const [showPatternSuggestionModal, setShowPatternSuggestionModal] = useState(false);
  const [patternSuggestions, setPatternSuggestions] = useState([]);
  const [suggestionsChildId, setSuggestionsChildId] = useState(null);
  const [showDailyHabitsModal, setShowDailyHabitsModal] = useState(false);
  const [dailyHabitsChild, setDailyHabitsChild] = useState(null);

  useEffect(() => {
    // Start SW quick response listener once on mount
    startQuickResponseListener();

    if (roleLoading) return;

    const loadChildren = async () => {
      try {
        const childrenWithRoles = childrenWithAccess || [];
        setChildren(childrenWithRoles);
        if (childrenWithRoles.length > 0 && !currentChildId) {
          setCurrentChildId(childrenWithRoles[0].id);
        }
        
        // Initialize notifications for pending follow-ups
        if (childrenWithRoles.length > 0) {
          initializeNotificationsForPendingFollowUps(childrenWithRoles);
          
          // Process any quick responses from notifications
          processQuickResponses().then(processedResponses => {
            if (processedResponses.length > 0) {
              console.log(`📱 Processed ${processedResponses.length} quick responses from notifications`);
              // Could show a toast or update UI to reflect the processed responses
            }
          });
        }
      } catch (error) {
        console.error("Error loading children:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [roleLoading, childrenWithAccess, currentChildId, setCurrentChildId]);

  useEffect(() => {
    const unsubscribes = [];
    const entriesByChild = {};
    const incidentsByChild = {};

    children.forEach((child) => {
      // Fetch timeline entries
      const timelineUnsubscribe = getTimelineEntries(child.id, (entries) => {
        const recentTimelineEntries = entries
          .filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return entryDate >= weekAgo;
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);

        entriesByChild[child.id] = recentTimelineEntries;
        setRecentEntries({ ...entriesByChild });
      });

      // Fetch incidents (for unified daily log)
      const fetchIncidents = async () => {
        try {
          const childIncidents = await getIncidents(child.id);
          incidentsByChild[child.id] = childIncidents;
          setIncidents({ ...incidentsByChild });
        } catch (error) {
          console.error(`Error fetching incidents for child ${child.id}:`, error);
          incidentsByChild[child.id] = [];
          setIncidents({ ...incidentsByChild });
        }
      };

      fetchIncidents();
      unsubscribes.push(timelineUnsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }, [children]);

  // Listen for follow-up reminders
  useEffect(() => {
    if (children.length === 0) return;

    const childIds = children.map(child => child.id);
    
    const handleFollowUpNeeded = (incident) => {
      setFollowUpIncident(incident);
      setShowFollowUpModal(true);
    };

    const cleanup = listenForFollowUps(childIds, handleFollowUpNeeded);
    
    return cleanup;
  }, [children]);

  const handleQuickDataEntry = (child, type, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!canAddDataForChild(child.id)) {
      console.log("User does not have permission to add data for this child");
      return;
    }

    setCurrentChildId(child.id);

    if (type === "mood" || type === "sleep") {
      setDailyCareAction(type);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
      return;
    }

    if (type === "incident") {
      setIncidentChild(child);
      setShowIncidentModal(true);
      return;
    }

    if (type === "journal") {
      setDailyHabitsChild(child);
      setShowDailyHabitsModal(true);
      return;
    }

    if (type === "complete") {
      setDailyReportChild(child);
      setShowDailyReportModal(true);
    } else {
      setSelectedChild(child);
      setEntryType("full");
      setShowQuickEntry(true);
    }
  };

  const handleQuickEntryComplete = (data) => {
    setShowQuickEntry(false);
    setSelectedChild(null);
  };

  const handleQuickEntrySkip = () => {
    setShowQuickEntry(false);
    setSelectedChild(null);
  };

  const toggleCard = (childId) => {
    setExpandedCards((prev) => ({ ...prev, [childId]: !prev[childId] }));
  };

  const isCardExpanded = (childId) => expandedCards[childId] || false;

  const handleInviteTeamMember = (childId) => {
    setInviteChildId(childId);
    setShowInviteModal(true);
  };

  const handleEditChild = (child) => {
    setSelectedChildForEdit(child);
    setShowEditChildModal(true);
  };

  const handleInviteSuccess = (result) => {
    refreshRoles();
  };

  const handleAddChildSuccess = () => {
    setShowAddChildModal(false);
    refreshRoles();
  };

  const handleEditChildSuccess = () => {
    setShowEditChildModal(false);
    setSelectedChildForEdit(null);
    refreshRoles();
  };

  const handleDailyCareComplete = async (actionType, entryData) => {
    // Refresh the real Daily Care status from database
    await refreshDailyCareStatus(entryData.childId);
  };

  const handleCloseDailyCareModal = () => {
    setShowDailyCareModal(false);
    setDailyCareAction(null);
    setDailyCareChild(null);
  };

  const handleDailyReportEdit = (actionType) => {
    setDailyCareAction(actionType);
    setDailyCareChild(dailyReportChild);
    setShowDailyCareModal(true);
  };

  const handleCloseDailyReportModal = () => {
    setShowDailyReportModal(false);
    setDailyReportChild(null);
  };

  const handleCloseIncidentModal = () => {
    setShowIncidentModal(false);
    const childId = incidentChild?.id;
    setIncidentChild(null);
    
    // Check for patterns after a delay to allow the new incident to be processed
    if (childId) {
      setTimeout(() => {
        checkForPatterns(childId);
      }, 1000);
    }
  };

  const handleCloseFollowUpModal = () => {
    setShowFollowUpModal(false);
    setFollowUpIncident(null);
  };

  const checkForPatterns = async (childId) => {
    try {
      const suggestions = await analyzeOtherIncidentPatterns(childId);
      if (suggestions.length > 0) {
        setPatternSuggestions(suggestions);
        setSuggestionsChildId(childId);
        setShowPatternSuggestionModal(true);
      }
    } catch (error) {
      console.error('Error checking for patterns:', error);
    }
  };

  const handleClosePatternSuggestionModal = () => {
    setShowPatternSuggestionModal(false);
    setPatternSuggestions([]);
    setSuggestionsChildId(null);
  };

  const handleCloseDailyHabitsModal = () => {
    setShowDailyHabitsModal(false);
    setDailyHabitsChild(null);
  };

  const handleCreateCustomCategories = (categories) => {
    // In a full implementation, this would create custom incident types
    // For now, we'll just log them and show a success message
    console.log('Creating custom categories:', categories);
    // Here you would typically:
    // 1. Save custom categories to user preferences
    // 2. Update the INCIDENT_TYPES with user's custom types
    // 3. Show success feedback
  };

  const handleDailyReport = (child) => {
    setDailyReportChild(child);
    setShowDailyReportModal(true);
  };

  const handleMessages = (child) => {
    // Navigate to messages page with child context
    setCurrentChildId(child.id);
    navigate("/messages", { state: { selectedChildId: child.id } });
  };

  const handleGroupActionClick = (action, child) => {
    setCurrentChildId(child.id);

    if (["mood", "sleep", "food_health", "safety"].includes(action.key)) {
      setDailyCareAction(action.key);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
      return;
    }

    if (action.key === "incident") {
      setIncidentChild(child);
      setShowIncidentModal(true);
      return;
    }

    if (action.key === "professional_note") return;
    if (action.key === "timeline") return;
    if (action.key === "report") return;

    switch (action.key) {
      case "messages":
        navigate("/messages");
        break;
      case "routines":
        alert("Routines & Appointments: Navigate to scheduling page (to be implemented)");
        break;
      case "notes":
        alert("Caregiver Notes: Navigate to notes management (to be implemented)");
        break;
      case "access":
        alert("Shared Access: Navigate to access management (to be implemented)");
        break;
      default:
        console.log(`Action ${action.key} not yet implemented`);
    }
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

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteChildId(null);
  };


  const ownChildren = children.filter(child => getUserRoleForChild?.(child.id) === USER_ROLES.PRIMARY_PARENT);
  const familyChildren = children.filter(child => [USER_ROLES.CO_PARENT, USER_ROLES.FAMILY_MEMBER].includes(getUserRoleForChild?.(child.id)));
  const professionalChildren = children.filter(child => [USER_ROLES.CAREGIVER, USER_ROLES.THERAPIST].includes(getUserRoleForChild?.(child.id)));

  return {
    user,
    theme,
    loading: loading || roleLoading || dailyCareLoading,
    children,
    ownChildren,
    familyChildren,
    professionalChildren,
    quickDataStatus,
    recentEntries,
    incidents,
    expandedCards,
    expandedCategories,
    highlightedActions,
    showInviteModal,
    inviteChildId,
    showAddChildModal,
    showEditChildModal,
    selectedChildForEdit,
    showDailyCareModal,
    dailyCareAction,
    dailyCareChild,
    showDailyReportModal,
    dailyReportChild,
    showIncidentModal,
    incidentChild,
    showFollowUpModal,
    followUpIncident,
    showPatternSuggestionModal,
    patternSuggestions,
    suggestionsChildId,
    showDailyHabitsModal,
    dailyHabitsChild,
    showQuickEntry,
    selectedChild,
    entryType,
    USER_ROLES,
    isReadOnlyForChild,
    getUserRoleForChild,
    setExpandedCategories,
    setShowAddChildModal,
    setShowInviteModal,
    handleInviteTeamMember,
    isCardExpanded,
    toggleCard,
    handleQuickDataEntry,
    handleEditChild,
    handleDailyReport,
    handleMessages,
    handleGroupActionClick,
    getTypeConfig,
    formatTimeAgo,
    handleCloseInviteModal,
    handleInviteSuccess,
    handleAddChildSuccess,
    setShowEditChildModal,
    setSelectedChildForEdit,
    handleEditChildSuccess,
    handleCloseDailyCareModal,
    handleDailyCareComplete,
    handleCloseDailyReportModal,
    handleDailyReportEdit,
    handleCloseIncidentModal,
    handleCloseFollowUpModal,
    handleClosePatternSuggestionModal,
    handleCreateCustomCategories,
    handleCloseDailyHabitsModal,
    checkForPatterns,
    handleQuickEntryComplete,
    handleQuickEntrySkip,
    refreshDailyCareStatus,
  };
};
