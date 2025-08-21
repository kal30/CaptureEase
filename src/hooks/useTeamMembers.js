import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

const useTeamMembers = (child) => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (child?.users) {
        const caregiverDocs = await Promise.all(
          (child.users.caregivers || []).map((id) =>
            getDoc(doc(db, "users", id))
          )
        );
        const therapistDocs = await Promise.all(
          (child.users.therapists || []).map((id) =>
            getDoc(doc(db, "users", id))
          )
        );
        const caregiversData = caregiverDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role: "caregiver",
        }));
        const therapistsData = therapistDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role: "therapist",
        }));
        setTeamMembers([...caregiversData, ...therapistsData]);
      }
    };
    fetchUsers();
  }, [child]);

  return teamMembers;
};

export default useTeamMembers;
