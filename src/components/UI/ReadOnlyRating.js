// src/components/ReadonlySeverityRating.js

import React from "react";

const ReadOnlyRating = ({ severity, color = "#ff6f61", size = 10 }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <div
          key={value}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: severity >= value ? color : "#e0e0e0",
            borderRadius: "50%",
          }}
        ></div>
      ))}
    </div>
  );
};

export default ReadOnlyRating;
