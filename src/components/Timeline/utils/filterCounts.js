const isSameDay = (dateA, dateB) => (
  Boolean(dateA && dateB)
  && dateA.getFullYear() === dateB.getFullYear()
  && dateA.getMonth() === dateB.getMonth()
  && dateA.getDate() === dateB.getDate()
);

const countFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'string') {
    return value.trim() ? 1 : 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? 1 : 0;
  }

  return 0;
};

export const getActiveTimelineFilterCount = (filters = {}, selectedDate = null) => {
  let count = 0;

  count += countFilterValue(filters.searchText);
  count += countFilterValue(filters.entryTypes);
  count += countFilterValue(filters.userRoles);
  count += countFilterValue(filters.tagFilters);
  count += filters.importantOnly ? 1 : 0;

  if (selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime()) && !isSameDay(selectedDate, new Date())) {
    count += 1;
  }

  return count;
};
