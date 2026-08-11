"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  loginUser,
  signInWithGoogle,
} from "@/services/auth";

type LoginTab = "user" | "admin";

interface LoginCardProps {
  onSignup: () => void;
}

export default function LoginCard({ onSignup }: LoginCardProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<LoginTab>("user");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // EMAIL + PASSWORD LOGIN
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // FIREBASE EMAIL/PASSWORD LOGIN
      // --------------------------------------------------------

      const userCredential = await loginUser(
        cleanEmail,
        password
      );

      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        throw new Error("Firebase login failed.");
      }

      // --------------------------------------------------------
      // ADMIN LOGIN
      // --------------------------------------------------------

      if (activeTab === "admin") {
        console.log(
          "Checking admin access:",
          firebaseUser.email
        );

        // Get a fresh Firebase ID token
        const idToken = await firebaseUser.getIdToken(true);

        if (!idToken) {
          throw new Error("Unable to get Firebase authentication token.");
        }

        // ------------------------------------------------------
        // VERIFY ADMIN ON SERVER
        // ------------------------------------------------------

        const response = await fetch("/api/admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: firebaseUser.email,
          }),
          cache: "no-store",
        });

        let result: any = null;

        try {
          result = await response.json();
        } catch {
          result = null;
        }

        console.log("Admin verification:", result);

        // ------------------------------------------------------
        // ADMIN NOT AUTHORIZED
        // ------------------------------------------------------

        const isAdmin =
          response.ok &&
          (
            result?.authorized === true ||
            result?.success === true ||
            result?.isAdmin === true ||
            result?.admin === true
          );

        if (!isAdmin) {
          setError(
            result?.error ||
              "You are not authorized to access the admin panel."
          );

          return;
        }

        // ------------------------------------------------------
        // ADMIN VERIFIED
        // ------------------------------------------------------

        console.log(
          "ADMIN VERIFIED:",
          firebaseUser.email
        );

        // Save the Firebase token temporarily so the
        // admin dashboard can authenticate its API requests.
        localStorage.setItem(
          "adminIdToken",
          idToken
        );

        // Save admin email for client-side dashboard use.
        localStorage.setItem(
          "adminEmail",
          firebaseUser.email || cleanEmail
        );

        // Save admin status.
        localStorage.setItem(
          "isAdmin",
          "true"
        );

        // Remove old login errors/intents.
        localStorage.removeItem("adminLoginError");
        localStorage.removeItem("adminLoginIntent");

        // ------------------------------------------------------
        // DIRECT ADMIN DASHBOARD REDIRECT
        // ------------------------------------------------------

        router.replace("/admin/dashboard");

        return;
      }

      // ========================================================
      // NORMAL USER LOGIN
      // ========================================================

      localStorage.removeItem("adminIdToken");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminLoginIntent");
      localStorage.removeItem("adminLoginError");

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);

      let message = "Login failed. Please try again.";

      switch (err?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          message = "Incorrect email or password.";
          break;

        case "auth/user-not-found":
          message = "No account found with this email.";
          break;

        case "auth/invalid-email":
          message = "Invalid email address.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many login attempts. Please try again later.";
          break;

        case "auth/user-disabled":
          message = "This account has been disabled.";
          break;

        default:
          message =
            err?.message ||
            "Login failed. Please try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      console.log(
        "Google login started:",
        activeTab
      );

      // --------------------------------------------------------
      // IMPORTANT:
      // signInWithGoogle() must return Firebase UserCredential.
      // --------------------------------------------------------

      const userCredential = await signInWithGoogle();

      const firebaseUser = userCredential?.user;

      if (!firebaseUser) {
        throw new Error(
          "Google authentication did not return a Firebase user."
        );
      }

      console.log(
        "Google authenticated:",
        firebaseUser.email
      );

      // --------------------------------------------------------
      // ADMIN GOOGLE LOGIN
      // --------------------------------------------------------

      if (activeTab === "admin") {
        const idToken = await firebaseUser.getIdToken(true);

        if (!idToken) {
          throw new Error(
            "Unable to get Firebase authentication token."
          );
        }

        // ------------------------------------------------------
        // VERIFY GOOGLE ACCOUNT IS AN AUTHORIZED ADMIN
        // ------------------------------------------------------

        const response = await fetch("/api/admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: firebaseUser.email,
          }),
          cache: "no-store",
        });

        let result: any = null;

        try {
          result = await response.json();
        } catch {
          result = null;
        }

        console.log(
          "Google admin verification:",
          result
        );

        const isAdmin =
          response.ok &&
          (
            result?.authorized === true ||
            result?.success === true ||
            result?.isAdmin === true ||
            result?.admin === true
          );

        if (!isAdmin) {
          // User authenticated successfully,
          // but is NOT an authorized admin.
          setError(
            result?.error ||
              "This Google account is not authorized for admin access."
          );

          // Do not leave stale admin information.
          localStorage.removeItem("adminIdToken");
          localStorage.removeItem("adminEmail");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("adminLoginIntent");

          return;
        }

        // ------------------------------------------------------
        // GOOGLE ADMIN VERIFIED
        // ------------------------------------------------------

        console.log(
          "GOOGLE ADMIN VERIFIED:",
          firebaseUser.email
        );

        localStorage.setItem(
          "adminIdToken",
          idToken
        );

        localStorage.setItem(
          "adminEmail",
          firebaseUser.email || ""
        );

        localStorage.setItem(
          "isAdmin",
          "true"
        );

        localStorage.removeItem("adminLoginError");
        localStorage.removeItem("adminLoginIntent");

        // ------------------------------------------------------
        // DIRECT REDIRECT — NO REFRESH REQUIRED
        // ------------------------------------------------------

        router.replace("/admin/dashboard");

        return;
      }

      // ========================================================
      // NORMAL GOOGLE USER
      // ========================================================

      localStorage.removeItem("adminIdToken");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminLoginIntent");
      localStorage.removeItem("adminLoginError");

      router.replace("/dashboard");
    } catch (err: any) {
      console.error(
        "Google login error:",
        err
      );

      if (
        err?.code ===
        "auth/cancelled-popup-request"
      ) {
        return;
      }

      if (
        err?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError("Google login was cancelled.");
        return;
      }

      setError(
        err?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-violet-100 p-8 sm:p-10">

          {/* HEADER */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome Back!
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Login to continue your learning journey
            </p>
          </div>

          {/* LOGIN TABS */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">

            {/* USER */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("user");
                setError("");
              }}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "user"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <User size={16} />
              User Login
            </button>

            {/* ADMIN */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setError("");
              }}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "admin"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <ShieldCheck size={16} />
              Admin Login
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-center text-sm font-medium text-red-600">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />

            {loading
              ? "Signing in..."
              : "Continue with Google"}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs text-slate-400">
              or
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* EMAIL/PASSWORD FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-violet-500 hover:text-violet-600"
              >
                Forgot Password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-600 transition-colors text-white text-sm font-semibold shadow-sm shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : activeTab === "admin"
                ? "Admin Login"
                : "Login"}
            </button>
          </form>

          {/* SIGNUP */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}

            <button
              type="button"
              onClick={onSignup}
              disabled={loading}
              className="text-violet-500 font-medium hover:text-violet-600"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GOOGLE ICON
// ============================================================

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />

      <path
        fill="#FF3D00"
        d="M6.3 14.7l5.9 4.3C13.7 15.4 18.5 12.4 24 12.4c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34.5 6.2 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />

      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 13.9-5.5l-6.4-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.6-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />

      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.7l6.4 5.4C39.7 36.6 44 30.9 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}