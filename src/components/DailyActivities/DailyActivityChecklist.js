import React from "react";

export function DailyChecklist({ activities, logs, onToggle, date }) {
  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Today's Activities</h2>
      {activities.map((act) => {
        const log = logs.find(
          (l) => l.activityId === act.id && l.date === date
        );
        const done = log?.completed ?? false;
        return (
          <div
            key={act.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              marginBottom: 8,
              border: "1px solid #ddd",
              borderRadius: 6,
            }}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={() => onToggle(act.id, date)}
            />
            <span style={{ marginLeft: 12 }}>{act.name}</span>
          </div>
        );
      })}
    </div>
  );
}
