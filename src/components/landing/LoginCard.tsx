"use client";
import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  signInWithGoogle,
} from "@/services/auth";
import Link from "next/link";

type LoginTab = "user" | "admin";
interface LoginCardProps {
  onSignup: () => void;
}


export default function LoginCard({
  onSignup,
}: LoginCardProps) {
  const [activeTab, setActiveTab] = useState<LoginTab>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
const [adminLoginError, setAdminLoginError] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("adminError") === "unauthorized") {
    setActiveTab("admin");
    setError("You are not authorized to access the admin panel.");

    window.history.replaceState({}, "", "/login");
  }
}, []);
useEffect(() => {
  const message = localStorage.getItem("adminLoginError");

  if (message) {
    setAdminLoginError(message);
    setActiveTab("admin");
    localStorage.removeItem("adminLoginError");
  }
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");
  setAdminLoginError("");

  if (!email.trim()) {
    setError("Email is required.");
    return;
  }

  if (!password) {
    setError("Password is required.");
    return;
  }

  try {
    setLoading(true);

    // ==================================================
    // FIREBASE LOGIN
    // ==================================================

    const userCredential = await loginUser(
      email.trim(),
      password
    );

    const firebaseUser = userCredential.user;

    // ==================================================
    // ADMIN LOGIN
    // ==================================================

    if (activeTab === "admin") {
      console.log(
        "Checking admin access for:",
        firebaseUser.email
      );

      // Get fresh Firebase ID token
      const idToken = await firebaseUser.getIdToken(true);

      // Verify admin on server
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      console.log("Admin check:", data);

      // ------------------------------------------------
      // NOT ADMIN
      // ------------------------------------------------

      if (
  !response.ok ||
  !(
    data?.authorized === true ||
    data?.success === true ||
    data?.isAdmin === true
  )
) {
        setError(
          "You are not authorized to access the admin panel."
        );

        return;
      }

      // ------------------------------------------------
      // ADMIN VERIFIED
      // ------------------------------------------------

      console.log(
        "Admin verified. Opening dashboard..."
      );

      // Remove any previous admin login flags
      // Admin login should go through Google authentication
// Remove any previous admin login error
// Remove any previous admin login error
localStorage.removeItem("adminLoginError");

// Admin is verified — open admin dashboard
console.log("🚀 REDIRECTING TO ADMIN DASHBOARD");

router.replace("/admin/dashboard");



return;
    }

    // ==================================================
    // NORMAL USER LOGIN
    // ==================================================

    localStorage.removeItem("adminLoginIntent");

    router.replace("/dashboard");

  } catch (error: any) {
    console.error("Login error:", error);

    switch (error?.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        setError("Incorrect email or password.");
        break;

      case "auth/user-not-found":
        setError("No account found with this email.");
        break;

      case "auth/invalid-email":
        setError("Invalid email.");
        break;

      case "auth/too-many-requests":
        setError(
          "Too many login attempts. Please try again later."
        );
        break;

      default:
        setError(
          error?.message ||
            "Login failed. Please try again."
        );
    }
  } finally {
    setLoading(false);
  }
};
const handleGoogleLogin = async () => {
  try {
    setLoading(true);
    setError("");

    if (activeTab === "admin") {
      localStorage.setItem("adminLoginIntent", "true");
    } else {
      localStorage.removeItem("adminLoginIntent");
    }

    await signInWithGoogle();

    // Normal user Google login
    if (activeTab === "user") {
      router.push("/dashboard");
    }

    // For Admin Login:
    // AuthProvider will verify the Firebase user
    // against the allowed admin emails.
  } catch (error: any) {
    localStorage.removeItem("adminLoginIntent");

    if (error.code !== "auth/cancelled-popup-request") {
      setError(error.message);
    }
  } finally {
    setLoading(false);
  }
};
  return (
  <div className="w-full flex items-center justify-center">
      {/* Left panel */}
      
      {/* Right panel */}
<div className="w-full flex items-center justify-center px-6 py-12">        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-violet-100 p-8 sm:p-10">
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Login to continue your learning journey
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "user"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <User size={16} />
              User Login
            </button>
            <button
              type="button"
onClick={() => {
  setActiveTab("admin");
  setError("");
  setAdminLoginError("");
}}             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "admin"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <ShieldCheck size={16} />
              Admin Login
            </button>
          </div>
{(error || adminLoginError) && (
  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-center text-sm font-medium text-red-600">
      ⚠️ {error || adminLoginError}
    </p>
  </div>
)}
          <button
  type="button"
  onClick={handleGoogleLogin}
  disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                />
              </div>
            </div>

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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
  href="/forgot-password"
  className="text-xs font-medium text-violet-500 hover:text-violet-600"
>
  Forgot Password?
</Link>
            </div>


            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-600 transition-colors text-white text-sm font-semibold shadow-sm shadow-violet-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
           <button
  type="button"
  onClick={onSignup}
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
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