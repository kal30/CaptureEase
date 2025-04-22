import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase"; // Adjust path to your Firebase service
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../../assets/css/CustomBigCalendar.css"; // Custom styles for calendar
import "../../../assets/css/SensoryCalendar.css";
import CalendarToolbar from "./CalendarToolbar"; // Custom toolbar

const localizer = momentLocalizer(moment);

const CustomCalendar = ({
  childId, // Child ID to fetch data
  collectionName = "journals", // Collection to fetch data from
  titleGetter = (entry) => entry.title || "Entry", // Dynamic title getter
  eventColor, // Event color
  events: externalEvents, // Option to pass external events instead of fetching
  fetchFromFirestore = true, // Boolean to toggle Firestore fetching
  ...rest // Additional props
}) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!fetchFromFirestore) {
      setEvents(externalEvents);
      return;
    }

    const q = query(
      collection(db, "children", childId, collectionName),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const journalEvents = snapshot.docs.map((doc) => {
        const entry = doc.data();
        return {
          title: titleGetter(entry),
          start: new Date(entry.date.toDate()),
          end: new Date(entry.date.toDate()),
          allDay: true,
        };
      });
      setEvents(journalEvents);
    });

    return () => unsubscribe();
  }, [
    childId,
    collectionName,
    titleGetter,
    externalEvents,
    fetchFromFirestore,
  ]);

  // Conditionally apply a class based on collectionName
  const calendarClass =
    collectionName === "sensory_logs" ? "sensory-calendar" : "regular-calendar";

  const dayPropGetter = (date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return {
        style: {
          backgroundColor: "#f10187", // Highlight background color for today
          borderRadius: "8px",
          color: "white",
        },
      };
    }
    return {};
  };

  return (
    <div className={calendarClass} style={{ height: "500px", margin: "20px" }}>
      <Calendar
        localizer={localizer}
        events={events} // Use events fetched from Firestore or passed externally
        views={["month"]} // Ensure the day view is included
        defaultView="month"
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        components={{
          toolbar: CalendarToolbar, // Use custom toolbar
        }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: eventColor, // Customize event color dynamically
            borderRadius: "4px",
            color: "#fff",
            padding: "2px 5px",
          },
        })}
        dayPropGetter={dayPropGetter} // Add this line to highlight today
        {...rest} // Pass additional props such as onSelectEvent, onNavigate, etc.
      />
    </div>
  );
};

export default CustomCalendar;
