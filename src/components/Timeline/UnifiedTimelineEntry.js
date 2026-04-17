import React from 'react';
import { Box } from '@mui/material';
import TimelineEntryRow from './parts/TimelineEntryRow.jsx';
import { transformTimelineEntry } from './entryTransformers';

const UnifiedTimelineEntry = ({
  entry,
  presentation,
  timeString,
  isLast = false,
  showActions = false,
  onEditEntry = null,
  onDeleteEntry = null,
  actionMenuDisabled = false,
  isEditing = false,
  editText = '',
  onEditTextChange = null,
  onSaveEdit = null,
  onCancelEdit = null,
}) => {
  const entryConfig = React.useMemo(
    () => transformTimelineEntry(entry, presentation || {}, timeString),
    [entry, presentation, timeString]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <TimelineEntryRow
        entryId={entry.id}
        entryConfig={entryConfig}
        isLast={isLast}
        showActions={showActions}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
        actionMenuDisabled={actionMenuDisabled}
        isEditing={isEditing}
        editValue={editText}
        onEditValueChange={onEditTextChange}
        onSaveEdit={() => onSaveEdit?.(entry)}
        onCancelEdit={onCancelEdit}
      />
    </Box>
  );
};

export default React.memo(UnifiedTimelineEntry);
