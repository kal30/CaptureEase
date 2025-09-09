import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Test Data Generator for CaptureEase
 * Creates realistic test data including users, children, and activity data with media
 */

// Sample media URLs for testing (using placeholder services)
const SAMPLE_IMAGES = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2', 
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5'
];

const SAMPLE_VIDEOS = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
];

// Test user data with realistic names and roles
const TEST_USERS = [
  {
    id: 'test_alice_owner',
    email: 'alice.johnson@test.com',
    displayName: 'Alice Johnson',
    role: 'care_owner',
    photoURL: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 'test_bob_owner', 
    email: 'bob.smith@test.com',
    displayName: 'Bob Smith',
    role: 'care_owner',
    photoURL: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 'test_carol_partner',
    email: 'carol.davis@test.com', 
    displayName: 'Carol Davis',
    role: 'care_partner',
    photoURL: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 'test_david_partner',
    email: 'david.wilson@test.com',
    displayName: 'David Wilson', 
    role: 'care_partner',
    photoURL: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: 'test_eve_caregiver',
    email: 'eve.brown@test.com',
    displayName: 'Eve Brown',
    role: 'caregiver', 
    photoURL: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 'test_frank_caregiver',
    email: 'frank.miller@test.com',
    displayName: 'Frank Miller',
    role: 'caregiver',
    photoURL: 'https://i.pravatar.cc/150?img=6'
  },
  {
    id: 'test_grace_therapist',
    email: 'grace.lee@test.com', 
    displayName: 'Grace Lee',
    role: 'therapist',
    photoURL: 'https://i.pravatar.cc/150?img=7'
  },
  {
    id: 'test_henry_therapist',
    email: 'henry.taylor@test.com',
    displayName: 'Henry Taylor',
    role: 'therapist',
    photoURL: 'https://i.pravatar.cc/150?img=8'
  }
];

// Test children with different care team configurations
const TEST_CHILDREN = [
  {
    name: 'Emma Johnson',
    age: 8,
    birthDate: '2015-03-15',
    description: 'Energetic 8-year-old who loves art and music',
    users: {
      care_owner: 'test_alice_owner',
      care_partners: ['test_bob_owner', 'test_carol_partner'],
      caregivers: ['test_eve_caregiver'],
      therapists: ['test_grace_therapist'],
      members: ['test_alice_owner', 'test_bob_owner', 'test_carol_partner', 'test_eve_caregiver', 'test_grace_therapist']
    },
    settings: {
      allow_therapist_family_logs: false
    }
  },
  {
    name: 'Liam Smith', 
    age: 12,
    birthDate: '2011-07-22',
    description: 'Active preteen interested in sports and science',
    users: {
      care_owner: 'test_bob_owner',
      care_partners: ['test_david_partner'],
      caregivers: ['test_frank_caregiver'],
      therapists: ['test_henry_therapist'],
      members: ['test_bob_owner', 'test_david_partner', 'test_frank_caregiver', 'test_henry_therapist']
    },
    settings: {
      allow_therapist_family_logs: true
    }
  },
  {
    name: 'Sofia Davis',
    age: 6,
    birthDate: '2017-11-08', 
    description: 'Creative 6-year-old who enjoys drawing and storytelling',
    users: {
      care_owner: 'test_carol_partner', // Note: Carol is owner here but partner in Emma's care
      care_partners: ['test_alice_owner'],
      caregivers: ['test_eve_caregiver', 'test_frank_caregiver'],
      therapists: ['test_grace_therapist'],
      members: ['test_carol_partner', 'test_alice_owner', 'test_eve_caregiver', 'test_frank_caregiver', 'test_grace_therapist']
    },
    settings: {
      allow_therapist_family_logs: false
    }
  }
];

// Sample activity data templates
const ACTIVITY_TEMPLATES = {
  dailyLogs: [
    {
      type: 'mood',
      title: 'Morning mood check',
      notes: 'Started the day feeling happy and energetic',
      mood: 8,
      energy: 7,
      mediaType: 'image',
      tags: ['morning', 'positive']
    },
    {
      type: 'activity',
      title: 'Art therapy session',
      notes: 'Created a beautiful painting today. Very focused and engaged.',
      mood: 9,
      energy: 6,
      mediaType: 'image',
      tags: ['art', 'therapy', 'creative']
    },
    {
      type: 'behavior',
      title: 'Great sharing at lunch',
      notes: 'Voluntarily shared snacks with friends without prompting',
      mood: 8,
      energy: 7,
      mediaType: 'video',
      tags: ['social', 'sharing', 'positive']
    }
  ],
  incidents: [
    {
      type: 'behavioral',
      title: 'Meltdown during transition',
      description: 'Had difficulty transitioning from playtime to homework. Became upset and threw toys.',
      severity: 'moderate',
      duration: 15,
      triggers: ['transition', 'homework'],
      interventions: ['calm down space', 'deep breathing'],
      mediaType: 'voice',
      tags: ['transition', 'meltdown', 'toys']
    },
    {
      type: 'medical',
      title: 'Headache complaint',
      description: 'Complained of headache after lunch. Rested for 30 minutes.',
      severity: 'mild',
      duration: 30,
      symptoms: ['headache'],
      interventions: ['rest', 'water'],
      mediaType: 'image',
      tags: ['headache', 'rest']
    }
  ],
  medications: [
    {
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'daily',
      time: '09:00',
      notes: 'Take with breakfast'
    },
    {
      name: 'Omega-3',
      dosage: '500mg',
      frequency: 'twice daily',
      time: '09:00,18:00',
      notes: 'Take with meals'
    }
  ]
};

