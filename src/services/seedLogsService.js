import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

const templates = [
  {
    text: 'Had a calm morning and followed the usual routine.',
    tags: ['routine', 'calm', 'morning']
  },
  {
    text: 'Afternoon behavior challenges around transitions.',
    tags: ['behavior', 'transition', 'afternoon']
  },
  {
    text: 'Short nap and woke up cranky.',
    tags: ['sleep', 'nap', 'mood']
  },
  {
    text: 'Great appetite at lunch, tried new foods.',
    tags: ['food', 'lunch', 'positive']
  },
  {
    text: 'Evening went smoothly with bedtime routine.',
    tags: ['sleep', 'routine', 'evening']
  },
  {
    text: 'Therapy session was engaging and focused.',
    tags: ['therapy', 'progress', 'focus']
  }
];

const pickTemplate = (index) => templates[index % templates.length];

const createTimestamp = (baseDate, slot) => {
  const date = new Date(baseDate);
  const hours = slot === 0 ? 9 : slot === 1 ? 14 : 19;
  date.setHours(hours, Math.floor(Math.random() * 30), 0, 0);
  return Timestamp.fromDate(date);
};

export const seedLogsForChild = async ({
  childId,
  days = 14,
  perDay = 2
}) => {
  if (!childId) {
    throw new Error('Missing childId');
  }

  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to seed logs');
  }

  const now = new Date();
  const tasks = [];

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const day = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    for (let slot = 0; slot < perDay; slot += 1) {
      const template = pickTemplate(dayOffset + slot);
      const timestamp = createTimestamp(day, slot);
      const isImportant = Math.random() < 0.25;

      const payload = {
        childId,
        note: template.text,
        tags: template.tags,
        source: 'seed',
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUser.uid,
        meta: {
          noteType: isImportant ? 'important' : 'routine'
        }
      };

      tasks.push(addDoc(collection(db, 'logs'), payload));
    }
  }

  await Promise.all(tasks);
  return { created: tasks.length };
};
