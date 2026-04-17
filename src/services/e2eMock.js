const MOCK_STATE_KEY = 'captureez:e2e-auth-user';

const DEFAULT_MOCK_USER = {
  uid: 'cypress-owner',
  email: 'test@captureez.com',
  displayName: 'Test Care Owner',
};

const DEFAULT_MOCK_CHILD = {
  id: 'cypress-child-1',
  name: 'Mia Johnson',
  age: 8,
  birthDate: '2017-03-15',
  description: 'Demo child for Cypress browser tests',
  status: 'active',
  users: {
    care_owner: DEFAULT_MOCK_USER.uid,
    care_partners: ['cypress-partner'],
    caregivers: [],
    therapists: [],
    members: [DEFAULT_MOCK_USER.uid, 'cypress-partner'],
  },
  medicalProfile: {
    foodAllergies: [],
    currentMedications: [],
  },
};

const DEFAULT_MOCK_DATA = {
  authUser: DEFAULT_MOCK_USER,
  child: DEFAULT_MOCK_CHILD,
  careTeamsByChildId: {
    [DEFAULT_MOCK_CHILD.id]: [
      {
        userId: DEFAULT_MOCK_USER.uid,
        role: 'care_owner',
        displayName: DEFAULT_MOCK_USER.displayName,
        email: DEFAULT_MOCK_USER.email,
        photoURL: null,
      },
      {
        userId: 'cypress-partner',
        role: 'care_partner',
        displayName: 'Test Care Partner',
        email: 'partner@captureez.com',
        photoURL: null,
      },
    ],
  },
  roleByChildId: {
    [DEFAULT_MOCK_CHILD.id]: 'care_owner',
  },
  timelineSummaryByChildId: {
    [DEFAULT_MOCK_CHILD.id]: {
      totalEntries: 2,
      todayCount: 2,
      weekCount: 5,
      activityStreak: 3,
      lastActivityTime: '10:30 AM',
    },
  },
  allEntriesByChildId: {
    [DEFAULT_MOCK_CHILD.id]: [],
  },
};

const getWindow = () => (typeof window !== 'undefined' ? window : null);

export const isE2EMockEnabled = () => {
  const win = getWindow();
  return Boolean(
    win && (
      win.__captureezE2E_MOCK === true ||
      win.localStorage?.getItem(MOCK_STATE_KEY)
    )
  );
};

export const getE2EMockData = () => {
  const win = getWindow();
  const stored = win?.localStorage?.getItem(MOCK_STATE_KEY);

  if (stored) {
    try {
      return { ...DEFAULT_MOCK_DATA, authUser: JSON.parse(stored) };
    } catch (error) {
      return DEFAULT_MOCK_DATA;
    }
  }

  return win?.__captureezE2E_DATA || DEFAULT_MOCK_DATA;
};

export const getE2EMockAuthUser = () => getE2EMockData().authUser || DEFAULT_MOCK_USER;

export const setE2EMockAuthUser = (user) => {
  const win = getWindow();
  if (!win) return;

  const nextUser = user || DEFAULT_MOCK_USER;
  win.localStorage?.setItem(MOCK_STATE_KEY, JSON.stringify(nextUser));
  win.__captureezE2E_DATA = {
    ...(win.__captureezE2E_DATA || DEFAULT_MOCK_DATA),
    authUser: nextUser,
  };

  win.dispatchEvent(new CustomEvent('captureez:e2e-auth-changed', {
    detail: { user: nextUser },
  }));
};

export const clearE2EMockAuthUser = () => {
  const win = getWindow();
  if (!win) return;

  win.localStorage?.removeItem(MOCK_STATE_KEY);
  if (win.__captureezE2E_DATA) {
    win.__captureezE2E_DATA = {
      ...win.__captureezE2E_DATA,
      authUser: null,
    };
  }

  win.dispatchEvent(new CustomEvent('captureez:e2e-auth-changed', {
    detail: { user: null },
  }));
};

const authListeners = new Set();

export const subscribeE2EAuth = (callback) => {
  if (typeof callback !== 'function') {
    return () => {};
  }

  authListeners.add(callback);
  callback(getE2EMockAuthUser());

  const handleChange = (event) => {
    callback(event?.detail?.user || null);
  };

  const win = getWindow();
  win?.addEventListener('captureez:e2e-auth-changed', handleChange);

  return () => {
    authListeners.delete(callback);
    win?.removeEventListener('captureez:e2e-auth-changed', handleChange);
  };
};