/**
 * Create test users in Firestore - Updated to work with current user permissions
 */
export const createTestUsers = async () => {
  console.log('Creating test users...');
  const results = [];
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User must be logged in to create test data');
  }
  
  try {
    // Instead of creating arbitrary users, we'll create the current user's profile
    // and some mock user profiles for display purposes
    
    // Create/update current user's profile
    const currentUserRef = doc(db, 'users', currentUser.uid);
    await setDoc(currentUserRef, {
      email: currentUser.email,
      displayName: currentUser.displayName || 'Test User',
      photoURL: currentUser.photoURL || 'https://i.pravatar.cc/150?img=1',
      createdAt: new Date(),
      updatedAt: new Date(),
      testData: true
    });
    results.push(`Updated current user profile: ${currentUser.displayName || currentUser.email}`);
    
    // For other users, we'll just return mock data that can be used for display
    // but won't actually be stored in Firestore (since we don't have permission)
    for (let i = 1; i < TEST_USERS.length; i++) {
      const user = TEST_USERS[i];
      results.push(`Mock user prepared: ${user.displayName} (${user.role}) - for UI display only`);
    }
    
    return {
      success: true,
      created: 1, // Only current user actually created
      mockUsers: TEST_USERS.length - 1,
      details: results
    };
  } catch (error) {
    console.error('Error creating test users:', error);
    throw error;
  }
};

/**
 * Create test children with proper user assignments - Updated for current user
 */
export const createTestChildren = async () => {
  console.log('Creating test children...');
  const results = [];
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User must be logged in to create test data');
  }
  
  try {
    // Create children where current user is the care owner
    const testChildrenForCurrentUser = [
      {
        name: 'Emma Johnson',
        age: 8,
        birthDate: '2015-03-15',
        description: 'Energetic 8-year-old who loves art and music',
        users: {
          care_owner: currentUser.uid,
          care_partners: [], // Empty for now since we can't create other users
          caregivers: [],
          therapists: [],
          members: [currentUser.uid] // Only current user
        },
        settings: {
          allow_therapist_family_logs: false
        }
      },
      {
        name: 'Liam Smith', 
        age: 12,
        birthDate: '2011-07-22',
        description: 'Active preteen interested in sports and science',
        users: {
          care_owner: currentUser.uid,
          care_partners: [],
          caregivers: [],
          therapists: [],
          members: [currentUser.uid]
        },
        settings: {
          allow_therapist_family_logs: true
        }
      },
      {
        name: 'Sofia Davis',
        age: 6,
        birthDate: '2017-11-08', 
        description: 'Creative 6-year-old who enjoys drawing and storytelling',
        users: {
          care_owner: currentUser.uid,
          care_partners: [],
          caregivers: [],
          therapists: [],
          members: [currentUser.uid]
        },
        settings: {
          allow_therapist_family_logs: false
        }
      }
    ];
    
    for (const child of testChildrenForCurrentUser) {
      const childRef = await addDoc(collection(db, 'children'), {
        ...child,
        createdAt: new Date(),
        updatedAt: new Date(),
        testData: true
      });
      results.push(`Created child: ${child.name} (Care Owner: ${currentUser.displayName || currentUser.email})`);
    }
    
    return {
      success: true, 
      created: testChildrenForCurrentUser.length,
      details: results
    };
  } catch (error) {
    console.error('Error creating test children:', error);
    throw error;
  }
};

/**
 * Generate activity data with media for created test children
 */
