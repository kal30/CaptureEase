import { useState, useEffect } from 'react';
import { getTodayCompletionStatus } from '../services/dailyCareService';

/**
 * Custom hook for managing daily care completion status
 * Centralizes the logic for tracking mood, sleep, energy, etc.
 */
export const useDailyCareStatus = (children = []) => {
  const [completionStatus, setCompletionStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletionStatus = async () => {
      if (!children.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const statusPromises = children.map(async (child) => {
        try {
          const todayStatus = await getTodayCompletionStatus(child.id);
          return { childId: child.id, status: todayStatus };
        } catch (error) {
          console.error(`Error fetching status for child ${child.id}:`, error);
          return { childId: child.id, status: {} };
        }
      });

      try {
        const results = await Promise.all(statusPromises);
        const statusMap = {};
        
        results.forEach(({ childId, status }) => {
          // Calculate daily care completion (mood, sleep, energy, food_health, safety)
          const completedCount = Object.keys(status).length;
          const totalItems = 5; // mood, sleep, energy, food_health, safety
          const completionRate = Math.round((completedCount / totalItems) * 100);

          // Create date string for ActionGroup daily tracking compatibility
          const todayDateString = new Date().toDateString();

          statusMap[childId] = {
            // Simple keys for QuickEntry component
            mood: !!status.mood,
            sleep: !!status.sleep,
            energy: !!status.energy,
            food_health: !!status.food_health,
            safety: !!status.safety,
            dataCompleteness: completionRate,
            
            // Date-suffixed keys for ActionGroup daily tracking
            [`mood_${todayDateString}`]: !!status.mood,
            [`sleep_${todayDateString}`]: !!status.sleep,
            [`energy_${todayDateString}`]: !!status.energy,
            [`food_health_${todayDateString}`]: !!status.food_health,
            // safety uses 'task' tracking, so just the simple key
          };
        });

        setCompletionStatus(statusMap);
      } catch (error) {
        console.error('Error processing completion status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [children]);

  // Helper function to get status for a specific child
  const getChildStatus = (childId) => {
    const todayDateString = new Date().toDateString();
    return completionStatus[childId] || {
      // Simple keys for QuickEntry component
      mood: false,
      sleep: false,
      energy: false,
      food_health: false,
      safety: false,
      dataCompleteness: 0,
      
      // Date-suffixed keys for ActionGroup daily tracking
      [`mood_${todayDateString}`]: false,
      [`sleep_${todayDateString}`]: false,
      [`energy_${todayDateString}`]: false,
      [`food_health_${todayDateString}`]: false,
      // safety uses 'task' tracking, so just the simple key
    };
  };

  // Function to refresh Daily Care status after entries are saved
  const refreshChildStatus = async (childId) => {
    try {
      const todayStatus = await getTodayCompletionStatus(childId);
      const completedCount = Object.keys(todayStatus).length;
      const totalItems = 5; // mood, sleep, energy, food_health, safety
      const completionRate = Math.round((completedCount / totalItems) * 100);
      
      // Create date string for ActionGroup daily tracking compatibility
      const todayDateString = new Date().toDateString();
      
      setCompletionStatus(prev => ({
        ...prev,
        [childId]: {
          // Simple keys for QuickEntry component
          mood: !!todayStatus.mood,
          sleep: !!todayStatus.sleep,
          energy: !!todayStatus.energy,
          food_health: !!todayStatus.food_health,
          safety: !!todayStatus.safety,
          dataCompleteness: completionRate,
          
          // Date-suffixed keys for ActionGroup daily tracking
          [`mood_${todayDateString}`]: !!todayStatus.mood,
          [`sleep_${todayDateString}`]: !!todayStatus.sleep,
          [`energy_${todayDateString}`]: !!todayStatus.energy,
          [`food_health_${todayDateString}`]: !!todayStatus.food_health,
          // safety uses 'task' tracking, so just the simple key
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