import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const askQuestionCallable = httpsCallable(functions, "askQuestion");

export const askQuestion = async ({ childId, question, startDate, endDate }) => {
  const result = await askQuestionCallable({
    childId,
    question,
    startDate,
    endDate
  });
  return result.data;
};
