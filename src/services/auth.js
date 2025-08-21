// src/services/auth.js
import { auth, googleProvider } from "./firebase";
import { linkWithPopup, reauthenticateWithPopup } from "firebase/auth";

// Utility: check if a provider is already linked to the current user
export function isProviderLinked(providerId) {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData?.some((p) => p.providerId === providerId) || false;
}

export function getLinkedProviders() {
  const user = auth.currentUser;
  if (!user) return [];
  return user.providerData?.map((p) => p.providerId) || [];
}

export async function linkGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  if (isProviderLinked("google.com")) {
    return { status: "already-linked" };
  }

  try {
    await linkWithPopup(user, googleProvider);
    return { status: "linked" };
  } catch (e) {
    // If linking requires recent login, reauth with Google and retry
    if (e?.code === "auth/requires-recent-login") {
      await reauthenticateWithPopup(user, googleProvider);
      await linkWithPopup(user, googleProvider);
      return { status: "linked" };
    }
    // If already linked, surface that gracefully
    if (e?.code === "auth/credential-already-in-use") {
      return { status: "already-linked" };
    }
    throw e;
  }
}

export async function unlinkGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const googleInfo = user.providerData.find(
    (p) => p.providerId === "google.com"
  );
  if (!googleInfo) return { status: "not-linked" };
  await user.unlink("google.com");
  return { status: "unlinked" };
}
