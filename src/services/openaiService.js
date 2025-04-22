import axios from "axios";

export const analyzeTextWithHuggingFace = async (inputText) => {
  const HUGGING_FACE_API_KEY =
    process.env.REACT_APP_HUGGING_FACE_API_KEY ||
    "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";

  if (!HUGGING_FACE_API_KEY) {
    console.error("API Key is missing!");
    return;
  }

  const prompt = `
  Please analyze the following input and return only a valid JSON object in this format:

  {
    "sensoryInput": "",
    "reaction": "",
    "severity": "",
    "duration": "",
    "copingStrategy": ""
  }

  The text to analyze: "${inputText}"
  Only return the JSON object, nothing else.
`;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2", // Use the correct model name
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response: ", response.data);
    return response.data; // Return the structured response
  } catch (error) {
    console.error(
      "Error calling Hugging Face API: ",
      error.response?.data || error.message
    );
    throw error;
  }
};
