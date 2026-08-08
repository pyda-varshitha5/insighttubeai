import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local"
  );
}

if (!clientEmail) {
  throw new Error(
    "Missing FIREBASE_CLIENT_EMAIL in .env.local"
  );
}

if (!privateKey) {
  throw new Error(
    "Missing FIREBASE_PRIVATE_KEY in .env.local"
  );
}

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminAuth = getAuth(firebaseAdminApp);