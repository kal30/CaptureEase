// mockSendEmail must use the 'mock' prefix so Jest's hoisting allows it
// inside the jest.mock() factory (called before variable initialisation).
const mockSendEmail = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn((val) => val),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  fetchSignInMethodsForEmail: jest.fn(),
}));

// httpsCallable returns mockSendEmail at module load time so that
// sendInvitationEmailCallable (module-level const) is correctly wired up.
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(() => mockSendEmail),
}));

jest.mock('../../services/firebase', () => ({ db: {}, app: {} }));

jest.mock('../../services/rolePermissionService', () => ({
  getUserRoleForChild: jest.fn(),
}));

jest.mock('../../services/migrations/usersMembersMigration', () => ({
  updateMembersField: jest.fn(() => []),
}));

const { sendInvitation } = require('../../services/invitationService');
const { getAuth, fetchSignInMethodsForEmail } = require('firebase/auth');
const { getDoc, getDocs, updateDoc } = require('firebase/firestore');
const { getUserRoleForChild } = require('../../services/rolePermissionService');

const TEST_EMAIL = 'test@captureez.com';
const TEST_CHILD_ID = 'child-test-123';
const TEST_USER_ID = 'owner-user-456';

describe('invitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getAuth.mockReturnValue({
      currentUser: {
        uid: TEST_USER_ID,
        email: 'owner@captureez.com',
        displayName: 'Test Owner',
      },
    });

    getUserRoleForChild.mockResolvedValue('care_owner');

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Test Child',
        users: {
          care_owner: TEST_USER_ID,
          care_partners: [],
          caregivers: [],
          therapists: [],
        },
      }),
    });

    mockSendEmail.mockResolvedValue({ data: { success: true } });
  });

  describe('sendInvitation', () => {
    it('throws if user is not logged in', async () => {
      getAuth.mockReturnValue({ currentUser: null });
      await expect(sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'caregiver')).rejects.toThrow(
        'User not logged in.'
      );
    });

    it('throws if requester is not care owner', async () => {
      getUserRoleForChild.mockResolvedValue('caregiver');
      await expect(sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'caregiver')).rejects.toThrow(
        'Only the Care Owner can invite'
      );
    });

    it('throws for an invalid role', async () => {
      await expect(sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'admin')).rejects.toThrow(
        'Invalid role'
      );
    });

    it('sends invitation email to test email when user does not exist - caregiver', async () => {
      fetchSignInMethodsForEmail.mockResolvedValue([]);

      const result = await sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'caregiver');

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: TEST_EMAIL,
          role: 'caregiver',
          childName: 'Test Child',
        })
      );
      expect(result.status).toBe('invited');
    });

    it('sends invitation email to test email when user does not exist - therapist', async () => {
      fetchSignInMethodsForEmail.mockResolvedValue([]);

      const result = await sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'therapist', 'Speech Therapy');

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: TEST_EMAIL,
          role: 'therapist',
          childName: 'Test Child',
        })
      );
      expect(result.status).toBe('invited');
    });

    it('sends invitation email to test email when user does not exist - care_partner', async () => {
      fetchSignInMethodsForEmail.mockResolvedValue([]);

      const result = await sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'care_partner');

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: TEST_EMAIL,
          role: 'care_partner',
        })
      );
      expect(result.status).toBe('invited');
    });

    it('directly assigns role in Firestore when test user already has an account', async () => {
      fetchSignInMethodsForEmail.mockResolvedValue(['google.com']);
      getDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-user-id', data: () => ({ email: TEST_EMAIL }) }],
      });

      const result = await sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'caregiver');

      expect(updateDoc).toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
      expect(result.status).toBe('assigned');
    });

    it('sends email if test user exists in Auth but has no Firestore profile', async () => {
      fetchSignInMethodsForEmail.mockResolvedValue(['google.com']);
      getDocs.mockResolvedValue({ empty: true, docs: [] });

      const result = await sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'caregiver');

      expect(mockSendEmail).toHaveBeenCalled();
      expect(result.status).toBe('invited');
    });

    it('includes personalMessage in the email payload', async () => {
      fetchSignInMethodsForEmail.mockResolvedValue([]);
      const message = 'Looking forward to working with you!';

      await sendInvitation(TEST_CHILD_ID, TEST_EMAIL, 'caregiver', null, message);

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ personalMessage: message })
      );
    });
  });
});
