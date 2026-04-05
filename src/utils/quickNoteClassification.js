export { QUICK_TAG_CATEGORY_MAP } from '../constants/logTypeRegistry';

const CATEGORY_KEYWORDS = {
  milestone: [
    'win', 'milestone', 'progress', 'achievement', 'success', 'did it',
    'great job', 'proud', 'celebrate', 'therapy', 'session', 'goal',
    'improvement', 'better', 'great', 'amazing', 'successful', 'managed',
    'handled', 'learned',
  ],
  health: [
    'fever', 'doctor', 'sick', 'ill', 'medicine', 'medication', 'meds', 'dose',
    'clinic', 'pain', 'rash', 'cough', 'vomit', 'threw up', 'nausea', 'headache',
    'hospital', 'urgent care', 'appointment', 'therapy', 'therapist',
    'sensory', 'overload', 'overwhelmed', 'loud', 'lights', 'texture', 'textures',
    'crowd', 'crowds',
  ],
  food: [
    'ate', 'eating', 'food', 'meal', 'snack', 'lunch', 'dinner', 'breakfast',
    'refused food', 'hungry', 'drank', 'drink', 'juice', 'milk', 'water', 'bottle',
    'starbucks', 'refused', "wouldn't eat", "won't eat", "didn't eat", 'not eating',
    'rejected food',
  ],
  sleep: [
    'sleep', 'slept', 'nap', 'napped', 'woke', 'woke up', 'wake', 'bedtime',
    'rested', 'restless', 'tired', 'asleep', 'insomnia',
  ],
  mood: [
    'sad', 'happy', 'angry', 'mood', 'anxious', 'anxiety', 'calm', 'upset',
    'frustrated', 'worried', 'crying', 'cried', 'stressed', 'mad', 'furious',
    'overwhelmed', 'irritable', 'grumpy', 'emotional', 'withdrawn', 'clingy',
    'nervous', 'tense', 'moody',
  ],
  behavior: [
    'meltdown', 'tantrum', 'behavior', 'aggressive', 'aggression', 'hit', 'bit',
    'threw', 'screamed', 'eloped', 'refusal', 'kicked',
    'scratched', 'destroyed', 'screaming', 'yelling', 'pushing', 'running away',
  ],
};

const CATEGORY_PRIORITY = ['milestone', 'health', 'behavior', 'sleep', 'food', 'mood'];

export const classifyQuickNoteCategory = (inputText = '') => {
  const text = inputText.trim().toLowerCase();
  if (!text) {
    return 'log';
  }

  for (const category of CATEGORY_PRIORITY) {
    if (CATEGORY_KEYWORDS[category].some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return 'log';
};
