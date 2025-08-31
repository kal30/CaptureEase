import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

// String similarity helpers (Levenshtein + normalization)
const calculateSimilarity = (str1, str2) => {
  const normalize = (str) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const s1 = normalize(str1 || '');
  const s2 = normalize(str2 || '');
  if (s1 === s2) return 1.0;
  const matrix = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1.0 : (maxLength - distance) / maxLength;
};

const findSimilarIncidents = (incidents, threshold = 0.65) => {
  const groups = {};
  incidents.forEach((incident) => {
    const name = incident.customIncidentName;
    if (!name) return;
    let assigned = false;
    for (const [groupKey, group] of Object.entries(groups)) {
      if (calculateSimilarity(name, groupKey) >= threshold) {
        group.incidents.push(incident);
        group.variations.add(name);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      groups[name] = {
        primaryName: name,
        incidents: [incident],
        variations: new Set([name]),
        count: 1,
      };
    }
  });
  Object.values(groups).forEach((group) => {
    group.count = group.incidents.length;
    group.variations = Array.from(group.variations);
  });
  return groups;
};

// Helper functions for suggesting category properties
const formatCategoryName = (customName) =>
  String(customName || '')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const generateCategoryKey = (customName) =>
  `CUSTOM_${String(customName || '')
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20)}`;

const suggestIcon = (customName) => {
  const name = String(customName || '').toLowerCase();
  if (name.includes('rash') || name.includes('skin')) return '🔴';
  if (name.includes('cough') || name.includes('throat')) return '🗣️';
  if (name.includes('stomach') || name.includes('nausea')) return '🤢';
  if (name.includes('headache') || name.includes('head')) return '🧠';
  if (name.includes('fever') || name.includes('temperature')) return '🌡️';
  if (name.includes('allergy') || name.includes('allergic')) return '🤧';
  return '📝';
};

const suggestColor = (customName) => {
  const name = String(customName || '').toLowerCase();
  if (name.includes('pain') || name.includes('hurt')) return '#F44336';
  if (name.includes('rash') || name.includes('skin')) return '#FF9800';
  if (name.includes('stomach') || name.includes('nausea')) return '#4CAF50';
  if (name.includes('fever') || name.includes('sick')) return '#E91E63';
  return '#607D8B';
};

const suggestRemedies = (customName) => {
  const name = String(customName || '').toLowerCase();
  const base = ['Monitor symptoms', 'Comfort measures', 'Other'];
  if (name.includes('stomach') || name.includes('nausea') || name.includes('tummy')) {
    return ['Rest', 'Bland food', 'Hydration', 'Monitor symptoms', 'Other'];
  }
  if (name.includes('rash') || name.includes('skin')) {
    return ['Cool compress', 'Gentle cleansing', 'Avoid irritants', 'Monitor symptoms', 'Other'];
  }
  if (name.includes('fever') || name.includes('temperature')) {
    return ['Hydration', 'Rest', 'Cool environment', 'Monitor temperature', 'Other'];
  }
  if (name.includes('cough') || name.includes('throat')) {
    return ['Hydration', 'Honey (if age appropriate)', 'Humidifier', 'Monitor symptoms', 'Other'];
  }
  return base;
};

// Category management
export const getSimilarIncidentNames = async (childId, searchTerm = '') => {
  try {
    const q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      where('type', '==', 'other'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const incidents = querySnapshot.docs.map((docSnap) => docSnap.data());
    const incidentNames = [
      ...new Set(
        incidents
          .map((i) => i.customIncidentName)
          .filter((n) => n && n.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    ];
    return incidentNames.slice(0, 10);
  } catch (error) {
    console.error('Error fetching similar incident names:', error);
    return [];
  }
};

export const analyzeOtherIncidentPatterns = async (childId, minimumOccurrences = 3) => {
  try {
    const q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      where('type', '==', 'other'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const otherIncidents = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    const groups = findSimilarIncidents(otherIncidents);
    const suggestions = Object.values(groups)
      .filter((g) => g.count >= minimumOccurrences)
      .map((g) => ({
        primaryName: g.primaryName,
        variations: g.variations,
        occurrences: g.count,
        incidents: g.incidents,
        suggestedCategory: formatCategoryName(g.primaryName),
        suggestedIcon: suggestIcon(g.primaryName),
        suggestedColor: suggestColor(g.primaryName),
        suggestedKey: generateCategoryKey(g.primaryName),
      }))
      .sort((a, b) => b.occurrences - a.occurrences);
    return suggestions;
  } catch (error) {
    console.error('Error analyzing incident patterns:', error);
    throw error;
  }
};

export const checkForCategorySuggestion = async (childId, incidentName) => {
  try {
    const patterns = await analyzeOtherIncidentPatterns(childId, 3);
    for (const pattern of patterns) {
      const similarity = Math.max(
        ...pattern.variations.map((v) => calculateSimilarity(incidentName, v))
      );
      if (similarity >= 0.65) {
        return { shouldSuggest: true, suggestion: pattern };
      }
    }
    return { shouldSuggest: false };
  } catch (error) {
    console.error('Error checking for category suggestion:', error);
    return { shouldSuggest: false };
  }
};

export const createCustomCategory = async (childId, categoryData, authorInfo) => {
  try {
    const q = query(
      collection(db, 'children', childId, 'customIncidentCategories'),
      orderBy('createdAt', 'desc')
    );
    const existingSnap = await getDocs(q);
    const categories = {};
    existingSnap.docs.forEach((d) => (categories[d.data().key] = { id: d.id, ...d.data() }));
    const categoryCount = Object.keys(categories).length;
    if (categoryCount >= 10) throw new Error('Maximum of 10 custom categories allowed per child');

    const existingNames = Object.values(categories).map((c) => c.label.toLowerCase());
    if (existingNames.includes(String(categoryData.label).toLowerCase())) {
      throw new Error('A category with this name already exists');
    }

    const categoryKey = generateCategoryKey(categoryData.label);
    const docData = {
      key: categoryKey,
      id: categoryData.id || categoryKey.toLowerCase(),
      label: categoryData.label,
      color: categoryData.color,
      emoji: categoryData.emoji,
      remedies: categoryData.remedies || suggestRemedies(categoryData.label),
      createdAt: serverTimestamp(),
      createdBy: authorInfo,
      usageCount: 0,
      isActive: true,
    };
    const docRef = await addDoc(
      collection(db, 'children', childId, 'customIncidentCategories'),
      docData
    );
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error('Error creating custom category:', error);
    throw error;
  }
};

export const updateCustomCategory = async (childId, categoryId, updates) => {
  try {
    const categoryRef = doc(db, 'children', childId, 'customIncidentCategories', categoryId);
    await updateDoc(categoryRef, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating custom category:', error);
    throw error;
  }
};

export const deleteCustomCategory = async (childId, categoryId, categoryKey) => {
  try {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      where('type', '==', categoryKey)
    );
    const incidentsSnapshot = await getDocs(incidentsQuery);
    const batch = writeBatch(db);
    incidentsSnapshot.docs.forEach((docSnapshot) => {
      const incidentData = docSnapshot.data();
      const incidentRef = doc(db, 'incidents', docSnapshot.id);
      batch.update(incidentRef, {
        type: 'other',
        customIncidentName: incidentData.originalCustomName || incidentData.customIncidentName,
        originalCustomName: incidentData.originalCustomName || incidentData.customIncidentName,
        deletedFromCategory: categoryKey,
        deletedAt: serverTimestamp(),
      });
    });
    const categoryRef = doc(db, 'children', childId, 'customIncidentCategories', categoryId);
    batch.delete(categoryRef);
    await batch.commit();
    return incidentsSnapshot.docs.length;
  } catch (error) {
    console.error('Error deleting custom category:', error);
    throw error;
  }
};

export const mergeCustomCategories = async (
  childId,
  sourceCategories,
  targetCategory,
  newLabel,
  newRemedies
) => {
  try {
    const batch = writeBatch(db);
    const targetRef = doc(db, 'children', childId, 'customIncidentCategories', targetCategory.id);
    batch.update(targetRef, {
      label: newLabel,
      remedies: newRemedies,
      updatedAt: serverTimestamp(),
      mergedFrom: sourceCategories.map((c) => c.key),
    });
    for (const sourceCategory of sourceCategories) {
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('childId', '==', childId),
        where('type', '==', sourceCategory.key)
      );
      const incidentsSnapshot = await getDocs(incidentsQuery);
      incidentsSnapshot.docs.forEach((docSnapshot) => {
        const incidentRef = doc(db, 'incidents', docSnapshot.id);
        batch.update(incidentRef, {
          type: targetCategory.key,
          mergedFrom: sourceCategory.key,
          mergedAt: serverTimestamp(),
        });
      });
      const sourceRef = doc(db, 'children', childId, 'customIncidentCategories', sourceCategory.id);
      batch.delete(sourceRef);
    }
    await batch.commit();
  } catch (error) {
    console.error('Error merging custom categories:', error);
    throw error;
  }
};

export const migrateIncidentsToCustomCategory = async (childId, incidents, categoryKey) => {
  try {
    const batch = writeBatch(db);
    incidents.forEach((incident) => {
      const ref = doc(db, 'incidents', incident.id);
      batch.update(ref, {
        type: categoryKey,
        originalCustomName: incident.customIncidentName,
        migratedAt: serverTimestamp(),
        migratedFromOther: true,
      });
    });
    await batch.commit();
    return incidents.length;
  } catch (error) {
    console.error('Error migrating incidents:', error);
    throw error;
  }
};

