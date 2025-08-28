import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

// Incident types with their configurations - Updated with better colors
export const INCIDENT_TYPES = {
  EATING_NUTRITION: {
    id: "eating_nutrition",
    label: "Eating & Nutrition",
    color: "#10B981", // Emerald
    emoji: "🍎",
    remedies: [
      "Offered preferred food",
      "Changed texture/temperature",
      "Used different utensil",
      "Made mealtime fun",
      "Reduced distractions",
      "Offered smaller portions",
      "Tried new presentation",
      "Consulted nutritionist",
      "Other",
    ],
  },
  MOOD: {
    id: "mood",
    label: "Mood",
    color: "#F59E0B", // Amber
    emoji: "🙂",
    remedies: [
      "Provided comfort",
      "Changed environment",
      "Offered favorite activity",
      "Used calming music",
      "Applied breathing techniques",
      "Gave physical affection",
      "Talked through feelings",
      "Used distraction",
      "Other",
    ],
  },
  SLEEP: {
    id: "sleep",
    label: "Sleep",
    color: "#8B5CF6", // Violet
    emoji: "😴",
    remedies: [
      "Adjusted room temperature",
      "Used white noise",
      "Changed bedding",
      "Applied bedtime routine",
      "Reduced screen time",
      "Used weighted blanket",
      "Darkened room",
      "Offered comfort item",
      "Other",
    ],
  },
  BEHAVIORAL: {
    id: "behavioral",
    label: "Behavioral",
    color: "#EF4444", // Red
    emoji: "⚡",
    remedies: [
      "Redirect to preferred activity",
      "Provide sensory break",
      "Use visual schedule",
      "Offer choices",
      "Deep breathing exercises",
      "Remove triggers",
      "One-on-one attention",
      "Calm down area",
      "Other",
    ],
  },
  SENSORY: {
    id: "sensory",
    label: "Sensory",
    color: "#3B82F6", // Blue
    emoji: "🧩",
    remedies: [
      "Noise-canceling headphones",
      "Weighted blanket",
      "Fidget toy",
      "Dim lighting",
      "Quiet space",
      "Sensory bin activity",
      "Deep pressure input",
      "Movement break",
      "Other",
    ],
  },
  PAIN_MEDICAL: {
    id: "pain_medical",
    label: "Pain & Medical",
    color: "#EC4899", // Pink
    emoji: "🏥",
    remedies: [
      "Applied ice pack",
      "Applied heat pad",
      "Gave pain medication",
      "Contacted doctor",
      "Rest and comfort",
      "Gentle massage",
      "Changed position",
      "Distraction activity",
      "Other",
    ],
  },
  OTHER: {
    id: "other",
    label: "Other",
    color: "#6B7280", // Gray
    emoji: "📝",
    remedies: [], // Dynamic remedies based on custom incident name
  },
};