export const getE2EMockRoleContext = () => {
  const data = getE2EMockData();
  const child = data.child;

  return {
    userRoles: { [child.id]: data.roleByChildId[child.id] || 'care_owner' },
    userPermissions: { [child.id]: ['ADD_DAILY_LOGS', 'INVITE_CAREGIVERS', 'INVITE_THERAPISTS', 'MANAGE_CHILD'] },
    userDisplayInfo: { [child.id]: { uid: data.authUser.uid, displayName: data.authUser.displayName } },
    childrenWithAccess: [child],
    loading: false,
  };
};

export const getE2EMockDashboardState = () => {
  const data = getE2EMockData();
  const child = data.child;
  const role = data.roleByChildId[child.id] || 'care_owner';

  const noop = () => {};
  const children = [child];
  const allEntries = { [child.id]: [] };
  const timelineSummary = data.timelineSummaryByChildId;

  return {
    user: data.authUser,
    theme: null,
    loading: false,
    children,
    ownChildren: [child],
    familyChildren: [],
    professionalChildren: [],
    quickDataStatus: {},
    allEntries,
    recentEntries: allEntries,
    timelineSummary,
    incidents: { [child.id]: [] },
    expandedCards: {},
    expandedCategories: {},
    highlightedActions: {},
    showDailyCareModal: false,
    dailyCareAction: null,
    dailyCareChild: null,
    showSleepLogSheet: false,
    sleepLogChild: null,
    showFoodLogSheet: false,
    foodLogChild: null,
    showBathroomLogSheet: false,
    bathroomLogChild: null,
    showDailyReportModal: false,
    dailyReportChild: null,
    showIncidentModal: false,
    incidentChild: null,
    showFollowUpModal: false,
    followUpIncident: null,
    showPatternSuggestionModal: false,
    patternSuggestions: [],
    suggestionsChildId: null,
    showDailyHabitsModal: false,
    dailyHabitsInitialCategoryId: null,
    dailyHabitsChild: null,
    showQuickEntry: false,
    selectedChild: child,
    entryType: 'micro',
    quickEntryStep: 0,
    currentChildId: child.id,
    USER_ROLES: {
      CARE_OWNER: 'care_owner',
      CARE_PARTNER: 'care_partner',
      CAREGIVER: 'caregiver',
      THERAPIST: 'therapist',
    },
    isReadOnlyForChild: () => false,
    getUserRoleForChild: (childId) => (childId === child.id ? role : null),
    setCurrentChildId: noop,
    setExpandedCategories: noop,
    handleAddChild: noop,
    handleInviteTeamMember: noop,
    isCardExpanded: () => false,
    toggleCard: noop,
    handleQuickDataEntry: noop,
    handleEditChild: noop,
    handleDeleteChild: noop,
    handleDailyReport: noop,
    handleMessages: noop,
    handleGroupActionClick: noop,
    getTypeConfig: (type) => ({ icon: '📝', color: '#0f172a', label: type }),
    formatTimeAgo: () => '1h ago',
    handleAddChildSuccess: noop,
    handleEditChildSuccess: noop,
    handleCloseDailyCareModal: noop,
    handleCloseSleepLogSheet: noop,
    handleCloseFoodLogSheet: noop,
    handleCloseBathroomLogSheet: noop,
    handleDailyCareComplete: noop,
    handleCloseDailyReportModal: noop,
    handleDailyReportEdit: noop,
    handleCloseIncidentModal: noop,
    handleCloseFollowUpModal: noop,
    handleClosePatternSuggestionModal: noop,
    handleCreateCustomCategories: noop,
    setShowDailyHabitsModal: noop,
    handleCloseDailyHabitsModal: noop,
    handleTrack: noop,
    handleOpenSleepLog: noop,
    handleOpenFoodLog: noop,
    handleOpenBathroomLog: noop,
    handleOpenMedicalLog: noop,
    handleShowCareReport: noop,
    handleCloseCareReportModal: noop,
    showCareReportModal: false,
    careReportChild: null,
    checkForPatterns: noop,
    handleQuickEntryComplete: noop,
    handleQuickEntrySkip: noop,
    refreshDailyCareStatus: async () => {},
    refreshDashboard: async () => {},
  };
};
