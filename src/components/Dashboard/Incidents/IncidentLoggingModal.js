import React from 'react';
import LogFormShell from '../../UI/LogFormShell';
import OtherIncidentCapture from './OtherIncidentCapture';

const IncidentLoggingModal = ({ open, onClose, childId, childName }) => {
  const title = `Log Behavior Incident${childName ? ` ${childName}` : ''}`;
  const subtitle = 'Create a detailed report for a significant event.';

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      mobileBreakpoint="sm"
      maxWidth="sm"
      forceDrawer
    >
      <OtherIncidentCapture
        childId={childId}
        childName={childName}
        onSaved={onClose}
        onClose={onClose}
        incidentTypeOverride="behavioral"
      />
    </LogFormShell>
  );
};

export default IncidentLoggingModal;
