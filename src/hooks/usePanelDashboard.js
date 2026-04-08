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
import { getTimelineMetaForCategory } from "../constants/logTypeRegistry";

const toEntryDate = (timestamp) => timestamp?.toDate?.() || new Date(timestamp);

const formatTimeForSummary = (timestamp) => {
  const date = toEntryDate(timestamp);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getActivityStreak = (entries = []) => {
  if (!entries.length) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const hasEntryForDay = entries.some((entry) => {
      const entryDate = toEntryDate(entry.timestamp);
      return !Number.isNaN(entryDate.getTime()) && entryDate >= dayStart && entryDate < dayEnd;
    });

    if (hasEntryForDay) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
};

const serializeEntriesByChild = (entriesByChild = {}) => {
  const normalized = Object.keys(entriesByChild)
    .sort()
    .reduce((acc, childId) => {
      acc[childId] = (entriesByChild[childId] || []).map((entry) => ({
        id: entry.id,
        timestamp: toEntryDate(entry.timestamp).getTime(),
        type: entry.type,
        collection: entry.collection || null,
      }));
      return acc;
    }, {});

  return JSON.stringify(normalized);
};

const serializeSummaryByChild = (summaryByChild = {}) => {
  const normalized = Object.keys(summaryByChild)
    .sort()
    .reduce((acc, childId) => {
      const summary = summaryByChild[childId] || {};
      acc[childId] = {
        totalEntries: summary.totalEntries || 0,
        todayCount: summary.todayCount || 0,
        weekCount: summary.weekCount || 0,
        activityStreak: summary.activityStreak || 0,
        lastActivityTime: summary.lastActivityTime || null,
      };
      return acc;
    }, {});

  return JSON.stringify(normalized);
};

export const usePanelDashboard = ({ activeChildOnly = false } = {}) => {
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
  const [allEntries, setAllEntries] = useState({});
  const [recentEntries, setRecentEntries] = useState({});
  const [timelineSummary, setTimelineSummary] = useState({});
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
  const [quickEntryStep, setQuickEntryStep] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [highlightedActions] = useState({});
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [selectedChildForEdit, setSelectedChildForEdit] = useState(null);
  const [showDailyCareModal, setShowDailyCareModal] = useState(false);
  const [dailyCareAction, setDailyCareAction] = useState(null);
  const [dailyCareChild, setDailyCareChild] = useState(null);
  const [showSleepLogSheet, setShowSleepLogSheet] = useState(false);
  const [sleepLogChild, setSleepLogChild] = useState(null);
  const [showFoodLogSheet, setShowFoodLogSheet] = useState(false);
  const [foodLogChild, setFoodLogChild] = useState(null);
  const [showBathroomLogSheet, setShowBathroomLogSheet] = useState(false);
  const [bathroomLogChild, setBathroomLogChild] = useState(null);
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
  const [dailyHabitsInitialCategoryId, setDailyHabitsInitialCategoryId] = useState(null);
  const [showCareReportModal, setShowCareReportModal] = useState(false);
  const [careReportChild, setCareReportChild] = useState(null);
  const childrenAccessKey = (childrenWithAccess || []).map((child) => child.id).join('|');
  const childIdsKey = (children || []).map((child) => child.id).join('|');

  useEffect(() => {
    // Start SW quick response listener once on mount
    startQuickResponseListener();

    if (roleLoading) return;

    const loadChildren = async () => {
      try {
        const childrenWithRoles = childrenWithAccess || [];
        setChildren(childrenWithRoles);

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
  }, [roleLoading, childrenAccessKey, childrenWithAccess]);

  useEffect(() => {
    if (!currentChildId && children.length > 0) {
      setCurrentChildId(children[0].id);
    }
  }, [currentChildId, children, setCurrentChildId]);

  useEffect(() => {
    const unsubscribes = [];
    const entriesByChild = {};
    const allEntriesByChild = {};
    const timelineSummaryByChild = {};
    const incidentsByChild = {};
    const subscribedChildren = activeChildOnly && currentChildId
      ? children.filter((child) => child.id === currentChildId)
      : children;

    subscribedChildren.forEach((child) => {
      // Fetch timeline entries
      const timelineUnsubscribe = getTimelineEntries(child.id, (entries) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const todaysEntries = entries
          .filter((entry) => {
            const entryDate = toEntryDate(entry.timestamp);
            return !Number.isNaN(entryDate.getTime()) && entryDate >= todayStart;
          })
          .sort((a, b) => {
            const aTime = toEntryDate(a.timestamp);
            const bTime = toEntryDate(b.timestamp);
            return bTime - aTime;
          });

        const weekEntries = entries.filter((entry) => {
          const entryDate = toEntryDate(entry.timestamp);
          return !Number.isNaN(entryDate.getTime()) && entryDate >= weekAgo;
        });

        const fullTimelineEntries = [...entries];
        const recentTimelineEntries = entries
          .filter((entry) => {
            const entryDate = toEntryDate(entry.timestamp);
            return !Number.isNaN(entryDate.getTime()) && entryDate >= weekAgo;
          })
          .sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp))
          .slice(0, 5);

        allEntriesByChild[child.id] = fullTimelineEntries;
        entriesByChild[child.id] = recentTimelineEntries;
        timelineSummaryByChild[child.id] = {
          totalEntries: todaysEntries.length,
          todayCount: todaysEntries.length,
          weekCount: weekEntries.length,
          activityStreak: getActivityStreak(entries),
          lastActivityTime: todaysEntries[0] ? formatTimeForSummary(todaysEntries[0].timestamp) : null,
        };
        setRecentEntries((current) => {
          const next = { ...entriesByChild };
          return serializeEntriesByChild(current) === serializeEntriesByChild(next) ? current : next;
        });
        setAllEntries((current) => {
          const next = { ...allEntriesByChild };
          return serializeEntriesByChild(current) === serializeEntriesByChild(next) ? current : next;
        });
        setTimelineSummary((current) => {
          const next = { ...timelineSummaryByChild };
          return serializeSummaryByChild(current) === serializeSummaryByChild(next) ? current : next;
        });
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
  }, [childIdsKey, currentChildId, activeChildOnly]);

  useEffect(() => {
    if (!children.length) {
      return undefined;
    }

    const handleTimelineEntryCreated = (event) => {
      const entry = event?.detail;
      if (!entry || entry.collection !== 'dailyLogs' || !entry.childId) {
        return;
      }

      const entryTimestamp = toEntryDate(entry.timestamp);
      if (Number.isNaN(entryTimestamp.getTime())) {
        return;
      }

      const meta = getTimelineMetaForCategory(entry.category, { importantMoment: !!entry.importantMoment });
      const optimisticEntry = {
        id: entry.id || `local-${Date.now()}`,
        childId: entry.childId,
        type: meta.type,
        timelineType: meta.type,
        collection: 'dailyLogs',
        category: entry.category || 'log',
        title: entry.title || entry.titlePrefix || entry.text || meta.label,
        content: entry.text || entry.content || '',
        text: entry.text || entry.content || '',
        notes: entry.notes || entry.bathroomDetails?.notes || null,
        timestamp: entryTimestamp,
        icon: meta.icon,
        color: meta.color,
        tags: entry.tags || [],
        importantMoment: !!entry.importantMoment,
        author: entry.authorName || entry.author || entry.loggedByUser || entry.authorEmail || 'Unknown',
        loggedByUser: entry.authorName || entry.author || entry.loggedByUser || entry.authorEmail || 'Unknown',
        userRole: entry.authorRole || null,
        userId: entry.authorId || entry.createdBy || null,
      };

      setRecentEntries((current) => {
        const currentEntries = current[entry.childId] || [];
        const nextEntries = [
          optimisticEntry,
          ...currentEntries.filter((item) => item.id !== optimisticEntry.id),
        ]
          .sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp))
          .slice(0, 5);

        return {
          ...current,
          [entry.childId]: nextEntries,
        };
      });

      setAllEntries((current) => {
        const currentEntries = current[entry.childId] || [];
        const nextEntries = [
          optimisticEntry,
          ...currentEntries.filter((item) => item.id !== optimisticEntry.id),
        ].sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp));

        return {
          ...current,
          [entry.childId]: nextEntries,
        };
      });

      setTimelineSummary((current) => {
        const childSummary = current[entry.childId] || {};
        const childEntries = (allEntries[entry.childId] || []).length > 0
          ? [optimisticEntry, ...(allEntries[entry.childId] || []).filter((item) => item.id !== optimisticEntry.id)]
          : [optimisticEntry];
        const todaysEntries = childEntries.filter((item) => {
          const dayEntryDate = toEntryDate(item.timestamp);
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          return !Number.isNaN(dayEntryDate.getTime()) && dayEntryDate >= todayStart;
        });

        return {
          ...current,
          [entry.childId]: {
            ...childSummary,
            totalEntries: Math.max(childSummary.totalEntries || 0, todaysEntries.length),
            todayCount: Math.max(childSummary.todayCount || 0, todaysEntries.length),
            weekCount: Math.max(childSummary.weekCount || 0, childEntries.length),
            activityStreak: Math.max(childSummary.activityStreak || 0, 1),
            lastActivityTime: formatTimeForSummary(entryTimestamp),
          },
        };
      });
    };

    window.addEventListener('captureez:timeline-entry-created', handleTimelineEntryCreated);
    return () => window.removeEventListener('captureez:timeline-entry-created', handleTimelineEntryCreated);
  }, [children, allEntries]);

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

    if (type === "mood") {
      setDailyCareAction(type);
      setDailyCareChild(child);
      setShowDailyCareModal(true);
      return;
    }

    if (type === "sleep") {
      setSleepLogChild(child);
      setShowSleepLogSheet(true);
      return;
    }

    if (type === "medication" || type === "diaper") {
      setDailyHabitsChild(child);
      setDailyHabitsInitialCategoryId(null);
      setShowDailyHabitsModal(true);
      return;
    }

    if (type === "incident") {
      setIncidentChild(child);
      setShowIncidentModal(true);
      return;
    }

    if (type === "journal") {
      setSelectedChild(child);
      setEntryType("full");
      setQuickEntryStep(0);
      setShowQuickEntry(true);
      return;
    }

    if (type === "complete") {
      setDailyReportChild(child);
      setShowDailyReportModal(true);
    } else {
      setSelectedChild(child);
      setEntryType("full");
      // Set initial step based on type
      if (type === "quick_note") {
        setQuickEntryStep(2);
      } else {
        setQuickEntryStep(0);
      }
      setShowQuickEntry(true);
    }
  };

  const handleQuickEntryComplete = (entry) => {
    if (selectedChild && entry?.text) {
      const meta = getTimelineMetaForCategory(entry.category, { importantMoment: !!entry.importantMoment });
      const optimisticEntry = {
        id: `local-${Date.now()}`,
        childId: selectedChild.id,
        type: meta.type,
        timelineType: meta.type,
        category: entry.category || 'log',
        title: entry.title || entry.titlePrefix || meta.label,
        content: entry.text,
        text: entry.text,
        notes: entry.notes || entry.bathroomDetails?.notes || null,
        timestamp: entry.timestamp || new Date(),
        icon: meta.icon,
        color: meta.color,
        collection: 'dailyLogs',
        tags: entry.tags || [],
        importantMoment: entry.importantMoment || false,
      };

      setRecentEntries((prev) => {
        const nextEntries = [optimisticEntry, ...(prev[selectedChild.id] || [])]
          .sort((a, b) => {
            const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return bTime - aTime;
          })
          .slice(0, 5);

        return {
          ...prev,
          [selectedChild.id]: nextEntries,
        };
      });

      setTimelineSummary((prev) => {
        const currentSummary = prev[selectedChild.id] || {};
        const nextTodayCount = (currentSummary.todayCount || 0) + 1;
        const nextWeekCount = (currentSummary.weekCount || 0) + 1;
        const nextLastActivityTime = formatTimeForSummary(optimisticEntry.timestamp);

        return {
          ...prev,
          [selectedChild.id]: {
            totalEntries: nextTodayCount,
            todayCount: nextTodayCount,
            weekCount: nextWeekCount,
            activityStreak: currentSummary.activityStreak || 1,
            lastActivityTime: nextLastActivityTime,
          },
        };
      });
    }

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
    // Navigate to role selection page with child pre-selected
    navigate('/invite', { state: { childId } });
  };

  const handleEditChild = (child) => {
    setSelectedChildForEdit(child);
    setShowEditChildModal(true);
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

  const handleCloseSleepLogSheet = () => {
    setShowSleepLogSheet(false);
    setSleepLogChild(null);
  };

  const handleCloseFoodLogSheet = () => {
    setShowFoodLogSheet(false);
    setFoodLogChild(null);
  };

  const handleCloseBathroomLogSheet = () => {
    setShowBathroomLogSheet(false);
    setBathroomLogChild(null);
  };

  const handleDailyReportEdit = (actionType) => {
    if (actionType === 'sleep') {
      setSleepLogChild(dailyReportChild);
      setShowSleepLogSheet(true);
      return;
    }

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
    setDailyHabitsInitialCategoryId(null);
  };

  const handleShowCareReport = (child) => {
    setCareReportChild(child);
    setShowCareReportModal(true);
  };

  const handleCloseCareReportModal = () => {
    setShowCareReportModal(false);
    setCareReportChild(null);
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
    setCareReportChild(child);
    setShowCareReportModal(true);
  };

  const handleOpenMedicalLog = (child) => {
    if (!child) {
      return;
    }

    setCurrentChildId(child.id);
    navigate('/medical');
  };

  const handleOpenSleepLog = (child) => {
    if (!child || !canAddDataForChild?.(child.id)) {
      return;
    }

    setCurrentChildId(child.id);
    setSleepLogChild(child);
    setShowSleepLogSheet(true);
  };

  const handleTrack = (child, initialCategoryId = null) => {
    if (!child || !canAddDataForChild?.(child.id)) {
      return;
    }

    setCurrentChildId(child.id);

    if (initialCategoryId === 'sleep') {
      setSleepLogChild(child);
      setShowSleepLogSheet(true);
      return;
    }

    if (initialCategoryId === 'food') {
      setFoodLogChild(child);
      setShowFoodLogSheet(true);
      return;
    }

    if (initialCategoryId === 'bathroom' || initialCategoryId === 'diaper') {
      setBathroomLogChild(child);
      setShowBathroomLogSheet(true);
      return;
    }

    setDailyHabitsChild(child);
    setDailyHabitsInitialCategoryId(initialCategoryId || null);
    setShowDailyHabitsModal(true);
  };

  const handleOpenFoodLog = (child) => {
    if (!child || !canAddDataForChild?.(child.id)) {
      return;
    }

    setCurrentChildId(child.id);
    setFoodLogChild(child);
    setShowFoodLogSheet(true);
  };

  const handleOpenBathroomLog = (child) => {
    if (!child || !canAddDataForChild?.(child.id)) {
      return;
    }

    setCurrentChildId(child.id);
    setBathroomLogChild(child);
    setShowBathroomLogSheet(true);
  };

  const handleMessages = async (child) => {
    if (!child?.id) {
      return;
    }

    setCurrentChildId(child.id);

    const searchParams = new URLSearchParams({
      childId: child.id,
      openChildChat: '1',
      returnToDashboard: '1',
    });

    navigate(`/messages?${searchParams.toString()}`, {
      state: {
        selectedChildId: child.id,
        openChildChat: true,
        returnToDashboard: true,
      }
    });
  };

  const refreshDashboard = async () => {
    await refreshRoles();

    const childIdToRefresh = currentChildId || children[0]?.id;
    if (childIdToRefresh) {
      await refreshDailyCareStatus(childIdToRefresh);
    }
  };

  const handleGroupActionClick = (action, child) => {
    setCurrentChildId(child.id);

    if (action.key === "sleep") {
      setSleepLogChild(child);
      setShowSleepLogSheet(true);
      return;
    }

    if (["mood", "food_health", "safety"].includes(action.key)) {
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



  const ownChildren = children.filter(child => getUserRoleForChild?.(child.id) === USER_ROLES.CARE_OWNER);
  const familyChildren = children.filter(child => getUserRoleForChild?.(child.id) === USER_ROLES.CARE_PARTNER);
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
    allEntries,
    recentEntries,
    timelineSummary,
    incidents,
    expandedCards,
    expandedCategories,
    highlightedActions,
    showAddChildModal,
    showEditChildModal,
    selectedChildForEdit,
    showDailyCareModal,
    dailyCareAction,
    dailyCareChild,
    showSleepLogSheet,
    sleepLogChild,
    showFoodLogSheet,
    foodLogChild,
    showBathroomLogSheet,
    bathroomLogChild,
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
    dailyHabitsInitialCategoryId,
    dailyHabitsChild,
    showQuickEntry,
    selectedChild,
    entryType,
    quickEntryStep,
    currentChildId,
    USER_ROLES,
    isReadOnlyForChild,
    getUserRoleForChild,
    setCurrentChildId,
    setExpandedCategories,
    setShowAddChildModal,
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
    handleAddChildSuccess,
    setShowEditChildModal,
    setSelectedChildForEdit,
    handleEditChildSuccess,
    handleCloseDailyCareModal,
    handleCloseSleepLogSheet,
    handleCloseFoodLogSheet,
    handleCloseBathroomLogSheet,
    handleDailyCareComplete,
    handleCloseDailyReportModal,
    handleDailyReportEdit,
    handleCloseIncidentModal,
    handleCloseFollowUpModal,
    handleClosePatternSuggestionModal,
    handleCreateCustomCategories,
    setShowDailyHabitsModal,
    handleCloseDailyHabitsModal,
    handleTrack,
    handleOpenSleepLog,
    handleOpenFoodLog,
    handleOpenBathroomLog,
    handleOpenMedicalLog,
    handleShowCareReport,
    handleCloseCareReportModal,
    showCareReportModal,
    careReportChild,
    checkForPatterns,
    handleQuickEntryComplete,
    handleQuickEntrySkip,
    refreshDailyCareStatus,
    refreshDashboard,
  };
};
