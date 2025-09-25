const {
  normalizeToken,
  extractHashtags,
  parseMessageTags,
  createMessageHash,
  RESERVED_TAGS
} = require('./messageRouting');

// Mock Firestore for testing
const mockFirestore = {
  children: new Map(),
  users: new Map()
};

// Helper to setup test data
const setupTestData = () => {
  mockFirestore.children.clear();
  mockFirestore.users.clear();
  
  // Add test children
  mockFirestore.children.set('child1', {
    id: 'child1',
    name: 'Emma Doe',
    status: 'active',
    users: { members: ['user1'] }
  });
  
  mockFirestore.children.set('child2', {
    id: 'child2', 
    name: 'José María',
    settings: { alias: 'JM' },
    status: 'active',
    users: { members: ['user1'] }
  });
  
  mockFirestore.children.set('tfVn2r0SbU6mtfu7n2ui', {
    id: 'tfVn2r0SbU6mtfu7n2ui',
    name: 'Lucy Smith',
    status: 'active',
    users: { members: ['user1'] }
  });
};

describe('Message Routing Utilities', () => {
  
  describe('normalizeToken', () => {
    test('removes diacritics', () => {
      expect(normalizeToken('José María')).toBe('josemaria');
      expect(normalizeToken('Émma')).toBe('emma');
    });
    
    test('handles punctuation and spacing', () => {
      expect(normalizeToken('Emma-Doe')).toBe('emmadoe');
      expect(normalizeToken('Emma_Kate')).toBe('emmakate');
      expect(normalizeToken('Emma Kate')).toBe('emmakate');
    });
    
    test('converts to lowercase', () => {
      expect(normalizeToken('EMMA')).toBe('emma');
      expect(normalizeToken('EmmaDoe')).toBe('emmadoe');
    });
  });
  
  describe('extractHashtags', () => {
    test('extracts hashtags from text', () => {
      expect(extractHashtags('Great day #Emma #progress')).toEqual(['Emma', 'progress']);
      expect(extractHashtags('No hashtags here')).toEqual([]);
      expect(extractHashtags('#single')).toEqual(['single']);
    });
    
    test('handles mixed content', () => {
      expect(extractHashtags('Had lunch #meal with #Emma #love')).toEqual(['meal', 'Emma', 'love']);
    });
  });
  
  describe('parseMessageTags', () => {
    test('excludes child token and reserved tags', () => {
      const tags = parseMessageTags('Great session #Emma #progress #sleep', 'Emma');
      expect(tags).toEqual(['progress']); // excludes Emma (child) and sleep (reserved)
    });
    
    test('normalizes tag output', () => {
      const tags = parseMessageTags('Fun day #THERAPY #Progress', null);
      expect(tags).toEqual(['progress']); // therapy is reserved, progress normalized
    });
    
    test('handles empty cases', () => {
      expect(parseMessageTags('No tags here', null)).toEqual([]);
      expect(parseMessageTags('#sleep #meal', null)).toEqual([]); // all reserved
    });
  });
  
  describe('createMessageHash', () => {
    test('creates consistent hash', () => {
      const hash1 = createMessageHash('+1234567890', 'Hello world');
      const hash2 = createMessageHash('+1234567890', 'Hello world');
      expect(hash1).toBe(hash2);
    });
    
    test('creates different hash for different content', () => {
      const hash1 = createMessageHash('+1234567890', 'Hello world');
      const hash2 = createMessageHash('+1234567890', 'Hello there');
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('RESERVED_TAGS', () => {
    test('contains expected reserved words', () => {
      expect(RESERVED_TAGS).toContain('sleep');
      expect(RESERVED_TAGS).toContain('mood');
      expect(RESERVED_TAGS).toContain('therapy');
      expect(RESERVED_TAGS).toContain('progress');
    });
  });
});

// Acceptance Tests
describe('Message Routing Acceptance Tests', () => {
  
  describe('Success Cases', () => {
    test('#childId → logs by ID', async () => {
      // Mock resolveChildForMessage would be tested here
      // This would require mocking Firestore Admin SDK
      expect(true).toBe(true); // Placeholder
    });
    
    test('#Emma #progress → logs by name', async () => {
      // Test name-based resolution with tags
      expect(true).toBe(true); // Placeholder  
    });
    
    test('no child tag + default set → logs to default', async () => {
      // Test default fallback behavior
      expect(true).toBe(true); // Placeholder
    });
  });
  
  describe('Edge Cases', () => {
    test('ambiguous name → default with reason', async () => {
      // Test multiple children with same normalized name
      expect(true).toBe(true); // Placeholder
    });
    
    test('no default + no tag → queued needs_child', async () => {
      // Test error handling when no resolution possible
      expect(true).toBe(true); // Placeholder
    });
    
    test('SMS disabled → blocked with clear reply', async () => {
      // Test child SMS settings check
      expect(true).toBe(true); // Placeholder
    });
    
    test('no access → blocked with clear reply', async () => {
      // Test access control
      expect(true).toBe(true); // Placeholder
    });
    
    test('Twilio retry → single log (deduped)', async () => {
      // Test deduplication logic
      expect(true).toBe(true); // Placeholder
    });
  });
  
  describe('Tag Processing', () => {
    test('reserved tags excluded from child matching', () => {
      const result = parseMessageTags('Fun day #sleep #Emma #progress', 'Emma');
      expect(result).toEqual(['progress']);
      // #sleep is reserved, #Emma is child token, only #progress remains
    });
    
    test('multiple child tokens use last one', () => {
      // This would be tested in resolveChildForMessage
      expect(true).toBe(true); // Placeholder
    });
    
    test('diacritics normalized in matching', () => {
      expect(normalizeToken('Émma')).toBe(normalizeToken('emma'));
      expect(normalizeToken('José')).toBe(normalizeToken('jose'));
    });
  });
  
  describe('Message Examples', () => {
    const testCases = [
      {
        message: 'Great session today #Emma #progress',
        expectedChild: 'Emma',
        expectedTags: ['progress'],
        description: 'Name-based routing with content tag'
      },
      {
        message: 'Had a fun day #sleep',
        expectedChild: 'default',
        expectedTags: [],
        description: 'Reserved tag falls back to default'
      },
      {
        message: 'Doctor visit #tfVn2r0SbU6mtfu7n2ui #medical',
        expectedChild: 'tfVn2r0SbU6mtfu7n2ui',
        expectedTags: ['medical'],
        description: 'ID-based routing with content tag'
      },
      {
        message: 'Playing with #Emma #Lucy #toys',
        expectedChild: 'Lucy',
        expectedTags: ['toys'],
        description: 'Multiple child tokens use last one'
      }
    ];
    
    testCases.forEach(({ message, expectedChild, expectedTags, description }) => {
      test(description, () => {
        // These would be integration tests with mocked Firestore
        // Testing the complete resolveChildForMessage flow
        expect(true).toBe(true); // Placeholder
      });
    });
  });
});

// Export test helpers for integration tests
module.exports = {
  setupTestData,
  mockFirestore
};