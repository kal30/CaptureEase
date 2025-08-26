import { useState } from 'react';

/**
 * Custom hook for managing multiple modal states
 * Centralizes modal state management to reduce component complexity
 */
export const useModals = () => {
  // Modal states
  const [modals, setModals] = useState({
    quickEntry: false,
    dailyCare: false,
    dailyReport: false,
    invite: false,
    addChild: false,
    editChild: false,
  });

  // Modal data states
  const [modalData, setModalData] = useState({
    selectedChild: null,
    dailyCareAction: null,
    dailyCareChild: null,
    dailyReportChild: null,
    selectedChildForEdit: null,
    inviteChildId: null,
    entryType: 'micro',
  });

  // Generic modal handlers
  const openModal = (modalName, data = {}) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    setModalData(prev => ({ ...prev, ...data }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    // Clear related data when closing
    const clearData = {};
    if (modalName === 'quickEntry') {
      clearData.selectedChild = null;
      clearData.entryType = 'micro';
    } else if (modalName === 'dailyCare') {
      clearData.dailyCareAction = null;
      clearData.dailyCareChild = null;
    } else if (modalName === 'dailyReport') {
      clearData.dailyReportChild = null;
    } else if (modalName === 'editChild') {
      clearData.selectedChildForEdit = null;
    } else if (modalName === 'invite') {
      clearData.inviteChildId = null;
    }
    setModalData(prev => ({ ...prev, ...clearData }));
  };

  const closeAllModals = () => {
    setModals({
      quickEntry: false,
      dailyCare: false,
      dailyReport: false,
      invite: false,
      addChild: false,
      editChild: false,
    });
    setModalData({
      selectedChild: null,
      dailyCareAction: null,
      dailyCareChild: null,
      dailyReportChild: null,
      selectedChildForEdit: null,
      inviteChildId: null,
      entryType: 'micro',
    });
  };

  // Specific modal handlers for convenience
  const dailyCare = {
    open: (action, child) => openModal('dailyCare', { 
      dailyCareAction: action, 
      dailyCareChild: child 
    }),
    close: () => closeModal('dailyCare'),
    isOpen: modals.dailyCare,
  };

  const dailyReport = {
    open: (child) => openModal('dailyReport', { dailyReportChild: child }),
    close: () => closeModal('dailyReport'),
    isOpen: modals.dailyReport,
  };

  const quickEntry = {
    open: (child, type = 'micro') => openModal('quickEntry', { 
      selectedChild: child, 
      entryType: type 
    }),
    close: () => closeModal('quickEntry'),
    isOpen: modals.quickEntry,
  };

  const invite = {
    open: (childId) => openModal('invite', { inviteChildId: childId }),
    close: () => closeModal('invite'),
    isOpen: modals.invite,
  };

  const addChild = {
    open: () => openModal('addChild'),
    close: () => closeModal('addChild'),
    isOpen: modals.addChild,
  };

  const editChild = {
    open: (child) => openModal('editChild', { selectedChildForEdit: child }),
    close: () => closeModal('editChild'),
    isOpen: modals.editChild,
  };

  return {
    // Generic handlers
    openModal,
    closeModal,
    closeAllModals,
    
    // Specific modal controllers
    dailyCare,
    dailyReport,
    quickEntry,
    invite,
    addChild,
    editChild,
    
    // Direct access to modal data
    modalData,
    
    // State getters
    isAnyModalOpen: Object.values(modals).some(Boolean),
  };
};