// Severity levels by incident type
export const SEVERITY_SCALES = {
  eating_nutrition: {
    1: {
      label: "Slightly Picky",
      color: "#4CAF50",
      description: "Minor food preference",
    },
    2: {
      label: "Refused Some",
      color: "#66BB6A",
      description: "Skipped parts of meal",
    },
    3: {
      label: "Ate Very Little",
      color: "#8BC34A",
      description: "Minimal intake",
    },
    4: {
      label: "Refused Most",
      color: "#CDDC39",
      description: "Only ate favorites",
    },
    5: { label: "Barely Ate", color: "#8B5CF6", description: "Few bites only" },
    6: {
      label: "Refused All Food",
      color: "#FFB300",
      description: "No solid food intake",
    },
    7: {
      label: "Refused Everything",
      color: "#FF9800",
      description: "No food or drink",
    },
    8: {
      label: "Gagging/Vomiting",
      color: "#FF7043",
      description: "Physical rejection",
    },
    9: {
      label: "Choking Risk",
      color: "#F44336",
      description: "Safety concerns",
    },
    10: {
      label: "Medical Emergency",
      color: "#D32F2F",
      description: "Immediate help needed",
    },
  },
  mood: {
    1: {
      label: "Slightly Off",
      color: "#4CAF50",
      description: "Minor mood dip",
    },
    2: {
      label: "A Bit Sad",
      color: "#66BB6A",
      description: "Temporary sadness",
    },
    3: {
      label: "Noticeably Upset",
      color: "#8BC34A",
      description: "Visible mood change",
    },
    4: {
      label: "Quite Upset",
      color: "#CDDC39",
      description: "Affecting activities",
    },
    5: {
      label: "Very Distressed",
      color: "#8B5CF6",
      description: "Seeking comfort often",
    },
    6: {
      label: "Inconsolable",
      color: "#FFB300",
      description: "Hard to comfort",
    },
    7: {
      label: "Deeply Distressed",
      color: "#FF9800",
      description: "Major emotional pain",
    },
    8: {
      label: "Extreme Distress",
      color: "#FF7043",
      description: "Overwhelming emotions",
    },
    9: {
      label: "Crisis Level",
      color: "#F44336",
      description: "Urgent emotional support needed",
    },
    10: {
      label: "Emergency",
      color: "#D32F2F",
      description: "Immediate intervention required",
    },
  },
  sleep: {
    1: {
      label: "Slightly Restless",
      color: "#4CAF50",
      description: "Minor sleep disruption",
    },
    2: {
      label: "Took Longer",
      color: "#66BB6A",
      description: "Delayed sleep onset",
    },
    3: { label: "Woke Once", color: "#8BC34A", description: "Single wake-up" },
    4: {
      label: "Multiple Wakes",
      color: "#CDDC39",
      description: "Several disruptions",
    },
    5: {
      label: "Very Restless",
      color: "#8B5CF6",
      description: "Frequent stirring",
    },
    6: {
      label: "Barely Slept",
      color: "#FFB300",
      description: "Minimal sleep achieved",
    },
    7: {
      label: "No Sleep",
      color: "#FF9800",
      description: "Unable to fall asleep",
    },
    8: {
      label: "Night Terror",
      color: "#FF7043",
      description: "Extreme sleep disturbance",
    },
    9: {
      label: "Severe Insomnia",
      color: "#F44336",
      description: "Chronic sleep issues",
    },
    10: {
      label: "Medical Concern",
      color: "#D32F2F",
      description: "Professional help needed",
    },
  },
  behavioral: {
    1: {
      label: "Slightly Defiant",
      color: "#4CAF50",
      description: "Minor resistance",
    },
    2: {
      label: "Not Listening",
      color: "#66BB6A",
      description: "Ignoring instructions",
    },
    3: {
      label: "Acting Out",
      color: "#8BC34A",
      description: "Inappropriate behavior",
    },
    4: {
      label: "Disruptive",
      color: "#CDDC39",
      description: "Affecting others",
    },
    5: {
      label: "Very Difficult",
      color: "#8B5CF6",
      description: "Major behavior issues",
    },
    6: {
      label: "Tantrum",
      color: "#FFB300",
      description: "Emotional outburst",
    },
    7: {
      label: "Aggressive",
      color: "#FF9800",
      description: "Harmful behavior",
    },
    8: {
      label: "Destructive",
      color: "#FF7043",
      description: "Damaging property",
    },
    9: {
      label: "Dangerous",
      color: "#F44336",
      description: "Risk to self/others",
    },
    10: {
      label: "Crisis",
      color: "#D32F2F",
      description: "Immediate intervention needed",
    },
  },
  sensory: {
    1: {
      label: "Slight Sensitivity",
      color: "#4CAF50",
      description: "Minor sensory reaction",
    },
    2: {
      label: "Noticeable Discomfort",
      color: "#66BB6A",
      description: "Mild sensory issues",
    },
    3: {
      label: "Avoiding Stimuli",
      color: "#8BC34A",
      description: "Sensory avoidance",
    },
    4: {
      label: "Seeking Relief",
      color: "#CDDC39",
      description: "Actively avoiding triggers",
    },
    5: {
      label: "Distressed",
      color: "#8B5CF6",
      description: "Clear sensory distress",
    },
    6: {
      label: "Very Overwhelmed",
      color: "#FFB300",
      description: "Sensory overload",
    },
    7: {
      label: "Shutdown",
      color: "#FF9800",
      description: "Sensory system overwhelmed",
    },
    8: {
      label: "Meltdown",
      color: "#FF7043",
      description: "Complete sensory breakdown",
    },
    9: {
      label: "Severe Overload",
      color: "#F44336",
      description: "Extreme sensory crisis",
    },
    10: {
      label: "Emergency",
      color: "#D32F2F",
      description: "Immediate sensory intervention needed",
    },
  },
  pain_medical: {
    1: {
      label: "Mild Discomfort",
      color: "#4CAF50",
      description: "Barely noticeable",
    },
    2: {
      label: "Minor Pain",
      color: "#66BB6A",
      description: "Slight discomfort",
    },
    3: {
      label: "Noticeable Pain",
      color: "#8BC34A",
      description: "Can still play",
    },
    4: {
      label: "Moderate Pain",
      color: "#CDDC39",
      description: "Affecting some activities",
    },
    5: {
      label: "Uncomfortable",
      color: "#8B5CF6",
      description: "Seeking comfort often",
    },
    6: {
      label: "Significant Pain",
      color: "#FFB300",
      description: "Hard to ignore",
    },
    7: {
      label: "Severe Pain",
      color: "#FF9800",
      description: "Major impact on activities",
    },
    8: {
      label: "Intense Pain",
      color: "#FF7043",
      description: "Very distressing",
    },
    9: {
      label: "Extreme Pain",
      color: "#F44336",
      description: "Unable to function",
    },
    10: {
      label: "Excruciating",
      color: "#D32F2F",
      description: "Medical emergency",
    },
  },
  other: {
    1: {
      label: "Very Mild",
      color: "#4CAF50",
      description: "Barely noticeable",
    },
    2: { label: "Mild", color: "#66BB6A", description: "Minor concern" },
    3: {
      label: "Mild-Moderate",
      color: "#8BC34A",
      description: "Noticeable but manageable",
    },
    4: {
      label: "Moderate",
      color: "#CDDC39",
      description: "Some impact on activities",
    },
    5: {
      label: "Moderate-High",
      color: "#8B5CF6",
      description: "Moderate disruption",
    },
    6: { label: "High", color: "#FFB300", description: "Significant impact" },
    7: {
      label: "High-Severe",
      color: "#FF9800",
      description: "Major disruption",
    },
    8: { label: "Severe", color: "#FF7043", description: "Serious concern" },
    9: {
      label: "Very Severe",
      color: "#F44336",
      description: "Urgent attention needed",
    },
    10: {
      label: "Critical",
      color: "#D32F2F",
      description: "Immediate action required",
    },
  },
};

