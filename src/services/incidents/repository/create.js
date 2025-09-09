import { collection, addDoc, updateDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { calculateFollowUpTimes } from '../followUpScheduler';
import { uploadIncidentMedia } from '../../../components/Dashboard/Incidents/Media/mediaUploadService';

// Enhanced incident creation with smart follow-up scheduling (behavior preserved)
export const createIncidentWithSmartFollowUp = async (
  childId,
  incidentData,
  scheduleFollowUp = true,
  childName = 'child'
) => {
  try {
    let followUpData = {
      followUpScheduled: false,
      followUpTime: null,
      followUpTimes: [],
      nextFollowUpIndex: 0,
    };

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
        followUpDescription: followUpSchedule.nextFollowUp.description,
      };
    }

    // Get current user for audit metadata
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to create incidents');
    }

    const docData = {
      // Required immutable metadata for security rules
      childId,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      
      // Incident data
      type: incidentData.type,
      customIncidentName: incidentData.customIncidentName || '',
      severity: incidentData.severity,
      remedy: incidentData.remedy,
      customRemedy: incidentData.customRemedy || '',
      notes: incidentData.notes || '',
      timestamp: incidentData.incidentDateTime || serverTimestamp(),
      entryDate: incidentData.incidentDateTime
        ? incidentData.incidentDateTime.toDateString()
        : new Date().toDateString(),
      
      // Legacy author fields (keeping for backwards compatibility)
      authorId: incidentData.authorId || currentUser.uid,
      authorName: incidentData.authorName,
      authorEmail: incidentData.authorEmail,
      
      // Follow-up data
      ...followUpData,
      effectiveness: null,
      followUpCompleted: false,
      followUpResponses: [],
      mediaUrls: [],
      hasMedia: !!(incidentData.mediaFile || incidentData.audioBlob),
      
      // Status for soft delete system
      status: 'active',
    };


    const docRef = await addDoc(collection(db, 'incidents'), docData);

    if (incidentData.mediaFile || incidentData.audioBlob) {
      try {
        const mediaUrls = await uploadIncidentMedia(
          incidentData.mediaFile,
          incidentData.audioBlob,
          docRef.id
        );

        if (mediaUrls.length > 0) {
          await updateDoc(doc(db, 'incidents', docRef.id), {
            mediaUrls,
          });
        }
      } catch (mediaError) {
        console.error('Media upload failed, but incident was saved:', mediaError);
      }
    }

    if (followUpData.followUpScheduled) {
      try {
        const { scheduleAllFollowUpNotifications, requestNotificationPermission } = await import(
          '../../followUpService'
        );

        const hasPermission = await requestNotificationPermission();

        if (hasPermission) {
          const incidentForNotification = {
            id: docRef.id,
            ...docData,
            followUpTimes: followUpData.followUpTimes,
          };

          scheduleAllFollowUpNotifications(incidentForNotification, childName);
        }
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    }

    return {
      id: docRef.id,
      followUpScheduled: followUpData.followUpScheduled,
      nextFollowUpTime: followUpData.followUpTime,
      followUpDescription: followUpData.followUpDescription,
    };
  } catch (error) {
    console.error('Error creating incident with smart follow-up:', error);
    throw error;
  }
};

