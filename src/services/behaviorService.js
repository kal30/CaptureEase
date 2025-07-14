
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase'; // Assuming you have a firebase.js file that exports the firestore instance

const behaviorsCollection = collection(db, 'behaviors');
const behaviorTemplatesCollection = collection(db, 'behaviorTemplates');

// Create a new behavior
export const addBehavior = async (childId, behaviorData) => {
  try {
    if (behaviorData.isTemplate) {
        // Check for duplicate template before adding
        const q = query(behaviorTemplatesCollection, where('childId', '==', childId), where('name', '==', behaviorData.name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.warn('Template with this name already exists for this child. Not adding duplicate.');
            return; // Do not add duplicate
        }

        await addDoc(behaviorTemplatesCollection, {
            childId,
            name: behaviorData.name,
            description: behaviorData.description,
            iconName: behaviorData.iconName,
        });
    }
    const docRef = await addDoc(behaviorsCollection, {
      childId,
      name: behaviorData.name,
      description: behaviorData.description,
      goal: behaviorData.goal,
      iconName: behaviorData.iconName,
      createdAt: behaviorData.createdAt,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding behavior:', error);
    throw error;
  }
};

// Get all behaviors for a specific child
export const getBehaviors = async (childId) => {
  try {
    const q = query(behaviorsCollection, where('childId', '==', childId));
    const querySnapshot = await getDocs(q);
    const behaviors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return behaviors;
  } catch (error) {
    console.error('Error getting behaviors:', error);
    throw error;
  }
};

// Get all behavior templates for a specific child
export const getBehaviorTemplates = async (childId) => {
    try {
        const q = query(behaviorTemplatesCollection, where('childId', '==', childId));
        const querySnapshot = await getDocs(q);
        const templates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return templates;
    } catch (error) {
        console.error('Error getting behavior templates:', error);
        throw error;
    }
};

// Delete a behavior template
export const deleteBehaviorTemplate = async (templateId) => {
    try {
        const templateDoc = doc(db, 'behaviorTemplates', templateId);
        await deleteDoc(templateDoc);
    } catch (error) {
        console.error('Error deleting behavior template:', error);
        throw error;
    }
};

// Update a behavior template
export const updateBehaviorTemplate = async (templateId, updatedData) => {
    try {
        const templateDoc = doc(db, 'behaviorTemplates', templateId);
        await updateDoc(templateDoc, updatedData);
    } catch (error) {
        console.error('Error updating behavior template:', error);
        throw error;
    }
};

// Update a behavior
export const updateBehavior = async (behaviorId, updatedData) => {
  try {
    const behaviorDoc = doc(db, 'behaviors', behaviorId);
    await updateDoc(behaviorDoc, updatedData);
  } catch (error) {
    console.error('Error updating behavior:', error);
    throw error;
  }
};

// Delete a behavior
export const deleteBehavior = async (behaviorId) => {
  try {
    const behaviorDoc = doc(db, 'behaviors', behaviorId);
    await deleteDoc(behaviorDoc);
  } catch (error) {
    console.error('Error deleting behavior:', error);
    throw error;
  }
};
