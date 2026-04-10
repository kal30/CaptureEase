import './commands'

const mockData = {
  authUser: {
    uid: 'cypress-owner',
    email: 'test@captureez.com',
    displayName: 'Test Care Owner',
  },
  child: {
    id: 'cypress-child-1',
    name: 'Mia Johnson',
    age: 8,
    birthDate: '2017-03-15',
    description: 'Demo child for Cypress browser tests',
    status: 'active',
    users: {
      care_owner: 'cypress-owner',
      care_partners: ['cypress-partner'],
      caregivers: [],
      therapists: [],
      members: ['cypress-owner', 'cypress-partner'],
    },
    medicalProfile: {
      foodAllergies: [],
      currentMedications: [],
    },
  },
  careTeamsByChildId: {
    'cypress-child-1': [
      {
        userId: 'cypress-owner',
        role: 'care_owner',
        displayName: 'Test Care Owner',
        email: 'test@captureez.com',
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
    'cypress-child-1': 'care_owner',
  },
  timelineSummaryByChildId: {
    'cypress-child-1': {
      totalEntries: 2,
      todayCount: 2,
      weekCount: 5,
      activityStreak: 3,
      lastActivityTime: '10:30 AM',
    },
  },
  allEntriesByChildId: {
    'cypress-child-1': [],
  },
}

Cypress.on('window:before:load', (win) => {
  win.__captureezE2E_MOCK = true
  win.__captureezE2E_DATA = mockData
})
