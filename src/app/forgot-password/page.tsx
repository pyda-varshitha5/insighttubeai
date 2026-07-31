"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { resetPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email);

      setMessage(
        "Password reset link sent successfully. Please check your email."
      );
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/invalid-email":
          setError("Invalid email address.");
          break;

        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center">
          Forgot Password
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-6">
          Enter your email to receive a password reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-400 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-violet-500 hover:bg-violet-600 text-white py-3 font-semibold"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-violet-500 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}