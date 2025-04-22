import React, { useState } from "react";
import "../../assets/css/SeverityRating.css"; // Custom CSS for styling the circles

const SeverityRating = ({ severity, setSeverity }) => {
  const handleRatingClick = (value) => {
    setSeverity(value);
  };

  return (
    <div className="severity-box">
      <label className="severity-label">Severity (1-5)</label>
      <div className="severity-rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <div
            key={value}
            className={`circle ${severity >= value ? "selected" : ""}`}
            onClick={() => handleRatingClick(value)}
          >
            {value}
          </div>
        ))}
      </div>
      <p className="helper-text">
        Click a number to rate the severity. 5 means the most severe.
      </p>
    </div>
  );
};

export default SeverityRating;