export const createTestActivityData = async () => {
  console.log('Creating test activity data with media...');
  const results = [];
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User must be logged in to create test data');
  }
  
  try {
    // Get user's children using the existing getChildren service
    const { getChildren } = await import('../childService');
    const userChildren = await getChildren();
    
    if (userChildren.length === 0) {
      throw new Error('No children found. Please create children first.');
    }
    
    console.log(`Found ${userChildren.length} children to create activity data for`);
    
    // Generate data for the past 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    for (const child of userChildren) {
      // Create daily logs with media (10 per child)
      for (let i = 0; i < 10; i++) {
        const randomDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime()));
        const template = ACTIVITY_TEMPLATES.dailyLogs[Math.floor(Math.random() * ACTIVITY_TEMPLATES.dailyLogs.length)];
        
        const logData = {
          childId: child.id,
          childName: child.name,
          ...template,
          createdAt: randomDate,
          updatedAt: randomDate,
          authorId: currentUser.uid,
          authorName: currentUser.displayName || currentUser.email,
          testData: true
        };
        
        // Add media based on type
        if (template.mediaType === 'image') {
          logData.mediaUrl = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
          logData.mediaType = 'image';
        } else if (template.mediaType === 'video') {
          logData.mediaUrl = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
          logData.mediaType = 'video';
        } else if (template.mediaType === 'voice') {
          logData.mediaUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
          logData.mediaType = 'audio';
          logData.duration = 30 + Math.floor(Math.random() * 120);
        }
        
        await addDoc(collection(db, 'dailyLogs'), logData);
        results.push(`Created ${template.type} log for ${child.name} with ${template.mediaType}`);
      }
      
      // Create some incidents (3 per child)
      for (let i = 0; i < 3; i++) {
        const randomDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime()));
        const template = ACTIVITY_TEMPLATES.incidents[Math.floor(Math.random() * ACTIVITY_TEMPLATES.incidents.length)];
        
        const incidentData = {
          childId: child.id,
          childName: child.name,
          ...template,
          createdAt: randomDate,
          updatedAt: randomDate,
          authorId: currentUser.uid,
          authorName: currentUser.displayName || currentUser.email,
          testData: true
        };
        
        // Add media for incidents
        if (template.mediaType === 'image') {
          incidentData.mediaUrl = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
        } else if (template.mediaType === 'voice') {
          incidentData.mediaUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
          incidentData.duration = 60 + Math.floor(Math.random() * 240);
        }
        
        await addDoc(collection(db, 'incidents'), incidentData);
        results.push(`Created ${template.type} incident for ${child.name}`);
      }
      
      // Create daily habit entries (5 per child)
      const habitCategories = ['mood', 'sleep', 'nutrition', 'progress', 'other'];
      for (let i = 0; i < 5; i++) {
        const randomDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime()));
        const categoryId = habitCategories[Math.floor(Math.random() * habitCategories.length)];
        const level = Math.floor(Math.random() * 10) + 1; // 1-10 scale
        
        // Map habit categories to dailyCare action types (matching habitService.js)
        const actionTypeMap = {
          mood: 'mood',
          sleep: 'sleep', 
          nutrition: 'food_health',
          progress: 'energy',
          other: 'mood'
        };
        
        const habitData = {
          childId: child.id,
          createdBy: currentUser.uid,
          createdAt: randomDate,
          actionType: actionTypeMap[categoryId] || 'mood',
          data: { 
            level, 
            source: 'habits',
            categoryId,
            categoryLabel: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
            notes: `Test ${categoryId} entry for ${child.name}`
          },
          completedBy: currentUser.uid,
          timestamp: randomDate,
          date: randomDate.toDateString(),
          status: 'active',
          testData: true
        };
        
        await addDoc(collection(db, 'dailyCare'), habitData);
        results.push(`Created ${categoryId} habit for ${child.name} (level ${level})`);
      }
    }
    
    return {
      success: true,
      created: results.length,
      childrenProcessed: userChildren.length,
      details: results
    };
  } catch (error) {
    console.error('Error creating test activity data:', error);
    throw error;
  }
};

/**
 * Clean up all test data
 */
export const cleanupTestData = async () => {
  console.log('Cleaning up test data...');
  // Implementation for cleanup - query all docs with testData: true and delete
  // This is useful for development but should be used carefully
};

/**
 * Run complete test data generation
 */
export const generateAllTestData = async () => {
  try {
    
    const userResults = await createTestUsers();
    const childResults = await createTestChildren(); 
    const activityResults = await createTestActivityData();
    
    return {
      success: true,
      summary: {
        users: userResults.created,
        mockUsers: userResults.mockUsers || 0,
        children: childResults.created,
        activities: activityResults.created,
        childrenProcessed: activityResults.childrenProcessed
      },
      details: {
        users: userResults.details,
        children: childResults.details,
        activities: activityResults.details
      }
    };
  } catch (error) {
    console.error('Error in test data generation:', error);
    throw error;
  }
};