// Helper function to get severity scale for incident type
export const getSeverityScale = (incidentType) => {
  return SEVERITY_SCALES[incidentType] || SEVERITY_SCALES.other;
};

// Effectiveness levels for follow-up
export const EFFECTIVENESS_LEVELS = {
  COMPLETELY: {
    label: "Completely Effective",
    value: "completely",
    color: "#4CAF50",
  },
  SOMEWHAT: {
    label: "Somewhat Effective",
    value: "somewhat",
    color: "#FF9800",
  },
  NOT_EFFECTIVE: {
    label: "Not Effective",
    value: "not_effective",
    color: "#F44336",
  },
};

// Smart Follow-up Timing Configuration
export const FOLLOW_UP_SCHEDULES = {
  pain_medical: {
    // Pain incidents need quicker follow-up, especially for severe cases
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [30, 120, 360]; // 30min, 2hr, 6hr for severe pain
      if (severity >= 5) return [60, 240]; // 1hr, 4hr for moderate pain  
      return [120]; // 2hr for mild pain
    },
    getDescription: (severity) => 
      severity >= 8 ? "severe pain" : severity >= 5 ? "moderate pain" : "mild pain"
  },
  
  mood: {
    // Emotional incidents vary greatly - meltdowns need quick check, sadness can wait longer
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [45, 180]; // 45min, 3hr for emotional crisis
      if (severity >= 5) return [90, 360]; // 1.5hr, 6hr for moderate distress
      return [180]; // 3hr for mild mood issues
    },
    getDescription: (severity) => 
      severity >= 8 ? "emotional crisis" : severity >= 5 ? "distress" : "mood dip"
  },
  
  behavioral: {
    // Behavioral incidents often have immediate and longer-term effects
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [30, 120, 480]; // 30min, 2hr, 8hr for dangerous behavior
      if (severity >= 5) return [60, 240]; // 1hr, 4hr for disruptive behavior
      return [120]; // 2hr for minor issues
    },
    getDescription: (severity) => 
      severity >= 8 ? "dangerous behavior" : severity >= 5 ? "disruptive behavior" : "minor behavior issue"
  },
  
  sleep: {
    // Sleep issues need timing aligned with sleep cycles
    getSchedule: (severity, remedy) => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // If it's nighttime (7pm-6am), check in morning and next evening
      if (currentHour >= 19 || currentHour <= 6) {
        return [480, 1200]; // 8hr (morning), 20hr (next evening)
      }
      // If daytime, check after next nap time
      return [240]; // 4hr
    },
    getDescription: () => "sleep difficulty"
  },
  
  eating_nutrition: {
    // Food issues align with meal times
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [60, 180, 360]; // 1hr, 3hr, 6hr for severe eating issues
      if (severity >= 5) return [120, 360]; // 2hr, 6hr for moderate issues
      return [240]; // 4hr for mild pickiness
    },
    getDescription: (severity) => 
      severity >= 8 ? "severe eating difficulty" : severity >= 5 ? "eating resistance" : "mild pickiness"
  },
  
  sensory: {
    // Sensory issues can resolve quickly or need longer recovery
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [30, 90, 240]; // 30min, 1.5hr, 4hr for sensory crisis
      if (severity >= 5) return [60, 180]; // 1hr, 3hr for overload
      return [120]; // 2hr for mild sensitivity
    },
    getDescription: (severity) => 
      severity >= 8 ? "sensory crisis" : severity >= 5 ? "sensory overload" : "sensory sensitivity"
  },
  
  // Default for custom categories and "other"
  other: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [60, 180, 480]; // 1hr, 3hr, 8hr for severe issues
      if (severity >= 5) return [120, 360]; // 2hr, 6hr for moderate issues
      return [180]; // 3hr for mild issues
    },
    getDescription: (severity) => 
      severity >= 8 ? "severe incident" : severity >= 5 ? "moderate incident" : "mild incident"
  }
};

