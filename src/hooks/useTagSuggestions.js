import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

const normalizeTag = (tag) => String(tag || '').trim().toLowerCase();

const uniqueTags = (tags) => {
  const seen = new Set();
  const unique = [];
  tags.forEach((tag) => {
    const normalized = normalizeTag(tag);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    unique.push(normalized);
  });
  return unique;
};

const extractTags = (doc) => {
  const data = doc.data();
  const tags = [];
  if (Array.isArray(data.tags)) {
    tags.push(...data.tags);
  }
  if (Array.isArray(data.ai?.tags)) {
    tags.push(...data.ai.tags);
  }
  return tags;
};

const useTagSuggestions = (childId) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      if (!childId) {
        if (isMounted) {
          setSuggestions([]);
        }
        return;
      }

      try {
        const logsQuery = query(
          collection(db, 'logs'),
          where('childId', '==', childId),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(logsQuery);
        const tags = snapshot.docs.flatMap(extractTags);
        if (isMounted) {
          setSuggestions(uniqueTags(tags));
        }
      } catch (error) {
        try {
          const fallbackQuery = query(
            collection(db, 'logs'),
            where('childId', '==', childId),
            limit(100)
          );
          const snapshot = await getDocs(fallbackQuery);
          const tags = snapshot.docs.flatMap(extractTags);
          if (isMounted) {
            setSuggestions(uniqueTags(tags));
          }
        } catch (fallbackError) {
          console.error('Error fetching tag suggestions:', fallbackError);
          if (isMounted) {
            setSuggestions([]);
          }
        }
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [childId]);

  return suggestions;
};

export default useTagSuggestions;
