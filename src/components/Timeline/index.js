// Timeline Components - Refactored from monolithic TimelineWidget
// Clean, focused components for better maintainability and reusability

// Main timeline components
export { default as RefactoredTimelineWidget } from './RefactoredTimelineWidget';
export { default as UnifiedTimeline } from './UnifiedTimeline';

// Individual timeline components
export { default as TimelineRecentEntries } from './TimelineRecentEntries';
export { default as TimelineMetrics } from './TimelineMetrics';
export { default as TimelineDailyView } from './_depracatedTab/TimelineDailyView';
export { default as TimelineFullModal } from './TimelineFullModal';

// Unified timeline components
export { default as TimelineFilters } from './TimelineFilters';
export { default as TimeGroupHeader } from './TimeGroupHeader';
export { default as UnifiedTimelineEntry } from './UnifiedTimelineEntry';

// Existing timeline components (maintained for compatibility)
export { default as TimelineCalendar } from './TimelineCalendar';
