const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const buildPrompt = (question, entries) => {
    const lines = entries.map((entry) => {
      const tags = [
      entry.topics?.length ? `topics=${entry.topics.join(", ")}` : null,
      entry.medications?.length ? `meds=${entry.medications.join(", ")}` : null,
      entry.symptoms?.length ? `symptoms=${entry.symptoms.join(", ")}` : null,
      entry.behaviors?.length ? `behaviors=${entry.behaviors.join(", ")}` : null,
      entry.tags?.length ? `tags=${entry.tags.join(", ")}` : null
    ].filter(Boolean).join(" ");

    return `${entry.date} | ${entry.source} | ${entry.text}${tags ? ` | ${tags}` : ""}`;
  });

  return `You are a careful assistant. Answer the user's question using ONLY the entries provided.
If the answer is not in the entries, say you cannot find it.
Treat "medicine", "meds", and "drug(s)" as "medication".
Return valid JSON with:
  summary: string
  evidence: array of { date: string, snippet: string }

Question: ${question}

Entries:
${lines.join("\n")}
`;
};

const parseDateInput = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeQuestion = (question) => {
  return question.replace(/\b(medicine|meds|drug|drugs)\b/gi, "medication");
};

const TOPIC_QUERY_MAP = {
  food: "food",
  sleep: "sleep",
  medication: "medication",
  med: "medication",
  meds: "medication",
  medicine: "medication",
  behavior: "behavior",
  behaviour: "behavior",
  mood: "mood",
  health: "health",
  school: "school",
  therapy: "therapy",
  social: "social",
  routine: "routine"
};

const normalizeTopicQuery = (question) => {
  if (!question) return null;
  const normalized = question.trim().toLowerCase();
  return TOPIC_QUERY_MAP[normalized] || null;
};

const parseJsonFromText = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return { summary: text, evidence: [] };
  }
};

const askQuestion = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { childId, question, startDate, endDate, limit } = request.data || {};

    if (!childId || typeof childId !== "string") {
      throw new HttpsError("invalid-argument", "childId is required");
    }
    if (!question || typeof question !== "string") {
      throw new HttpsError("invalid-argument", "question is required");
    }

    const childDoc = await admin.firestore().collection("children").doc(childId).get();
    if (!childDoc.exists) {
      throw new HttpsError("not-found", "Child not found");
    }

    const members = childDoc.data().users?.members || [];
    if (!members.includes(request.auth.uid)) {
      throw new HttpsError("permission-denied", "User does not have access to this child");
    }

    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);

    const queryLimit = Number.isFinite(limit) ? Math.min(limit, 400) : 200;

    const snapshot = await admin
      .firestore()
      .collection("logs")
      .where("childId", "==", childId)
      .orderBy("createdAt", "desc")
      .limit(queryLimit)
      .get();

    const entries = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || null;
      const fallbackDate =
        data.timeStart?.toDate?.() ||
        data.timestamp?.toDate?.() ||
        (data.timeStart ? new Date(data.timeStart) : null) ||
        (data.timestamp ? new Date(data.timestamp) : null);
      const entryDate = createdAt || fallbackDate;
      if (!data.note || !entryDate) return;
      const now = new Date();
      const normalizedEntryDate = entryDate > now ? now : entryDate;
      if (start && normalizedEntryDate < start) return;
      if (end && normalizedEntryDate > end) return;
      const topics = Array.isArray(data.ai?.topics)
        ? data.ai.topics
        : Array.isArray(data.topics)
          ? data.topics
          : [];
      const medications = Array.isArray(data.ai?.medications)
        ? data.ai.medications
        : Array.isArray(data.medications)
          ? data.medications
          : [];
      const symptoms = Array.isArray(data.ai?.symptoms)
        ? data.ai.symptoms
        : Array.isArray(data.symptoms)
          ? data.symptoms
          : [];
      const behaviors = Array.isArray(data.ai?.behaviors)
        ? data.ai.behaviors
        : Array.isArray(data.behaviors)
          ? data.behaviors
          : [];
      const tags = Array.isArray(data.ai?.tags)
        ? data.ai.tags
        : Array.isArray(data.tags)
          ? data.tags
          : [];
      entries.push({
        date: entryDate.toISOString().slice(0, 10),
        source: data.source || "unknown",
        text: data.note,
        topics,
        medications,
        symptoms,
        behaviors,
        tags
      });
    });

    const normalizedQuestion = normalizeQuestion(question);
    const topicQuery = normalizeTopicQuery(normalizedQuestion);
    const scopedEntries = topicQuery
      ? entries.filter((entry) => {
          const topicsLower = entry.topics.map((topic) => String(topic).toLowerCase());
          const tagsLower = entry.tags.map((tag) => String(tag).toLowerCase());
          return (
            topicsLower.includes(topicQuery) ||
            tagsLower.includes(topicQuery)
          );
        })
      : entries;

    if (scopedEntries.length === 0) {
      return {
        summary: "No matching logs found in the selected time range.",
        evidence: []
      };
    }

    const prompt = buildPrompt(normalizedQuestion, scopedEntries);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY.value(),
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 800,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Anthropic request failed", { status: response.status, errorText });
      throw new HttpsError("internal", "LLM request failed");
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";
    const parsed = parseJsonFromText(text);

    return {
      summary: parsed.summary || text,
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : []
    };
  }
);

module.exports = {
  askQuestion
};
