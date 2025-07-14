const RXNORM_API_BASE_URL = "https://rxnav.nlm.nih.gov/REST";

export const searchMedications = async (term) => {
  try {
    const response = await fetch(
      `${RXNORM_API_BASE_URL}/spellingsuggestions.json?maxEntries=10&name=${term}`
    );
    const data = await response.json();
    if (data.suggestionGroup && data.suggestionGroup.suggestionList) {
      return data.suggestionGroup.suggestionList.suggestion;
    }
    return [];
  } catch (error) {
    console.error("Error searching medications:", error);
    return [];
  }
};
