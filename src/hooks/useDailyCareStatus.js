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
          // Calculate daily care completion (mood, sleep, energy)
          const dailyCareItems = ['mood', 'sleep', 'energy'];
          const completedCount = dailyCareItems.filter(item => status[item]).length;
          const completionRate = Math.round((completedCount / dailyCareItems.length) * 100);

          statusMap[childId] = {
            ...status,
            dataCompleteness: completionRate,
            // Individual item status
            mood: !!status.mood,
            sleep: !!status.sleep,
            energy: !!status.energy,
            food_health: !!status.food_health,
            safety: !!status.safety,
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
    return completionStatus[childId] || {
      mood: false,
      sleep: false,
      energy: false,
      food_health: false,
      safety: false,
      dataCompleteness: 0,
    };
  };

  // Helper function to update status after completion
  const updateChildStatus = (childId, actionType, completed = true) => {
    setCompletionStatus(prev => {
      const currentStatus = prev[childId] || {};
      const newStatus = {
        ...currentStatus,
        [actionType]: completed,
      };

      // Recalculate completion rate for daily care items
      const dailyCareItems = ['mood', 'sleep', 'energy'];
      const completedCount = dailyCareItems.filter(item => newStatus[item]).length;
      newStatus.dataCompleteness = Math.round((completedCount / dailyCareItems.length) * 100);

      return {
        ...prev,
        [childId]: newStatus,
      };
    });
  };

  return {
    completionStatus,
    loading,
    getChildStatus,
    updateChildStatus,
    refetch: () => {
      // Re-trigger the useEffect
      setLoading(true);
    }
  };
};