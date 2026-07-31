import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF1D8iIziPR_5V2FOvTlZmDtHQC2I3FOE",
  authDomain: "insighttubeai-76591.firebaseapp.com",
  projectId: "insighttubeai-76591",
  storageBucket: "insighttubeai-76591.firebasestorage.app",
  messagingSenderId: "998077149418",
  appId: "1:998077149418:web:6c4f881b4def0d170ea793",
  measurementId: "G-M1C53VCX4J",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;