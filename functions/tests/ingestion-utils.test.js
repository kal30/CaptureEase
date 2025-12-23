const assert = require("node:assert/strict");
const {
  parseChildSegments,
  parseImplicitChildFromTokens
} = require("../ingestion/utils");

const run = (name, fn) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
};

run("parseChildSegments supports colon and multi-child", () => {
  const result = parseChildSegments("Arjun: had lunch; Maya: took a nap");
  assert.equal(result.length, 2);
  assert.deepStrictEqual(result[0], { childToken: "Arjun", text: "had lunch" });
  assert.deepStrictEqual(result[1], { childToken: "Maya", text: "took a nap" });
});

run("parseChildSegments supports full-width punctuation", () => {
  const result = parseChildSegments("Arjun： great day； Maya： nap");
  assert.equal(result.length, 2);
  assert.deepStrictEqual(result[0], { childToken: "Arjun", text: "great day" });
  assert.deepStrictEqual(result[1], { childToken: "Maya", text: "nap" });
});

run("parseChildSegments returns empty when missing colon", () => {
  const result = parseChildSegments("Arjun had lunch");
  assert.equal(result.length, 0);
});

run("parseImplicitChildFromTokens matches name without colon", () => {
  const result = parseImplicitChildFromTokens("Arjun testing", ["Arjun Ram", "Arjun", "arj"]);
  assert.deepStrictEqual(result, { childToken: "Arjun", text: "testing" });
});

run("parseImplicitChildFromTokens handles alias with dash", () => {
  const result = parseImplicitChildFromTokens("arj- took nap", ["arj"]);
  assert.deepStrictEqual(result, { childToken: "arj", text: "took nap" });
});

run("parseImplicitChildFromTokens avoids partial matches", () => {
  const result = parseImplicitChildFromTokens("Annabelle slept", ["Ann"]);
  assert.equal(result, null);
});
