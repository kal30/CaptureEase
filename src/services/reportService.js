import { getTimelineEntries } from './timelineService';
import { getHabitAnalytics } from './habitService';

/**
 * Report Service - Aggregates data from multiple sources for visual insights
 */

/**
 * Generate a comprehensive summary report for a child
 * @param {string} childId - Child ID
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @returns {Promise<Object>} Structured report data
 */
export const generateChildReport = async (childId, startDate, endDate) => {
    try {
        // 1. Get Habit Analytics (Averages, completion rates)
        const habitAnalytics = await getHabitAnalytics(childId, startDate, endDate);

        // 2. Get All Timeline Entries (Incidents, logs, notes)
        // Note: getTimelineEntries uses a callback, so we wrap it in a promise
        const timelineEntries = await new Promise((resolve) => {
            const unsubscribe = getTimelineEntries(childId, (entries) => {
                // Filter by date range manually since getTimelineEntries returns last 7 days by default
                const filtered = entries.filter(entry => {
                    const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
                    return entryDate >= startDate && entryDate <= endDate;
                });
                unsubscribe(); // Stop listening after first fetch for report
                resolve(filtered);
            });
        });

        // 3. Summarize by Category
        const summary = {
            habits: habitAnalytics,
            incidents: timelineEntries.filter(e => e.entryGroup === 'incident'),
            dailyLogs: timelineEntries.filter(e => e.entryGroup === 'dailyHabit'),
            milestones: timelineEntries.filter(e => e.type === 'behavior' && e.originalData?.isMilestone),
            period: {
                start: startDate,
                end: endDate
            }
        };

        return summary;
    } catch (error) {
        console.error("Error generating report:", error);
        throw error;
    }
};

/**
 * Generate a "Narrative Summary" using AI (Placeholder for now)
 * @param {Object} reportData - The aggregated report data
 */
export const generateAINarrative = async (reportData) => {
    // This will eventually call openaiService
    const { habits, incidents } = reportData;

    let narrative = `Overall, the period from ${reportData.period.start.toLocaleDateString()} to ${reportData.period.end.toLocaleDateString()} showed `;

    const categories = Object.keys(habits.averageLevels);
    if (categories.length > 0) {
        const mainCategory = categories[0];
        const avg = habits.averageLevels[mainCategory];
        narrative += `a steady average level of ${avg} in ${mainCategory}. `;
    }

    if (incidents.length > 0) {
        narrative += `There were ${incidents.length} important moments logged. `;
    } else {
        narrative += `No major incidents were reported. `;
    }

    return narrative;
};
