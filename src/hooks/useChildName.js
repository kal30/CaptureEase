import { useState, useEffect, useRef } from "react";
import { fetchChildName } from "../services/childService"; // Import the service to fetch child name

const useChildName = (childId) => {
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastLoadedChildId = useRef(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setLoading(false);
      return;
    }

    if (!childId) {
      lastLoadedChildId.current = null;
      setChildName((current) => (current ? "" : current));
      setError((current) => (current ? null : current));
      setLoading(false);
      return;
    }

    if (lastLoadedChildId.current === childId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const getChildName = async () => {
      try {
        setLoading(true);
        setError(null);
        const name = await fetchChildName(childId);
        if (cancelled) return;

        lastLoadedChildId.current = childId;
        setChildName((current) => (current === name ? current : name));
        setLoading(false);
      } catch (error) {
        if (cancelled) return;

        setError((current) => (current === error ? current : error));
        setLoading(false);
      }
    };

    getChildName();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  return { childName, loading, error }; // Return childName, loading state, and error
};

export default useChildName;
