import { useState, useEffect, useMemo } from "react";
import {
  withTimelinePermissions,
  getCareOwnerTimelineView,
} from "../../services/timeline/timelinePermissionService";
import { useRole } from "../../contexts/RoleContext";
import { USER_ROLES } from "../../constants/roles";
import { CATEGORY_COLORS } from "../../constants/categoryColors";
import { getCustomCategories, getIncidentTypeConfig } from "../../services/incidentService";
import { HABIT_TYPES } from "../../constants/habitTypes";
import {
  LOG_TYPES,
  getLogTypeByEntry,
  getTimelineMetaForCategory,
  SPECIAL_FILTER_TYPES,
} from "../../constants/logTypeRegistry";
import { dedupeTimelineEntries } from "../../services/timeline/timelineDeduping";

const HABIT_CATEGORY_ICON_MAP = {
  mood: "🙂",
  sleep: "😴",
  nutrition: "🍎",
  progress: "📈",
  diaper: "🚽",
  bathroom: "🚽",
  medication: "💊",
  other: "📝",
};

const getEntryUser = (entry) => ({
  loggedByUser: entry.loggedBy?.name || entry.authorName || entry.authorEmail || null,
  userRole: entry.loggedBy?.role || entry.authorRole || null,
  userId: entry.loggedBy?.id || entry.authorId || entry.createdBy || null,
});

