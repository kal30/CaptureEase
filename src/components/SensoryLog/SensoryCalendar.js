import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import AddSensoryLogModal from "./AddSensoryLogModal"; // Adjust import if necessary

const localizer = momentLocalizer(moment);

const SensoryCalendar = ({ childId }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start); // Use the start of the selected slot
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null); // Reset the date after closing
  };

  return (
    <div style={{ height: "500px", margin: "20px" }}>
      <Calendar
        localizer={localizer}
        events={[] /* Your events data here */}
        selectable
        onSelectSlot={handleSelectSlot} // Trigger this on selecting a date
      />
      <AddSensoryLogModal
        open={isModalOpen}
        onClose={handleCloseModal}
        childId={childId}
        selectedDate={selectedDate} // Pass the selected date to the modal
        onLogAdded={() => {
          // Refresh the calendar or logs here if necessary
        }}
      />
    </div>
  );
};

export default SensoryCalendar;
