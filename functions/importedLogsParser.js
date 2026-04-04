const IMPORT_SYSTEM_PROMPT = "You are a data parser. Extract caregiver log entries from the text provided. Return ONLY a valid JSON array. Each object must have: date (ISO string or null), note (string), category (one of: behavior, health, milestone, mood, daily, other), importance (normal or important), childName (string or null). Do not include any explanation or markdown.";

const sanitizeClaudeJson = (value) => {
  const trimmed = String(value || "").trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const startIndex = withoutFence.indexOf("[");
  const endIndex = withoutFence.lastIndexOf("]");

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return withoutFence;
  }

  return withoutFence.slice(startIndex, endIndex + 1);
};

const normalizeImportedCategory = (category) => {
  const allowedCategories = new Set(["behavior", "health", "milestone", "mood", "daily", "other"]);
  if (allowedCategories.has(category)) {
    return category;
  }
  if (category === "log") return "daily";
  return "other";
};

const parseImportedLogsCore = async ({
  text,
  fetchImpl = global.fetch,
  apiKey,
  logger,
}) => {
  if (typeof text !== "string" || !text.trim()) {
    return { error: "No file text was provided." };
  }

  if (typeof fetchImpl !== "function") {
    return { error: "Fetch is not available in this environment." };
  }

  const anthropicResponse = await fetchImpl("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0,
      system: IMPORT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    logger?.error?.("Anthropic request failed", {
      status: anthropicResponse.status,
      errorText,
    });
    return { error: "We couldn't read that file. Try a simpler format." };
  }

  const responseBody = await anthropicResponse.json();
  const responseText = Array.isArray(responseBody?.content)
    ? responseBody.content
        .filter((item) => item?.type === "text" && typeof item.text === "string")
        .map((item) => item.text)
        .join("\n")
    : "";

  const jsonText = sanitizeClaudeJson(responseText);

  let parsedEntries;
  try {
    parsedEntries = JSON.parse(jsonText);
  } catch (parseError) {
    logger?.error?.("Invalid JSON returned from Anthropic", {
      jsonText,
      parseError: parseError.message,
    });
    return { error: "We couldn't read that file. Try a simpler format." };
  }

  if (!Array.isArray(parsedEntries)) {
    return { error: "We couldn't read that file. Try a simpler format." };
  }

  if (parsedEntries.length > 200) {
    return { error: "That file contains more than 200 log entries. Please split it into smaller files." };
  }

  const entries = parsedEntries.map((entry) => ({
    date: entry?.date && typeof entry.date === "string" ? entry.date : null,
    note: typeof entry?.note === "string" ? entry.note.trim() : "",
    category: normalizeImportedCategory(entry?.category),
    importance: entry?.importance === "important" ? "important" : "normal",
    childName: typeof entry?.childName === "string" && entry.childName.trim() ? entry.childName.trim() : null,
  })).filter((entry) => entry.note);

  return { entries };
};

module.exports = {
  IMPORT_SYSTEM_PROMPT,
  sanitizeClaudeJson,
  normalizeImportedCategory,
  parseImportedLogsCore,
};
