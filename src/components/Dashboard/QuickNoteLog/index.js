import React from 'react';
import QuickNoteDialog from './QuickNoteDialog';
import QuickNoteIcon from './QuickNoteIcon';

const QuickNoteLog = ({ childId, childName, open, onClose, onLogged }) => (
  <QuickNoteDialog
    childId={childId}
    childName={childName}
    open={open}
    onClose={onClose}
    onLogged={onLogged}
  />
);

export { QuickNoteIcon };
export default QuickNoteLog;
