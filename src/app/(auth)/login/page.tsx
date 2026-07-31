"use client";

import { useState } from "react";
import LoginCard from "@/components/landing/LoginCard";
import SignupCard from "@/components/landing/SignupCard";

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      {showSignup ? (
        <SignupCard onLogin={() => setShowSignup(false)} />
      ) : (
        <LoginCard onSignup={() => setShowSignup(true)} />
      )}
    </main>
  );
}