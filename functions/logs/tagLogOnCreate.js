const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const buildPrompt = (text) => {
  return `Extract structured tags from the log entry below using these rules.

Allowed topics (use only these): food, sleep, medication, behavior, mood, health, school, therapy, social, routine, other

Rules:
- Eating/meal/food words -> food (do NOT tag behavior just because someone ate).
- Aggression/tantrum/meltdown -> behavior.
- Medication names, medicine/meds/drug/pill words, or dose changes -> medication.
- Symptoms only if explicitly mentioned (fever, headache, nausea, pain, rash).
- Sleep words (slept, woke, bedtime, nap) -> sleep.
- Mood words (happy, sad, anxious, calm, frustrated) -> mood.
- School words (school, teacher, class, homework) -> school.
- Therapy words (therapy, OT, PT, speech) -> therapy.
- If nothing fits, use other.
- Multiple topics are allowed when clearly present.

Return valid JSON with:
  topics: array of strings (only from the allowed list)
  medications: array of strings (medication names only)
  symptoms: array of strings
  behaviors: array of strings
  tags: array of short keywords/phrases directly from the log text (free-form)

Tags guidance:
- Use exact words/phrases from the log (lowercase is fine).
- Include medication names, symptoms, foods/drinks, and medical specialties/providers when present.
- Prefer 1-3 word phrases, avoid full sentences.

Log:
${text}`;
};

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

const SHORT_ALLOWED_TAGS = new Set(["mg", "mcg", "ml", "oz"]);
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has",
  "have", "he", "her", "his", "i", "in", "is", "it", "its", "me", "my", "no",
  "not", "of", "on", "or", "our", "she", "so", "that", "the", "their", "them",
  "there", "they", "this", "to", "too", "was", "we", "were", "with", "you",
  "your"
]);

const TOPIC_KEYWORDS = {
  food: [
    "meal", "meals", "breakfast", "lunch", "dinner", "snack", "snacks", "bottle",
    "fed", "feeding", "ate", "eating", "appetite", "dairy", "formula"
  ],
  sleep: ["sleep", "slept", "nap", "napped", "bedtime", "wake", "woke", "asleep"],
  medication: ["med", "meds", "medicine", "medication", "pill", "pills", "dose", "dosage", "refill", "mg", "mcg", "ml"],
  behavior: ["tantrum", "meltdown", "aggressive", "aggression", "hitting", "biting", "kicking", "yelling", "screaming"],
  mood: ["happy", "sad", "anxious", "calm", "frustrated", "angry", "upset"],
  health: ["fever", "pain", "rash", "nausea", "headache", "stomach", "cough", "cold", "sick", "illness", "vomit"],
  school: ["school", "teacher", "class", "homework", "classroom", "recess"],
  therapy: ["therapy", "ot", "pt", "speech", "occupational", "physical"],
  social: ["friend", "friends", "playdate", "peer", "social", "party"],
  routine: ["routine", "bath", "brush", "brushing", "teeth", "diaper", "potty"]
};

const extractKeywords = (text) => {
  if (!text) return [];
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  const keywords = new Set();
  tokens.forEach((token) => {
    if (STOPWORDS.has(token)) return;
    if (token.length >= 3 || SHORT_ALLOWED_TAGS.has(token) || /\d/.test(token)) {
      keywords.add(token);
    }
  });
  return Array.from(keywords);
};

const inferTopicsFromTags = (tags) => {
  const inferred = new Set();
  tags.forEach((tag) => {
    Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => tag === keyword || tag.startsWith(keyword))) {
        inferred.add(topic);
      }
    });
  });
  return Array.from(inferred);
};

const tagLogOnCreate = onDocumentCreated(
  {
    document: "logs/{logId}",
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const log = snapshot.data();
    if (!log?.note || typeof log.note !== "string") return;

    const prompt = buildPrompt(log.note);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY.value(),
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 400,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Tagging request failed", { status: response.status, errorText });
      return;
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";
    const parsed = parseJson(text);

    if (!parsed) {
      logger.warn("Failed to parse tagging JSON", { logId: event.params.logId });
      return;
    }

    const allowedTopics = new Set([
      "food",
      "sleep",
      "medication",
      "behavior",
      "mood",
      "health",
      "school",
      "therapy",
      "social",
      "routine",
      "other"
    ]);

    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.filter((topic) => allowedTopics.has(String(topic).toLowerCase()))
      : [];
    const medications = Array.isArray(parsed.medications) ? parsed.medications : [];
    const modelTags = Array.isArray(parsed.tags) ? parsed.tags : [];
    const extractedTags = extractKeywords(log.note);
    const normalizedTags = Array.from(
      new Set(
        [...modelTags, ...extractedTags]
          .map((tag) => String(tag).trim().toLowerCase())
          .filter((tag) => tag.length > 0)
      )
    ).slice(0, 25);
    const normalizedTopics = topics.map((topic) =>
      String(topic).toLowerCase() === "medicine" ? "medication" : topic
    );
    const inferredTopics = inferTopicsFromTags(normalizedTags);
    const mergedTopics = Array.from(new Set([...normalizedTopics, ...inferredTopics]));
    if (medications.length > 0 && !mergedTopics.includes("medication")) {
      mergedTopics.push("medication");
    }

    const update = {
      ai: {
        topics: mergedTopics,
        medications,
        symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
        behaviors: Array.isArray(parsed.behaviors) ? parsed.behaviors : [],
        tags: normalizedTags,
        taggedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    await snapshot.ref.set(update, { merge: true });
  }
);

module.exports = {
  tagLogOnCreate
};
