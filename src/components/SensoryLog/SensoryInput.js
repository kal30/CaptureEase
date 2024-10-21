import React, { useState } from "react";
import { analyzeTextWithHuggingFace } from "../../services/openaiService"; // Import GPT-4 service

const SensoryInput = () => {
  const [inputText, setInputText] = useState("");
  const [sensoryInput, setSensoryInput] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState(0);
  const [duration, setDuration] = useState("");
  const [copingStrategy, setCopingStrategy] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Submitting with input:", inputText);

    try {
      const result = await analyzeTextWithHuggingFace(inputText); // Call the API
      console.log("API Response: ", result);

      // Check if the response contains generated text
      if (result && result.generated_text) {
        try {
          const jsonResponse = JSON.parse(result.generated_text);
          console.log("Parsed JSON: ", jsonResponse);

          // Extract and use the fields
          const { sensoryInput, reaction, severity, duration, copingStrategy } =
            jsonResponse;
          console.log({
            sensoryInput,
            reaction,
            severity,
            duration,
            copingStrategy,
          });
        } catch (error) {
          console.error("Failed to parse JSON: ", error);

          // Fallback to manual parsing if JSON parsing fails
          const sensoryInput = result.generated_text.match(
            /Sensory Input:\s*(.*)/
          )?.[1];
          const reaction = result.generated_text.match(/Reaction:\s*(.*)/)?.[1];
          const severity =
            result.generated_text.match(/Severity:\s*(\d+)/)?.[1];
          const duration =
            result.generated_text.match(/Duration:\s*(\d+)/)?.[1];
          const copingStrategy = result.generated_text.match(
            /Coping Strategy:\s*(.*)/
          )?.[1];

          console.log({
            sensoryInput,
            reaction,
            severity,
            duration,
            copingStrategy,
          });
        }
      } else {
        console.error(
          "Unexpected result: No generated_text field in response."
        );
      }
    } catch (error) {
      console.error("Error analyzing text: ", error);

      // Handle rate limiting (429) or server unavailable (503) errors
      //   if (error.response?.status === 429 || error.response?.status === 503) {
      //     retryWithDelay(5000); // Retry after 5 seconds if rate limited or server is unavailable
      //   }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Describe the situation (type or speak):</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows="4"
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <button type="submit">Analyze</button>

      {/* Auto-filled fields based on GPT-4 analysis */}
      <div>
        <label>Sensory Input:</label>
        <input type="text" value={sensoryInput} readOnly />
      </div>
      <div>
        <label>Reaction:</label>
        <input type="text" value={reaction} readOnly />
      </div>
      <div>
        <label>Severity (1-5):</label>
        <input type="number" value={severity} readOnly />
      </div>
      <div>
        <label>Duration (minutes):</label>
        <input type="text" value={duration} readOnly />
      </div>
      <div>
        <label>Coping Strategy:</label>
        <input type="text" value={copingStrategy} readOnly />
      </div>
    </form>
  );
};

export default SensoryInput;
