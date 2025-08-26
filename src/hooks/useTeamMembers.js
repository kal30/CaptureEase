import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

const useTeamMembers = (child) => {
  const [teamMembers, setTeamMembers] = useState([]);
  
  console.log('useTeamMembers hook called with child:', child?.name, child?.id);

  useEffect(() => {
    const fetchUsers = async () => {
      if (child?.users) {
        console.log('useTeamMembers - child.users:', child.users);
        
        const caregiverIds = child.users.caregivers || [];
        const therapistIds = child.users.therapists || [];
        
        console.log('useTeamMembers - caregiver IDs:', caregiverIds);
        console.log('useTeamMembers - therapist IDs:', therapistIds);
        
        if (caregiverIds.length === 0 && therapistIds.length === 0) {
          console.log('useTeamMembers - No team members, setting empty array');
          setTeamMembers([]);
          return;
        }
        
        const caregiverDocs = await Promise.all(
          caregiverIds.map((id) => getDoc(doc(db, "users", id)))
        );
        const therapistDocs = await Promise.all(
          therapistIds.map((id) => getDoc(doc(db, "users", id)))
        );
        
        const caregiversData = caregiverDocs
          .filter(doc => doc.exists())
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            role: "caregiver",
          }));
        const therapistsData = therapistDocs
          .filter(doc => doc.exists())
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            role: "therapist",
          }));
          
        const allMembers = [...caregiversData, ...therapistsData];
        console.log('useTeamMembers - final team members:', allMembers);
        setTeamMembers(allMembers);
      }
    };
    fetchUsers();
  }, [child]);

  return teamMembers;
};

export default useTeamMembers;
