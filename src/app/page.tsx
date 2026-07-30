"use client";

import { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import LoginCard from "@/components/landing/LoginCard";
import SignupCard from "@/components/landing/SignupCard";

export default function LandingPage() {
  const [page, setPage] = useState<"login" | "signup">("login");

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <HeroSection />

      <div className="flex items-center justify-center bg-white px-6 py-16">
        {page === "login" ? (
          <LoginCard onSignup={() => setPage("signup")} />
        ) : (
          <SignupCard onLogin={() => setPage("login")} />
        )}
      </div>
    </main>
  );
}