// Calculate smart follow-up times based on incident type, severity, and remedy
export const calculateFollowUpTimes = (incidentType, severity, remedy, customIncidentName = "") => {
  const schedule = FOLLOW_UP_SCHEDULES[incidentType] || FOLLOW_UP_SCHEDULES.other;
  const intervalMinutes = schedule.getSchedule(severity, remedy);
  const description = schedule.getDescription(severity);
  
  const now = new Date();
  const followUpTimes = intervalMinutes.map(minutes => {
    const followUpTime = new Date(now.getTime() + minutes * 60000);
    return {
      timestamp: followUpTime,
      intervalMinutes: minutes,
      description: `Check on ${customIncidentName || description}`
    };
  });
  
  return {
    times: followUpTimes,
    nextFollowUp: followUpTimes[0], // First scheduled follow-up
    totalFollowUps: followUpTimes.length
  };
};

// Helper function to format follow-up timing for user display
export const formatFollowUpSchedule = (incidentType, severity, remedy, customIncidentName = "") => {
  const { times } = calculateFollowUpTimes(incidentType, severity, remedy, customIncidentName);
  
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${Math.round(minutes/60)}hr`;
    return `${Math.round(minutes/1440)}day`;
  };
  
  return times.map(time => formatTime(time.intervalMinutes)).join(", ");
};

// Enhanced incident creation with smart follow-up scheduling
export const createIncidentWithSmartFollowUp = async (childId, incidentData, scheduleFollowUp = true, childName = 'child') => {
  try {
    let followUpData = {
      followUpScheduled: false,
      followUpTime: null,
      followUpTimes: [], // Array of all scheduled follow-ups
      nextFollowUpIndex: 0 // Track which follow-up is next
    };
    
    // Only schedule follow-up if a remedy was applied and user wants follow-up
    if (scheduleFollowUp && incidentData.remedy && incidentData.remedy.trim()) {
      const followUpSchedule = calculateFollowUpTimes(
        incidentData.type, 
        incidentData.severity, 
        incidentData.remedy,
        incidentData.customIncidentName
      );
      
      followUpData = {
        followUpScheduled: true,
        followUpTime: followUpSchedule.nextFollowUp.timestamp,
        followUpTimes: followUpSchedule.times,
        nextFollowUpIndex: 0,
        totalFollowUps: followUpSchedule.totalFollowUps,
        followUpDescription: followUpSchedule.nextFollowUp.description
      };
    }
    
    const docData = {
      childId,
      type: incidentData.type,
      customIncidentName: incidentData.customIncidentName || "",
      severity: incidentData.severity,
      remedy: incidentData.remedy,
      customRemedy: incidentData.customRemedy || "",
      notes: incidentData.notes || "",
      timestamp: serverTimestamp(),
      entryDate: new Date().toDateString(),
      authorId: incidentData.authorId,
      authorName: incidentData.authorName,
      authorEmail: incidentData.authorEmail,
      // Enhanced follow-up tracking
      ...followUpData,
      effectiveness: null,
      followUpCompleted: false,
      followUpResponses: [], // Track all follow-up responses
    };

    const docRef = await addDoc(collection(db, "incidents"), docData);
    
    // Schedule browser notifications if follow-up is enabled
    if (followUpData.followUpScheduled) {
      try {
        // Import here to avoid circular dependency
        const { scheduleAllFollowUpNotifications, requestNotificationPermission } = await import('./followUpService');
        
        // Request permission if not granted
        const hasPermission = await requestNotificationPermission();
        
        if (hasPermission) {
          // Create incident object for notification scheduling
          const incidentForNotification = {
            id: docRef.id,
            ...docData,
            followUpTimes: followUpData.followUpTimes
          };
          
          scheduleAllFollowUpNotifications(incidentForNotification, childName);
        } else {
          console.log('Notification permission not granted, follow-ups will only appear in-app');
        }
      } catch (error) {
        console.error('Error scheduling notifications:', error);
        // Don't fail incident creation if notification scheduling fails
      }
    }
    
    return {
      id: docRef.id,
      followUpScheduled: followUpData.followUpScheduled,
      nextFollowUpTime: followUpData.followUpTime,
      followUpDescription: followUpData.followUpDescription
    };
  } catch (error) {
    console.error("Error creating incident with smart follow-up:", error);
    throw error;
  }
};

// Add new incident
export const addIncident = async (childId, incidentData) => {
  try {
    const docData = {
      childId,
      type: incidentData.type,
      customIncidentName: incidentData.customIncidentName || "", // For "Other" type
      severity: incidentData.severity,
      remedy: incidentData.remedy,
      customRemedy: incidentData.customRemedy || "",
      notes: incidentData.notes || "",
      timestamp: serverTimestamp(),
      entryDate: new Date().toDateString(),
      authorId: incidentData.authorId,
      authorName: incidentData.authorName,
      authorEmail: incidentData.authorEmail,
      // Follow-up tracking
      followUpScheduled: incidentData.followUpScheduled || false,
      followUpTime: incidentData.followUpTime || null,
      effectiveness: null, // Will be filled during follow-up
      followUpCompleted: false,
    };

    const docRef = await addDoc(collection(db, "incidents"), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding incident:", error);
    throw error;
  }
};

// Update incident with effectiveness follow-up
export const updateIncidentEffectiveness = async (
  incidentId,
  effectiveness,
  followUpNotes = ""
) => {
  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      effectiveness,
      followUpNotes,
      followUpCompleted: true,
      followUpTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating incident effectiveness:", error);
    throw error;
  }
};

// Enhanced follow-up response handling for multiple follow-ups
export const recordFollowUpResponse = async (incidentId, effectiveness, followUpNotes = "", responseIndex = 0) => {
  try {
    const incidentRef = doc(db, "incidents", incidentId);
    
    // Get current incident data to update follow-up tracking
    const incidentDoc = await getDocs(query(collection(db, "incidents"), where("__name__", "==", incidentId)));
    if (incidentDoc.empty) throw new Error("Incident not found");
    
    const incident = incidentDoc.docs[0].data();
    const responses = incident.followUpResponses || [];
    
    // Add this response
    const newResponse = {
      effectiveness,
      notes: followUpNotes,
      timestamp: serverTimestamp(),
      responseIndex,
      intervalMinutes: incident.followUpTimes?.[responseIndex]?.intervalMinutes || 0
    };
    
    responses.push(newResponse);
    
    // Check if there are more follow-ups scheduled
    const nextIndex = responseIndex + 1;
    const hasMoreFollowUps = incident.followUpTimes && nextIndex < incident.followUpTimes.length;
    
    let updateData = {
      followUpResponses: responses,
      lastFollowUpResponse: newResponse,
      lastFollowUpTimestamp: serverTimestamp()
    };
    
    if (hasMoreFollowUps) {
      // Schedule next follow-up
      updateData.followUpTime = incident.followUpTimes[nextIndex].timestamp;
      updateData.nextFollowUpIndex = nextIndex;
      updateData.followUpDescription = incident.followUpTimes[nextIndex].description;
    } else {
      // This was the last follow-up
      updateData.followUpCompleted = true;
      updateData.effectiveness = effectiveness; // Store final effectiveness
      updateData.followUpNotes = followUpNotes; // Store final notes
    }
    
    await updateDoc(incidentRef, updateData);
    
    // Handle notifications
    if (!hasMoreFollowUps) {
      // This was the last follow-up, cancel any remaining notifications
      try {
        const { cancelFollowUpNotifications } = await import('./followUpService');
        cancelFollowUpNotifications(incidentId);
      } catch (error) {
        console.error('Error cancelling notifications:', error);
      }
    }
    
    return {
      hasMoreFollowUps,
      nextFollowUpTime: hasMoreFollowUps ? incident.followUpTimes[nextIndex].timestamp : null,
      nextFollowUpDescription: hasMoreFollowUps ? incident.followUpTimes[nextIndex].description : null,
      totalResponses: responses.length,
      totalFollowUps: incident.followUpTimes?.length || 1
    };
  } catch (error) {
    console.error("Error recording follow-up response:", error);
    throw error;
  }
};

// Get follow-up summary for an incident
export const getFollowUpSummary = async (incidentId) => {
  try {
    const incidentDoc = await getDocs(query(collection(db, "incidents"), where("__name__", "==", incidentId)));
    if (incidentDoc.empty) return null;
    
    const incident = incidentDoc.docs[0].data();
    const responses = incident.followUpResponses || [];
    
    return {
      totalScheduled: incident.followUpTimes?.length || 0,
      totalResponses: responses.length,
      completed: incident.followUpCompleted || false,
      responses: responses.map(response => ({
        effectiveness: response.effectiveness,
        notes: response.notes,
        intervalMinutes: response.intervalMinutes,
        timestamp: response.timestamp
      })),
      finalEffectiveness: incident.effectiveness,
      nextFollowUpDue: incident.followUpCompleted ? null : incident.followUpTime
    };
  } catch (error) {
    console.error("Error getting follow-up summary:", error);
    return null;
  }
};

// Get incidents for a child
export const getIncidents = async (
  childId,
  startDate = null,
  endDate = null
) => {
  try {
    let q = query(
      collection(db, "incidents"),
      where("childId", "==", childId),
      orderBy("timestamp", "desc")
    );

    if (startDate) {
      q = query(q, where("timestamp", ">=", startDate));
    }

    if (endDate) {
      q = query(q, where("timestamp", "<=", endDate));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching incidents:", error);
    throw error;
  }
};

// Get incidents needing follow-up
export const getIncidentsPendingFollowUp = async (childId) => {
  try {
    const q = query(
      collection(db, "incidents"),
      where("childId", "==", childId),
      where("followUpScheduled", "==", true),
      where("followUpCompleted", "==", false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching incidents pending follow-up:", error);
    throw error;
  }
};

// Analyze patterns in "Other" incidents to suggest new categories
export const analyzeOtherIncidentPatterns = async (
  childId,
  minimumOccurrences = 3
) => {
  try {
    const q = query(
      collection(db, "incidents"),
      where("childId", "==", childId),
      where("type", "==", "other"),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const otherIncidents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Use fuzzy matching to group similar incidents
    const groups = findSimilarIncidents(otherIncidents);

    // Find patterns that occur frequently enough to suggest as new categories
    const suggestions = Object.values(groups)
      .filter(group => group.count >= minimumOccurrences)
      .map(group => ({
        primaryName: group.primaryName,
        variations: group.variations,
        occurrences: group.count,
        incidents: group.incidents,
        suggestedCategory: formatCategoryName(group.primaryName),
        suggestedIcon: suggestIcon(group.primaryName),
        suggestedColor: suggestColor(group.primaryName),
        suggestedKey: generateCategoryKey(group.primaryName)
      }))
      .sort((a, b) => b.occurrences - a.occurrences);

    return suggestions;
  } catch (error) {
    console.error("Error analyzing incident patterns:", error);
    throw error;
  }
};

// Get recent similar incidents for autocomplete suggestions
export const getSimilarIncidentNames = async (childId, searchTerm = "") => {
  try {
    const q = query(
      collection(db, "incidents"),
      where("childId", "==", childId),
      where("type", "==", "other"),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const incidents = querySnapshot.docs.map((doc) => doc.data());

    // Extract unique custom incident names
    const incidentNames = [
      ...new Set(
        incidents
          .map((incident) => incident.customIncidentName)
          .filter(
            (name) =>
              name && name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    ];

    return incidentNames.slice(0, 10); // Return top 10 suggestions
  } catch (error) {
    console.error("Error fetching similar incident names:", error);
    return [];
  }
};

// Fuzzy matching algorithm for incident pattern detection
const calculateSimilarity = (str1, str2) => {
  const normalize = (str) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 1.0;
  
  // Calculate Levenshtein distance
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator   // substitution
      );
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1.0 : (maxLength - distance) / maxLength;
};

const findSimilarIncidents = (incidents, threshold = 0.65) => {
  const groups = {};
  
  incidents.forEach((incident, index) => {
    const name = incident.customIncidentName;
    if (!name) return;
    
    let assigned = false;
    
    // Check if this incident belongs to any existing group
    for (const [groupKey, group] of Object.entries(groups)) {
      if (calculateSimilarity(name, groupKey) >= threshold) {
        group.incidents.push(incident);
        group.variations.add(name);
        assigned = true;
        break;
      }
    }
    
    // Create new group if no match found
    if (!assigned) {
      groups[name] = {
        primaryName: name,
        incidents: [incident],
        variations: new Set([name]),
        count: 1
      };
    }
  });
  
  // Update counts and convert variations to arrays
  Object.values(groups).forEach(group => {
    group.count = group.incidents.length;
    group.variations = Array.from(group.variations);
  });
  
  return groups;
};

// Helper functions for suggesting category properties
const formatCategoryName = (customName) => {
  return customName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const generateCategoryKey = (customName) => {
  return `CUSTOM_${customName
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20)}`;
};

const suggestIcon = (customName) => {
  const name = customName.toLowerCase();
  if (name.includes("rash") || name.includes("skin")) return "🔴";
  if (name.includes("cough") || name.includes("throat")) return "🗣️";
  if (name.includes("stomach") || name.includes("nausea")) return "🤢";
  if (name.includes("headache") || name.includes("head")) return "🧠";
  if (name.includes("fever") || name.includes("temperature")) return "🌡️";
  if (name.includes("allergy") || name.includes("allergic")) return "🤧";
  return "📝";
};

const suggestColor = (customName) => {
  const name = customName.toLowerCase();
  if (name.includes("pain") || name.includes("hurt")) return "#F44336";
  if (name.includes("rash") || name.includes("skin")) return "#FF9800";
  if (name.includes("stomach") || name.includes("nausea")) return "#4CAF50";
  if (name.includes("fever") || name.includes("sick")) return "#E91E63";
  return "#607D8B";
};

const suggestRemedies = (customName) => {
  const name = customName.toLowerCase();
  const baseRemedies = ["Monitor symptoms", "Comfort measures", "Other"];
  
  if (name.includes("stomach") || name.includes("nausea") || name.includes("tummy")) {
    return ["Rest", "Bland food", "Hydration", "Monitor symptoms", "Other"];
  }
  if (name.includes("rash") || name.includes("skin")) {
    return ["Cool compress", "Gentle cleansing", "Avoid irritants", "Monitor symptoms", "Other"];
  }
  if (name.includes("fever") || name.includes("temperature")) {
    return ["Hydration", "Rest", "Cool environment", "Monitor temperature", "Other"];
  }
  if (name.includes("cough") || name.includes("throat")) {
    return ["Hydration", "Honey (if age appropriate)", "Humidifier", "Monitor symptoms", "Other"];
  }
  
  return baseRemedies;
};

// Custom Category Management Functions

// Get custom categories for a child
export const getCustomCategories = async (childId) => {
  try {
    const q = query(
      collection(db, "children", childId, "customIncidentCategories"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const categories = {};
    
    querySnapshot.docs.forEach(doc => {
      categories[doc.data().key] = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    return categories;
  } catch (error) {
    console.error("Error fetching custom categories:", error);
    return {};
  }
};

// Create a new custom category
export const createCustomCategory = async (childId, categoryData, authorInfo) => {
  try {
    const customCategories = await getCustomCategories(childId);
    const categoryCount = Object.keys(customCategories).length;
    
    // Check category limit
    if (categoryCount >= 10) {
      throw new Error("Maximum of 10 custom categories allowed per child");
    }
    
    // Check for duplicate names
    const existingNames = Object.values(customCategories).map(cat => 
      cat.label.toLowerCase()
    );
    if (existingNames.includes(categoryData.label.toLowerCase())) {
      throw new Error("A category with this name already exists");
    }
    
    const categoryKey = generateCategoryKey(categoryData.label);
    const docData = {
      key: categoryKey,
      id: categoryData.id || categoryKey.toLowerCase(),
      label: categoryData.label,
      color: categoryData.color,
      emoji: categoryData.emoji,
      remedies: categoryData.remedies || suggestRemedies(categoryData.label),
      createdAt: serverTimestamp(),
      createdBy: authorInfo,
      usageCount: 0,
      isActive: true
    };
    
    const docRef = await addDoc(
      collection(db, "children", childId, "customIncidentCategories"),
      docData
    );
    
    return {
      id: docRef.id,
      ...docData
    };
  } catch (error) {
    console.error("Error creating custom category:", error);
    throw error;
  }
};

// Update custom category
export const updateCustomCategory = async (childId, categoryId, updates) => {
  try {
    const categoryRef = doc(db, "children", childId, "customIncidentCategories", categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating custom category:", error);
    throw error;
  }
};

// Delete custom category and convert incidents back to "Other"
export const deleteCustomCategory = async (childId, categoryId, categoryKey) => {
  try {
    // First, get all incidents with this custom category
    const incidentsQuery = query(
      collection(db, "incidents"),
      where("childId", "==", childId),
      where("type", "==", categoryKey)
    );
    
    const incidentsSnapshot = await getDocs(incidentsQuery);
    
    // Update all incidents to "other" type, preserve original name
    const batch = writeBatch(db);
    
    incidentsSnapshot.docs.forEach(docSnapshot => {
      const incidentData = docSnapshot.data();
      const incidentRef = doc(db, "incidents", docSnapshot.id);
      
      batch.update(incidentRef, {
        type: "other",
        customIncidentName: incidentData.originalCustomName || incidentData.customIncidentName,
        originalCustomName: incidentData.originalCustomName || incidentData.customIncidentName,
        deletedFromCategory: categoryKey,
        deletedAt: serverTimestamp()
      });
    });
    
    // Delete the custom category
    const categoryRef = doc(db, "children", childId, "customIncidentCategories", categoryId);
    batch.delete(categoryRef);
    
    await batch.commit();
    
    return incidentsSnapshot.docs.length; // Return number of incidents converted
  } catch (error) {
    console.error("Error deleting custom category:", error);
    throw error;
  }
};

// Merge two custom categories
export const mergeCustomCategories = async (
  childId,
  sourceCategories, // Array of categories to merge from
  targetCategory,   // Category to merge into
  newLabel,         // New label for merged category
  newRemedies       // Combined remedies
) => {
  try {
    const batch = writeBatch(db);
    
    // Update target category
    const targetRef = doc(db, "children", childId, "customIncidentCategories", targetCategory.id);
    batch.update(targetRef, {
      label: newLabel,
      remedies: newRemedies,
      updatedAt: serverTimestamp(),
      mergedFrom: sourceCategories.map(cat => cat.key)
    });
    
    // Update all incidents from source categories to target category
    for (const sourceCategory of sourceCategories) {
      const incidentsQuery = query(
        collection(db, "incidents"),
        where("childId", "==", childId),
        where("type", "==", sourceCategory.key)
      );
      
      const incidentsSnapshot = await getDocs(incidentsQuery);
      
      incidentsSnapshot.docs.forEach(docSnapshot => {
        const incidentRef = doc(db, "incidents", docSnapshot.id);
        batch.update(incidentRef, {
          type: targetCategory.key,
          mergedFrom: sourceCategory.key,
          mergedAt: serverTimestamp()
        });
      });
      
      // Delete source category
      const sourceCategoryRef = doc(db, "children", childId, "customIncidentCategories", sourceCategory.id);
      batch.delete(sourceCategoryRef);
    }
    
    await batch.commit();
  } catch (error) {
    console.error("Error merging custom categories:", error);
    throw error;
  }
};

// Migrate existing "Other" incidents to new custom category
export const migrateIncidentsToCustomCategory = async (
  childId,
  incidents,
  categoryKey
) => {
  try {
    const batch = writeBatch(db);
    
    incidents.forEach(incident => {
      const incidentRef = doc(db, "incidents", incident.id);
      batch.update(incidentRef, {
        type: categoryKey,
        originalCustomName: incident.customIncidentName, // Preserve original name
        migratedAt: serverTimestamp(),
        migratedFromOther: true
      });
    });
    
    await batch.commit();
    return incidents.length;
  } catch (error) {
    console.error("Error migrating incidents:", error);
    throw error;
  }
};

// Check if a new "Other" incident should trigger category suggestion
export const checkForCategorySuggestion = async (childId, incidentName) => {
  try {
    console.log(`🔍 Checking category suggestion for: "${incidentName}"`);
    const patterns = await analyzeOtherIncidentPatterns(childId, 3);
    console.log(`📊 Found ${patterns.length} patterns with 3+ incidents:`, patterns);
    
    // Find matching pattern for the current incident
    for (const pattern of patterns) {
      console.log(`🧪 Testing pattern: "${pattern.primaryName}" with variations:`, pattern.variations);
      const similarity = Math.max(
        ...pattern.variations.map(variation => {
          const sim = calculateSimilarity(incidentName, variation);
          console.log(`   "${incidentName}" vs "${variation}": ${(sim * 100).toFixed(1)}%`);
          return sim;
        })
      );
      
      console.log(`📈 Max similarity: ${(similarity * 100).toFixed(1)}%`);
      
      if (similarity >= 0.65) {
        console.log(`✅ SUGGESTING CATEGORY for pattern:`, pattern);
        return {
          shouldSuggest: true,
          suggestion: pattern
        };
      }
    }
    
    console.log(`❌ No patterns meet threshold (65%)`);
    return { shouldSuggest: false };
  } catch (error) {
    console.error("Error checking for category suggestion:", error);
    return { shouldSuggest: false };
  }
};
