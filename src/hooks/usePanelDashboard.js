import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import { useChildContext } from "../contexts/ChildContext";
import { getTimelineEntries, TIMELINE_TYPES } from "../services/timelineService";
import { useRole } from "../contexts/RoleContext";

export const usePanelDashboard = () => {
  const theme = useTheme();
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
  const [quickDataStatus, setQuickDataStatus] = useState({});
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

  useEffect(() => {
    if (roleLoading) return;

    const loadChildren = async () => {
      try {
        const childrenWithRoles = childrenWithAccess || [];
        setChildren(childrenWithRoles);
        if (childrenWithRoles.length > 0 && !currentChildId) {
          setCurrentChildId(childrenWithRoles[0].id);
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

    children.forEach((child) => {
      const unsubscribe = getTimelineEntries(child.id, (entries) => {
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

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => {
        if (unsub) unsub();
      });
    };
  }, [children]);

  useEffect(() => {
    const mockStatus = {};
    children.forEach((child) => {
      const mood = Math.random() > 0.5;
      const sleep = Math.random() > 0.4;
      const energy = Math.random() > 0.6;
      const quickEntries = [mood, sleep, energy];
      const completedQuickEntries = quickEntries.filter(Boolean).length;
      const quickCompletionRate = Math.round(
        (completedQuickEntries / quickEntries.length) * 100
      );
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

    if (!canAddDataForChild(child.id)) {
      console.log("User does not have permission to add data for this child");
      return;
    }

    setCurrentChildId(child.id);

    if (type === "mood" || type === "sleep" || type === "energy") {
      setDailyCareAction(type);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
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

  const handleDailyCareComplete = (actionType, entryData) => {
    setQuickDataStatus((prev) => ({
      ...prev,
      [entryData.childId]: {
        ...prev[entryData.childId],
        [actionType]: true,
      },
    }));
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

  const handleDailyReport = (child) => {
    setDailyReportChild(child);
    setShowDailyReportModal(true);
  };

  const handleGroupActionClick = (action, child) => {
    setCurrentChildId(child.id);

    if (["mood", "sleep", "energy", "food_health", "safety"].includes(action.key)) {
      setDailyCareAction(action.key);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
      return;
    }

    if (action.key === "professional_note") return;
    if (action.key === "timeline") return;
    if (action.key === "report") return;

    switch (action.key) {
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
    loading: loading || roleLoading,
    children,
    ownChildren,
    familyChildren,
    professionalChildren,
    quickDataStatus,
    recentEntries,
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
    handleQuickEntryComplete,
    handleQuickEntrySkip,
  };
};
