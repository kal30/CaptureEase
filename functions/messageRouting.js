const crypto = require("crypto");
const admin = require("firebase-admin");

// Reserved tags that don't represent children
const RESERVED_TAGS = [
  "sleep", "mood", "meal", "mealtime", "note", "journal", 
  "therapy", "progress", "medical", "incident", "care"
];

/**
 * Normalize text for matching (slugify with diacritics removed)
 * Examples: "Emma Doe" → "emmadoe", "José María" → "josemaria"
 */
const normalizeToken = (text) => {
  return text
    .normalize('NFD')                    // Decompose diacritics
    .replace(/[\u0300-\u036f]/g, '')     // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')             // Remove punctuation
    .replace(/[\s_-]+/g, '');            // Collapse whitespace/underscores/hyphens
};

/**
 * Extract hashtags from text
 * Returns array of tokens without the # symbol
 */
const extractHashtags = (text) => {
  const matches = text.match(/#\w+/g) || [];
  return matches.map(tag => tag.substring(1)); // Remove #
};

/**
 * Remove a specific token from text (optional cleanup)
 */
const stripTokenFromText = (text, tokenUsed) => {
  if (!tokenUsed) return text;
  const regex = new RegExp(`#${tokenUsed}\\b`, 'gi');
  return text.replace(regex, '').replace(/\s+/g, ' ').trim();
};

/**
 * Create dedupe hash for message
 */
const createMessageHash = (fromPhone, messageBody) => {
  const content = fromPhone + '|' + messageBody.trim();
  return crypto.createHash('sha256').update(content).digest('hex');
};

/**
 * Check if user has access to a child
 */
const hasChildAccess = async (uid, childId) => {
  try {
    const db = admin.firestore();
    const childDoc = await db.collection('children').doc(childId).get();
    
    if (!childDoc.exists) return false;
    
    const childData = childDoc.data();
    const members = childData.users?.members || [];
    
    return members.includes(uid);
  } catch (error) {
    console.error('Error checking child access:', error);
    return false;
  }
};

/**
 * Main child resolution function
 * Returns: { childId, reason, tokenMatched, matchedBy }
 */
const resolveChildForMessage = async ({ uid, text, defaultChildId }) => {
  const db = admin.firestore();
  const hashtags = extractHashtags(text);
  
  if (hashtags.length === 0) {
    // No hashtags - use default
    if (defaultChildId) {
      return {
        childId: defaultChildId,
        reason: 'default',
        tokenMatched: null,
        matchedBy: 'default'
      };
    }
    return {
      childId: null,
      reason: 'none',
      tokenMatched: null,
      matchedBy: null
    };
  }

  // Get user's accessible children
  const childrenQuery = await db
    .collection('children')
    .where('users.members', 'array-contains', uid)
    .where('status', '==', 'active')
    .get();
    
  const accessibleChildren = childrenQuery.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  let childMatches = [];
  let lastChildToken = null;

  // Process hashtags in reverse order (use last child-like tag)
  for (let i = hashtags.length - 1; i >= 0; i--) {
    const token = hashtags[i];
    const normalizedToken = normalizeToken(token);
    
    // Skip reserved tags
    if (RESERVED_TAGS.includes(normalizedToken)) {
      continue;
    }

    // 1. Check for explicit Firestore ID (24+ chars)
    if (token.length >= 24) {
      const child = accessibleChildren.find(c => c.id === token);
      if (child) {
        return {
          childId: child.id,
          reason: 'explicitId',
          tokenMatched: token,
          matchedBy: 'id'
        };
      }
    }

    // 2. Check for name/alias match
    const nameMatches = accessibleChildren.filter(child => {
      const normalizedName = normalizeToken(child.name || '');
      const normalizedAlias = normalizeToken(child.settings?.alias || '');
      
      return normalizedName === normalizedToken || 
             (normalizedAlias && normalizedAlias === normalizedToken);
    });

    if (nameMatches.length > 0) {
      childMatches = nameMatches;
      lastChildToken = token;
      break; // Use the last (most recent) child-like token
    }
  }

  // Handle name/alias matches
  if (childMatches.length === 1) {
    const child = childMatches[0];
    const matchedBy = normalizeToken(child.name) === normalizeToken(lastChildToken) ? 'name' : 'alias';
    
    return {
      childId: child.id,
      reason: hashtags.filter(t => !RESERVED_TAGS.includes(normalizeToken(t))).length > 1 ? 'multipleChildTokens' : 'explicitName',
      tokenMatched: lastChildToken,
      matchedBy: matchedBy
    };
  }

  if (childMatches.length > 1) {
    // Ambiguous name - fall back to default
    if (defaultChildId) {
      return {
        childId: defaultChildId,
        reason: 'ambiguousName',
        tokenMatched: lastChildToken,
        matchedBy: 'ambiguous'
      };
    }
  }

  // 3. Future: Check short code aliases (users/{uid}.childAliases)
  // TODO: Implement when needed

  // 4. Fall back to default
  if (defaultChildId) {
    return {
      childId: defaultChildId,
      reason: 'default',
      tokenMatched: null,
      matchedBy: 'default'
    };
  }

  // 5. No resolution possible
  return {
    childId: null,
    reason: 'none',
    tokenMatched: lastChildToken,
    matchedBy: null
  };
};

/**
 * Parse non-child hashtags into tags array
 */
const parseMessageTags = (text, childTokenUsed) => {
  const hashtags = extractHashtags(text);
  
  return hashtags
    .filter(tag => {
      const normalized = normalizeToken(tag);
      // Exclude the child token and reserved tags
      return tag !== childTokenUsed && !RESERVED_TAGS.includes(normalized);
    })
    .map(tag => normalizeToken(tag)); // Normalize tags for consistency
};

module.exports = {
  RESERVED_TAGS,
  normalizeToken,
  extractHashtags,
  stripTokenFromText,
  createMessageHash,
  hasChildAccess,
  resolveChildForMessage,
  parseMessageTags
};