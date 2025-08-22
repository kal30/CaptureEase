// src/components/AuthProviders/LinkGoogleButton.js
import React, { useEffect, useState } from "react";
import { Button, Alert, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { linkGoogle, isProviderLinked } from "../../services/auth";

export default function LinkGoogleButton() {
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLinked(!!user && isProviderLinked("google.com"));
    });
    return () => unsub();
  }, []);

  const handleLink = async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await linkGoogle();
      if (res.status === "linked") {
        setLinked(true);
        setMsg("Google account linked successfully.");
      } else if (res.status === "already-linked") {
        setLinked(true);
        setMsg("Google is already linked.");
      }
    } catch (e) {
      setErr("Unable to link Google right now. Please try again.");
      // console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) return null; // Only show when signed in

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {msg && <Alert severity="success">{msg}</Alert>}
      {err && <Alert severity="error">{err}</Alert>}
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleLink}
        disabled={loading || linked}
        aria-label={linked ? "Google linked" : "Link Google account"}
        sx={{
          backgroundColor: linked ? "#4caf50" : "white",
          color: linked ? "white" : "#757575",
          border: "1px solid #dadce0",
          padding: "10px 20px",
          textTransform: "none",
          fontSize: "14px",
          fontWeight: 500,
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          alignSelf: "flex-start",
          "&:hover": { 
            backgroundColor: linked ? "#45a049" : "#f8f9fa",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            border: linked ? "1px solid #45a049" : "1px solid #c6c6c6"
          },
          "&:disabled": {
            backgroundColor: linked ? "#4caf50" : "#f5f5f5",
            color: linked ? "white" : "#9e9e9e",
            border: "1px solid #e0e0e0"
          }
        }}
      >
        {linked ? "Google linked" : loading ? "Linking…" : "Link Google"}
      </Button>
    </Box>
  );
}
