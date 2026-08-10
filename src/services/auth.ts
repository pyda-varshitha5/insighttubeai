"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

/* ---------------- Google Login ---------------- */

export async function signInWithGoogle() {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let userCredential;

  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    return;
  }

  userCredential = await signInWithPopup(
    auth,
    googleProvider
  );

  const user = userCredential.user;

  // -----------------------------
  // Sync Google user to MongoDB
  // -----------------------------

  const displayName = user.displayName || "";

  const nameParts = displayName.trim().split(" ");

  const firstName =
    nameParts.shift() || "User";

  const lastName =
    nameParts.join(" ");
const idToken = await user.getIdToken();

const response = await fetch("/api/user/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  },
    body: JSON.stringify({
      uid: user.uid,
      firstName,
      lastName,
      email: user.email,
      photoURL: user.photoURL,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    console.error(
      "User sync failed:",
      data
    );
  } else {
    console.log(
      "Google user saved to MongoDB:",
      data.user
    );
  }

  return userCredential;
}

export async function handleRedirectResult() {
  return await getRedirectResult(auth);
}

/* ---------------- Register ---------------- */

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`.trim(),
  });

  console.log("User created:", user.uid);

  // Sync user to MongoDB
  const response = await fetch("/api/user/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: user.uid,
      firstName,
      lastName,
      email: user.email,
      photoURL: user.photoURL || "",
    }),
  });

  const data = await response.json();

  console.log("User sync status:", response.status);

  if (!response.ok || !data.success) {
    console.error("User sync failed:", data);
  } else {
    console.log("User saved to MongoDB:", data.user);
  }

  // Initialize progress
  const progressResponse = await fetch("/api/progress/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.uid,
    }),
  });

  console.log(
    "Progress API status:",
    progressResponse.status
  );

  return userCredential;
}

/* ---------------- Login ---------------- */

export async function loginUser(
  email: string,
  password: string
) {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

/* ---------------- Forgot Password ---------------- */

export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

/* ---------------- Logout ---------------- */

export async function logoutUser() {
  return await signOut(auth);
}