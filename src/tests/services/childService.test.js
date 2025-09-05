import { getChildren, addChild } from '../../services/childService';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

jest.mock('../../services/firebase', () => ({
  db: {}
}));

describe('childService', () => {
  const mockUser = { uid: 'test-user-123' };
  
  beforeEach(() => {
    require('firebase/auth').getAuth.mockReturnValue({
      currentUser: mockUser
    });
  });

  describe('getChildren', () => {
    it('returns empty array when no user', async () => {
      require('firebase/auth').getAuth.mockReturnValue({
        currentUser: null
      });

      const result = await getChildren();
      expect(result).toEqual([]);
    });

    it('filters children by user permissions', async () => {
      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'child1',
            data: () => ({
              name: 'Test Child',
              users: {
                care_owner: 'test-user-123',
                care_partners: [],
                caregivers: [],
                therapists: []
              }
            })
          });
        })
      };

      require('firebase/firestore').getDocs.mockResolvedValue(mockSnapshot);

      const result = await getChildren();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'child1',
        name: 'Test Child'
      });
    });
  });

  describe('addChild', () => {
    it('creates child with correct user structure', async () => {
      const mockChildData = {
        name: 'New Child',
        age: '5'
      };

      const mockDocRef = { id: 'new-child-id' };
      require('firebase/firestore').addDoc.mockResolvedValue(mockDocRef);

      const result = await addChild(mockChildData);

      expect(result).toBe('new-child-id');
      expect(require('firebase/firestore').addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'New Child',
          age: '5',
          users: {
            care_owner: 'test-user-123',
            care_partners: [],
            caregivers: [],
            therapists: []
          }
        })
      );
    });

    it('throws error when no user logged in', async () => {
      require('firebase/auth').getAuth.mockReturnValue({
        currentUser: null
      });

      await expect(addChild({ name: 'Test' })).rejects.toThrow('User not logged in');
    });
  });
});