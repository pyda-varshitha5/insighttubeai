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

/* ---------------- Google Login ---------------- */

export async function signInWithGoogle() {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    return;
  }

  return await signInWithPopup(auth, googleProvider);
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

  await updateProfile(userCredential.user, {
    displayName: `${firstName} ${lastName}`.trim(),
  });

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