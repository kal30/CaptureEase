import { useState, useEffect } from 'react';
import { getTodayCompletionStatus } from '../services/dailyCareService';
import { getTodayHabitStatus } from '../services/habitService';

/**
 * Custom hook for managing daily care completion status
 * Centralizes the logic for tracking mood, sleep, energy, etc.
 */
export const useDailyCareStatus = (children = []) => {
  const [completionStatus, setCompletionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const childIdsKey = (children || []).map((child) => child.id).join('|');

  useEffect(() => {
    const fetchCompletionStatus = async () => {
      if (!children.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const statusPromises = children.map(async (child) => {
        try {
          const [todayStatus, habitStatus] = await Promise.all([
            getTodayCompletionStatus(child.id),
            getTodayHabitStatus(child.id)
          ]);
          
          // Merge daily care status with habit status
          const combinedStatus = {
            ...todayStatus,
            // Add daily log status based on habit entries
            dailyLog: Object.keys(habitStatus).length > 0
          };
          
          return { childId: child.id, status: combinedStatus, habitStatus };
        } catch (error) {
          console.error(`Error fetching status for child ${child.id}:`, error);
          return { childId: child.id, status: {}, habitStatus: {} };
        }
      });

      try {
        const results = await Promise.all(statusPromises);
        const statusMap = {};
        
        results.forEach(({ childId, status, habitStatus }) => {
          // Calculate daily care completion (mood, sleep, energy, activity, food_health, safety)
          const dailyCareCount = Object.keys(status).filter(key => key !== 'dailyLog').length;
          const totalItems = 6; // mood, sleep, energy, activity, food_health, safety
          const completionRate = Math.round((dailyCareCount / totalItems) * 100);

          // Create date string for ActionGroup daily tracking compatibility
          const todayDateString = new Date().toDateString();

          statusMap[childId] = {
            // Simple keys for QuickEntry component
          mood: !!status.mood,
          sleep: !!status.sleep,
          energy: !!status.energy,
          activity: !!status.activity,
          food_health: !!status.food_health,
          safety: !!status.safety,
          dailyLog: !!status.dailyLog, // Add daily log status
          dataCompleteness: completionRate,
            
            // Date-suffixed keys for ActionGroup daily tracking
          [`mood_${todayDateString}`]: !!status.mood,
          [`sleep_${todayDateString}`]: !!status.sleep,
          [`energy_${todayDateString}`]: !!status.energy,
          [`activity_${todayDateString}`]: !!status.activity,
          [`food_health_${todayDateString}`]: !!status.food_health,
          // safety uses 'task' tracking, so just the simple key
            
            // Store habit status for detailed tracking
            habitStatus
          };
        });

        setCompletionStatus((current) => {
          const currentSerialized = JSON.stringify(current);
          const nextSerialized = JSON.stringify(statusMap);
          return currentSerialized === nextSerialized ? current : statusMap;
        });
      } catch (error) {
        console.error('Error processing completion status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [childIdsKey]);

  // Helper function to get status for a specific child
  const getChildStatus = (childId) => {
    const todayDateString = new Date().toDateString();
    return completionStatus[childId] || {
      // Simple keys for QuickEntry component
      mood: false,
      sleep: false,
      energy: false,
      activity: false,
      food_health: false,
      safety: false,
      dailyLog: false,
      dataCompleteness: 0,
      
      // Date-suffixed keys for ActionGroup daily tracking
      [`mood_${todayDateString}`]: false,
      [`sleep_${todayDateString}`]: false,
      [`energy_${todayDateString}`]: false,
      [`activity_${todayDateString}`]: false,
      [`food_health_${todayDateString}`]: false,
      // safety uses 'task' tracking, so just the simple key
    };
  };

  // Function to refresh Daily Care status after entries are saved
  const refreshChildStatus = async (childId) => {
    try {
      const [todayStatus, habitStatus] = await Promise.all([
        getTodayCompletionStatus(childId),
        getTodayHabitStatus(childId)
      ]);
      
      const combinedStatus = {
        ...todayStatus,
        dailyLog: Object.keys(habitStatus).length > 0
      };
      
      const dailyCareCount = Object.keys(combinedStatus).filter(key => key !== 'dailyLog').length;
      const totalItems = 6; // mood, sleep, energy, activity, food_health, safety
      const completionRate = Math.round((dailyCareCount / totalItems) * 100);
      
      // Create date string for ActionGroup daily tracking compatibility
      const todayDateString = new Date().toDateString();
      
      setCompletionStatus(prev => ({
        ...prev,
        [childId]: {
          // Simple keys for QuickEntry component
          mood: !!combinedStatus.mood,
          sleep: !!combinedStatus.sleep,
          energy: !!combinedStatus.energy,
          activity: !!combinedStatus.activity,
          food_health: !!combinedStatus.food_health,
          safety: !!combinedStatus.safety,
          dailyLog: !!combinedStatus.dailyLog,
          dataCompleteness: completionRate,
          
          // Date-suffixed keys for ActionGroup daily tracking
          [`mood_${todayDateString}`]: !!combinedStatus.mood,
          [`sleep_${todayDateString}`]: !!combinedStatus.sleep,
          [`energy_${todayDateString}`]: !!combinedStatus.energy,
          [`activity_${todayDateString}`]: !!combinedStatus.activity,
          [`food_health_${todayDateString}`]: !!combinedStatus.food_health,
          // safety uses 'task' tracking, so just the simple key
          
          // Store habit status for detailed tracking
          habitStatus
        }
      }));
    } catch (error) {
      console.error("Error refreshing Daily Care status:", error);
    }
  };

  // Legacy method - kept for backward compatibility but prefer refreshChildStatus
  const updateChildStatus = (childId, actionType, completed = true) => {
    console.warn('updateChildStatus is deprecated, use refreshChildStatus for real-time data');
    refreshChildStatus(childId);
  };

  return {
    completionStatus,
    loading,
    getChildStatus,
    refreshChildStatus,
    updateChildStatus, // Legacy - deprecated 
    refetch: () => {
      // Re-trigger the useEffect
      setLoading(true);
    }
  };
};
