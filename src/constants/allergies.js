// Neutral metadata about allergies, no colors or UI concerns.
// Consumers map severity to theme colors as needed.

export const getAllergyMeta = (allergyName) => {
  const name = String(allergyName || '').toLowerCase();

  // Life-threatening allergies (highest priority)
  if (name.includes('nut') || name.includes('peanut') || name.includes('tree nut')) {
    return { emoji: '🥜', severity: 'High', priority: 0 };
  }
  if (name.includes('shellfish') || name.includes('seafood')) {
    return { emoji: '🦐', severity: 'High', priority: 1 };
  }
  if (name.includes('bee') || name.includes('wasp') || name.includes('sting')) {
    return { emoji: '🐝', severity: 'High', priority: 2 };
  }

  // Common allergies (medium priority)
  if (name.includes('dairy') || name.includes('milk') || name.includes('lactose')) {
    return { emoji: '🥛', severity: 'Medium', priority: 3 };
  }
  if (name.includes('gluten') || name.includes('wheat') || name.includes('celiac')) {
    return { emoji: '🌾', severity: 'Medium', priority: 4 };
  }
  if (name.includes('egg')) {
    return { emoji: '🥚', severity: 'Medium', priority: 5 };
  }
  if (name.includes('soy') || name.includes('soya')) {
    return { emoji: '🫘', severity: 'Medium', priority: 6 };
  }

  // Less common allergies (lower priority)
  if (name.includes('sesame')) {
    return { emoji: '🌱', severity: 'Low', priority: 7 };
  }
  if (name.includes('fish')) {
    return { emoji: '🐟', severity: 'Medium', priority: 8 };
  }
  if (name.includes('citrus') || name.includes('orange') || name.includes('lemon')) {
    return { emoji: '🍊', severity: 'Low', priority: 9 };
  }
  if (name.includes('chocolate') || name.includes('cocoa')) {
    return { emoji: '🍫', severity: 'Low', priority: 10 };
  }
  if (name.includes('dye') || name.includes('artificial')) {
    return { emoji: '🌈', severity: 'Low', priority: 11 };
  }

  // Default/unknown allergies - make them more visible
  return { emoji: '⚠️', severity: 'Unknown', priority: 12 };
};

export const compareAllergies = (a, b) => getAllergyMeta(a).priority - getAllergyMeta(b).priority;

export const sortAllergiesByPriority = (allergies) => {
  if (!Array.isArray(allergies)) return [];
  return [...allergies].sort(compareAllergies);
};

