import React, { useState, useEffect } from "react";
import { query, orderBy, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../../assets/css/CustomBigCalendar.css";
import CustomCalendar from "../UI/Calendar/CustomCalendar";

const JournalCalendar = ({ childId }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "children", childId, "journals"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const journalEvents = snapshot.docs.map((doc) => {
        const entry = doc.data();
        return {
          title: entry.title || "Journal Entry",
          start: new Date(entry.date.toDate()),
          end: new Date(entry.date.toDate()),
          allDay: true,
        };
      });
      setEvents(journalEvents);
    });

    return () => unsubscribe();
  }, [childId]);

  return (
    <div style={{ height: "500px", margin: "20px" }}>
      <CustomCalendar
        childId={childId}
        collectionName="journals"
        events={events}
        fetchFromFirestore={false} // No need to fetch in CustomCalendar since you are passing events here
        eventColor="#027a79"
      />
    </div>
  );
};

export default JournalCalendar;
