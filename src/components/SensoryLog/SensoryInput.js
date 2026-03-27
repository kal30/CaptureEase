import React, { useState } from "react";

const SensoryInput = () => {
  const [inputText, setInputText] = useState("");
  const [sensoryInput, setSensoryInput] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState(0);
  const [duration, setDuration] = useState("");
  const [copingStrategy, setCopingStrategy] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: implement sensory analysis
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
