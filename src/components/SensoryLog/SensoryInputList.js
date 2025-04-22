import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReadonlySeverityRating from "../UI/ReadOnlyRating";
import "../../assets/css/Sensory.css"; // Import the CSS file

const SensoryInputList = ({ entries, handleEdit, handleDelete }) => {
  return (
    <div className="sensory-list-container">
      {entries.length > 0 ? (
        <>
          <Typography variant="h6" className="sensory-list-title">
            Previous Entries
          </Typography>
          <List>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                alignItems="flex-start"
                className="sensory-list-item"
                style={{
                  backgroundColor: "#ffe0e0",
                  padding: "20px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" className="sensory-list-title">
                      Date:{" "}
                      {new Date(entry.timestamp?.toDate()).toLocaleString()}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Sensory Inputs:</strong>{" "}
                        {Array.isArray(entry.sensoryInputs)
                          ? entry.sensoryInputs.join(", ")
                          : "No inputs recorded"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Reaction:</strong> {entry.reaction || "N/A"}
                      </Typography>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="body2"
                          style={{ marginRight: "8px" }}
                        >
                          <strong>Severity:</strong>
                        </Typography>
                        <ReadonlySeverityRating
                          severity={entry.severity}
                          color="#ff6f61"
                          size={10}
                        />
                      </div>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Duration:</strong> {entry.duration || "N/A"}{" "}
                        minutes
                      </Typography>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Trigger Context:</strong>{" "}
                        {entry.triggerContext || "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Coping Strategy:</strong>{" "}
                        {entry.copingStrategy || "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Caregiver Intervention:</strong>{" "}
                        {entry.caregiverIntervention || "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="sensory-list-typography"
                      >
                        <strong>Notes:</strong> {entry.notes || "N/A"}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  edge="end"
                  aria-label="edit"
                  className="sensory-list-icon"
                  onClick={() => handleEdit(entry.id)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  className="sensory-list-icon sensory-list-delete-icon"
                  onClick={() => handleDelete(entry.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Typography
          variant="body2"
          color="textSecondary"
          className="no-entries-message"
        >
          No sensory logs recorded yet.
        </Typography>
      )}
    </div>
  );
};

export default SensoryInputList;
