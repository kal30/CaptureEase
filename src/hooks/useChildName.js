import { useState, useEffect } from "react";
import { fetchChildName } from "../services/childService"; // Import the service to fetch child name

const useChildName = (childId) => {
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getChildName = async () => {
      try {
        setLoading(true);
        const name = await fetchChildName(childId);
        setChildName(name);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (childId) {
      getChildName();
    }
  }, [childId]);

  return { childName, loading, error }; // Return childName, loading state, and error
};

export default useChildName;
