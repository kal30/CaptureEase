import React from 'react';
import LogFormShell from '../../UI/LogFormShell';
import OtherIncidentCapture from './OtherIncidentCapture';

const IncidentLoggingModal = ({ open, onClose, childId, childName }) => {
  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title="Behavior Incident"
      titleBadge={childName}
      compactTitle
      mobileBreakpoint="sm"
      maxWidth="sm"
      forceDrawer
    >
      <OtherIncidentCapture
        childId={childId}
        childName={childName}
        onSaved={onClose}
        incidentTypeOverride="behavioral"
      />
    </LogFormShell>
  );
};

export default IncidentLoggingModal;