const getQuickJournalTitle = (entry, categoryMeta) => {
  const text = (entry.title || entry.text || "").trim();
  if (!text) {
    return categoryMeta.titlePrefix;
  }

  const firstLine = text.split("\n")[0].trim();
  if (!firstLine) {
    return categoryMeta.titlePrefix;
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
};

const getQuickNoteMeta = (entry) => {
  if (entry.importantMoment) {
    return {
      type: "importantMoment",
      timelineType: "importantMoment",
      titlePrefix: SPECIAL_FILTER_TYPES.importantMoment.titlePrefix,
      color: CATEGORY_COLORS.importantMoment.dot,
      icon: SPECIAL_FILTER_TYPES.importantMoment.icon,
    };
  }

  return getTimelineMetaForCategory(entry.category, {
    importantMoment: !!entry.importantMoment,
  });
};

export const useUnifiedTimelineData = (childId, selectedDate, filters = {}) => {
  const { getUserRoleForChild } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customCategories, setCustomCategories] = useState({});
  const [rawEntries, setRawEntries] = useState({
    incidents: [],
    journals: [],
    dailyHabits: [],
    therapyNotes: [],
  });

  const userRole = getUserRoleForChild?.(childId) || null;

  useEffect(() => {
    if (!childId || !selectedDate) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { getTimelineData } = await import("../../services/timeline/index.js");
        const timelineData = await getTimelineData(childId, selectedDate);

        setRawEntries({
          incidents: timelineData.incidents || [],
          journals: timelineData.journalEntries || [],
          dailyHabits: timelineData.dailyHabits || [],
          therapyNotes: timelineData.therapyNotes || [],
        });
      } catch (err) {
        console.error("Error fetching unified timeline data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [childId, selectedDate]);

  useEffect(() => {
    if (!childId) {
      setCustomCategories({});
      return;
    }

    let isMounted = true;

    const fetchCustomIncidentCategories = async () => {
      try {
        const categories = await getCustomCategories(childId);
        if (isMounted) {
          setCustomCategories(categories || {});
        }
      } catch (categoryError) {
        console.error("Error fetching custom incident categories:", categoryError);
        if (isMounted) {
          setCustomCategories({});
        }
      }
    };

    fetchCustomIncidentCategories();

    return () => {
      isMounted = false;
    };
  }, [childId]);

  useEffect(() => {
    if (!childId || !selectedDate) {
      return undefined;
    }

    const isSameDay = (dateA, dateB) =>
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate();

    const handleQuickEntryCreated = (event) => {
      const entry = event.detail;
      if (!entry || entry.collection !== "dailyLogs" || entry.childId !== childId) {
        return;
      }

      const entryTimestamp = entry.timestamp?.toDate
        ? entry.timestamp.toDate()
        : new Date(entry.timestamp);
      if (Number.isNaN(entryTimestamp.getTime()) || !isSameDay(entryTimestamp, selectedDate)) {
        return;
      }

      const categoryMeta = getQuickNoteMeta(entry);
      const optimisticJournal = {
        ...entry,
        timestamp: entryTimestamp,
        type: categoryMeta.type,
        timelineType: categoryMeta.timelineType,
        title: getQuickJournalTitle(entry, categoryMeta),
        titlePrefix: categoryMeta.titlePrefix,
        color: categoryMeta.color,
        categoryIcon: categoryMeta.icon,
        isImportantMoment: !!entry.importantMoment,
        ...getEntryUser(entry),
      };

      setRawEntries((prev) => ({
        ...prev,
        journals: [
          optimisticJournal,
          ...prev.journals.filter((journal) => journal.id !== optimisticJournal.id),
        ],
      }));
    };

    window.addEventListener("captureez:timeline-entry-created", handleQuickEntryCreated);
    return () =>
      window.removeEventListener("captureez:timeline-entry-created", handleQuickEntryCreated);
  }, [childId, selectedDate]);

  const processedData = useMemo(() => {
    if (!userRole) {
      return { entries: [], summary: {} };
    }

    const childFilteredEntries = {
      incidents: rawEntries.incidents.filter(
        (entry) => entry.childId === childId || entry.child?.id === childId
      ),
      journals: rawEntries.journals.filter(
        (entry) => entry.childId === childId || entry.child?.id === childId
      ),
      dailyHabits: rawEntries.dailyHabits.filter(
        (entry) => entry.childId === childId || entry.child?.id === childId
      ),
      therapyNotes: rawEntries.therapyNotes.filter(
        (entry) => entry.childId === childId || entry.child?.id === childId
      ),
    };

    const transformedEntries = [
      ...childFilteredEntries.incidents.map((incident) => {
        const incidentConfig = getIncidentTypeConfig(incident.type, customCategories);

        return {
          id: incident.id,
          type: "incident",
          collection: "incidents",
          timestamp: incident.timestamp,
          incidentCategoryId: incidentConfig?.id || incident.type || "other",
          incidentCategoryLabel:
            incidentConfig?.label || incident.customIncidentName || incident.type || "Other",
          incidentCategoryColor: incidentConfig?.color || "#6B7280",
          incidentCategoryIcon: incidentConfig?.emoji || "📝",
          isGroupedIncident: incident.isGroupedIncident,
          followUps: incident.followUps,
          totalFollowUps: incident.totalFollowUps,
          effectiveness: incident.effectiveness,
          followUpNotes: incident.followUpNotes,
          followUpCompleted: incident.followUpCompleted,
          followUpResponses: incident.followUpResponses,
          lastFollowUpResponse: incident.lastFollowUpResponse,
          incidentType: incident.type,
          severity: incident.severity,
          remedy: incident.remedy,
          notes: incident.notes,
          description: incident.description,
          summary: incident.summary,
          triggers: incident.triggers,
          duration: incident.duration,
          interventions: incident.interventions,
          mediaAttachments: incident.mediaAttachments,
          mediaURL: incident.mediaURL,
          ...getEntryUser(incident),
        };
      }),
      ...childFilteredEntries.journals.map((journal) => {
        const categoryType = getLogTypeByEntry(journal);
        const categoryMeta = getTimelineMetaForCategory(categoryType.category, {
          importantMoment: !!journal.importantMoment,
        });
        const notesText =
          journal.notes || journal.sleepDetails?.notes || journal.bathroomDetails?.notes || null;

        return {
          id: journal.id,
          type: categoryMeta.type,
          timelineType: categoryMeta.timelineType,
          collection: "dailyLogs",
          childId: journal.childId,
          timestamp: journal.timestamp?.toDate ? journal.timestamp.toDate() : new Date(journal.timestamp),
          category: categoryType.category,
          title: journal.importantMoment
            ? "Important Moment"
            : journal.titlePrefix || journal.title || categoryMeta.titlePrefix || LOG_TYPES.log.displayLabel,
          titlePrefix: journal.titlePrefix || categoryMeta.titlePrefix || null,
          color: categoryMeta.color,
          categoryIcon: categoryMeta.icon,
          text: journal.text,
          content: notesText || journal.text || null,
          tags: journal.tags,
          mediaURL: journal.mediaURL,
          mediaType: journal.mediaType,
          mediaUrls: journal.mediaUrls,
          voiceMemoURL: journal.voiceMemoURL,
          notes: notesText,
          importantMoment: !!journal.importantMoment,
          isImportantMoment: !!journal.importantMoment,
          ...getEntryUser(journal),
        };
      }),
      ...childFilteredEntries.dailyHabits.map((habit) => {
        const habitType = Object.values(HABIT_TYPES).find(({ id }) => id === habit.categoryId);

        return {
          id: habit.id,
          type: "dailyHabit",
          collection: "dailyCare",
          timestamp: habit.timestamp?.toDate ? habit.timestamp.toDate() : new Date(habit.timestamp),
          categoryId: habit.categoryId,
          categoryLabel: habit.categoryLabel || habitType?.label || "Daily Habit",
          categoryColor: habitType?.color || "#64748B",
          categoryIcon: HABIT_CATEGORY_ICON_MAP[habit.categoryId] || "📝",
          level: habit.level,
          notes: habit.notes,
          mediaUrls: habit.mediaUrls,
          ...getEntryUser(habit),
        };
      }),
      ...childFilteredEntries.therapyNotes.map((note) => ({
        id: note.id,
        type: "therapyNote",
        collection: "therapyNotes",
        timestamp: note.timestamp?.toDate ? note.timestamp.toDate() : new Date(note.timestamp),
        title: note.title || "Therapy Note",
        content: note.content,
        noteType: note.noteType,
        sessionType: note.sessionType,
        clinicalArea: note.clinicalArea,
        tags: note.tags || [],
        category: note.category,
        replies: note.replies || [],
        professionalNote: true,
        userRole: note.userRole || "therapist",
        userId: note.createdBy,
        loggedByUser: "Therapist",
      })),
    ];

    const sortedEntries = dedupeTimelineEntries(
      transformedEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    );

    let filteredEntries = sortedEntries.filter(Boolean);

    if (filters.entryTypes?.length > 0) {
      filteredEntries = filteredEntries.filter((entry) => entry && filters.entryTypes.includes(entry.type));
    }

    if (filters.importantOnly) {
      filteredEntries = filteredEntries.filter(
        (entry) =>
          entry &&
          (entry.importantMoment || entry.isImportantMoment || entry.importance === "important")
      );
    }

    if (filters.tagFilters?.length > 0) {
      const activeTagFilters = filters.tagFilters
        .map((tag) => String(tag || "").trim().toLowerCase())
        .filter(Boolean);

      filteredEntries = filteredEntries.filter((entry) => {
        if (!entry) {
          return false;
        }

        const entryTags = Array.isArray(entry.tags)
          ? entry.tags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
          : [];

        return entryTags.some((tag) => activeTagFilters.includes(tag));
      });
    }

    if (filters.userRoles?.length > 0) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry && filters.userRoles.includes(entry.userRole)
      );
    }

    if (filters.searchText?.trim()) {
      const searchTerm = filters.searchText.toLowerCase().trim();
      filteredEntries = filteredEntries.filter((entry) => {
        if (!entry) {
          return false;
        }

        const searchableText = [
          entry.text,
          entry.description,
          entry.summary,
          entry.content,
          entry.notes,
          entry.note,
          entry.title,
          entry.categoryLabel,
          entry.categoryId,
          entry.category,
          entry.incidentCategoryLabel,
          entry.incidentType,
          entry.resolution,
          ...(entry.triggers || []),
          ...(entry.interventions || []),
          ...(entry.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchTerm);
      });
    }

    const summary = {
      totalEntries: filteredEntries.length,
      incidentCount: filteredEntries.filter((e) => e?.type === "incident").length,
      journalCount: filteredEntries.filter((e) => e?.collection === "dailyLogs").length,
      dailyHabitCount: filteredEntries.filter((e) => e?.type === "dailyHabit").length,
      therapyNoteCount: filteredEntries.filter((e) => e?.type === "therapyNote").length,
      lastActivityTime:
        filteredEntries.length > 0
          ? new Date(filteredEntries[0].timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      byTimePeriod: {
        morning: {
          hasIncidents: filteredEntries.some(
            (e) => e?.type === "incident" && getTimePeriod(e.timestamp) === "morning"
          ),
          hasJournalEntries: filteredEntries.some(
            (e) => e?.collection === "dailyLogs" && getTimePeriod(e.timestamp) === "morning"
          ),
        },
        afternoon: {
          hasIncidents: filteredEntries.some(
            (e) => e?.type === "incident" && getTimePeriod(e.timestamp) === "afternoon"
          ),
          hasJournalEntries: filteredEntries.some(
            (e) => e?.collection === "dailyLogs" && getTimePeriod(e.timestamp) === "afternoon"
          ),
        },
        evening: {
          hasIncidents: filteredEntries.some(
            (e) => e?.type === "incident" && getTimePeriod(e.timestamp) === "evening"
          ),
          hasJournalEntries: filteredEntries.some(
            (e) => e?.collection === "dailyLogs" && getTimePeriod(e.timestamp) === "evening"
          ),
        },
      },
    };

    if (userRole === USER_ROLES.CARE_OWNER) {
      return getCareOwnerTimelineView(filteredEntries, summary, filters);
    }

    const permissionManager = withTimelinePermissions(userRole, null, childId);
    const roleFilteredEntries = permissionManager.filterEntries(filteredEntries, filters);
    const enhancedSummary = permissionManager.enhanceSummary(roleFilteredEntries, summary);

    return {
      entries: roleFilteredEntries,
      summary: enhancedSummary,
    };
  }, [rawEntries, filters, childId, userRole, customCategories]);

  return {
    entries: processedData.entries,
    summary: processedData.summary,
    loading,
    error,
  };
};

const getTimePeriod = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
};

export default useUnifiedTimelineData;
