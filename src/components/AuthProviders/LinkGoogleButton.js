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
        variant={linked ? "outlined" : "contained"}
        color={linked ? "inherit" : "primary"}
        startIcon={<GoogleIcon />}
        onClick={handleLink}
        disabled={loading || linked}
        aria-label={linked ? "Google linked" : "Link Google account"}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        {linked ? "Google linked" : loading ? "Linking…" : "Link Google"}
      </Button>
    </Box>
  );
}
