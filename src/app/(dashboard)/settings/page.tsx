"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";
import { useAuth } from "@/context/AuthProvider";

import {
  User,
  Mail,
  Save,
  Trash2,
  Lock,
  LogOut,
  History,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";


// =====================================================
// TYPES
// =====================================================

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
}

type MessageType = "success" | "error" | "";


// =====================================================
// SETTINGS PAGE
// =====================================================

export default function SettingsPage() {
  const router = useRouter();

  // Existing application auth state
  const {
    user: contextUser,
    loading: authLoading,
  } = useAuth();

  // Local Firebase auth state
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseUser | null>(null);

  const [firebaseChecked, setFirebaseChecked] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    photoURL: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>("");

  const [clearingHistory, setClearingHistory] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);


  // =====================================================
  // SHOW MESSAGE
  // =====================================================

  function showMessage(
    text: string,
    type: "success" | "error"
  ) {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3500);
  }


  // =====================================================
  // FIREBASE AUTH LISTENER
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log(
          "SETTINGS FIREBASE USER:",
          currentUser?.email || "NO USER"
        );

        setFirebaseUser(currentUser);
        setFirebaseChecked(true);
      }
    );

    return () => unsubscribe();
  }, []);


  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const currentUser =
    firebaseUser ||
    contextUser ||
    auth.currentUser;


  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    if (!firebaseChecked) {
      return;
    }

    if (!currentUser) {
      setLoading(false);
      return;
    }

    loadSettings(currentUser);
  }, [
    firebaseChecked,
    currentUser,
  ]);


  // =====================================================
  // LOAD USER SETTINGS FROM MONGODB
  // =====================================================

  async function loadSettings(
    firebaseUser: FirebaseUser
  ) {
    try {
      setLoading(true);

      const token =
        await firebaseUser.getIdToken();

      const response = await fetch(
        "/api/user/settings",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to load settings"
        );
      }

      const mongoUser =
        data.user;

      setProfile({
        firstName:
          mongoUser.firstName || "",

        lastName:
          mongoUser.lastName || "",

        email:
          mongoUser.email ||
          firebaseUser.email ||
          "",

        photoURL:
          mongoUser.photoURL ||
          firebaseUser.photoURL ||
          "",
      });

    } catch (error) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );

      showMessage(
        "Unable to load your profile.",
        "error"
      );

    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function saveSettings() {
    const user =
      auth.currentUser ||
      firebaseUser ||
      contextUser;

    if (!user) {
      showMessage(
        "Please login first.",
        "error"
      );

      return;
    }

    if (!profile.firstName.trim()) {
      showMessage(
        "First name is required.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      const token =
        await user.getIdToken();

      const response = await fetch(
        "/api/user/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            firstName:
              profile.firstName.trim(),

            lastName:
              profile.lastName.trim(),

            email:
              profile.email,

            photoURL:
              profile.photoURL,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to save settings"
        );
      }

      setProfile({
        firstName:
          data.user.firstName || "",

        lastName:
          data.user.lastName || "",

        email:
          data.user.email ||
          profile.email,

        photoURL:
          data.user.photoURL ||
          "",
      });

      showMessage(
        "Profile updated successfully!",
        "success"
      );

    } catch (error) {
      console.error(
        "SAVE SETTINGS ERROR:",
        error
      );

      showMessage(
        "Unable to save your changes.",
        "error"
      );

    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // CLEAR SEARCH HISTORY
  // =====================================================

  async function clearHistory() {
    const user =
      auth.currentUser ||
      firebaseUser ||
      contextUser;

    if (!user) {
      showMessage(
        "Please login first.",
        "error"
      );

      return;
    }

    try {
      setClearingHistory(true);

      const token =
        await user.getIdToken();

      const response = await fetch(
        "/api/user/clear-history",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({}),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to clear history"
        );
      }

      showMessage(
        "Search history cleared successfully.",
        "success"
      );

    } catch (error) {
      console.error(
        "CLEAR HISTORY ERROR:",
        error
      );

      showMessage(
        "Unable to clear search history.",
        "error"
      );

    } finally {
      setClearingHistory(false);
    }
  }


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async function changePassword() {
    const user =
      auth.currentUser ||
      firebaseUser ||
      contextUser;

    if (!user?.email) {
      showMessage(
        "Unable to find your email address.",
        "error"
      );

      return;
    }

    try {
      setChangingPassword(true);

      await sendPasswordResetEmail(
        auth,
        user.email
      );

      showMessage(
        "Password reset link sent to your email.",
        "success"
      );

    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      showMessage(
        "Unable to send password reset email.",
        "error"
      );

    } finally {
      setChangingPassword(false);
    }
  }


  // =====================================================
  // DELETE ACCOUNT
  // =====================================================

  async function deleteAccount() {
    const user =
      auth.currentUser ||
      firebaseUser ||
      contextUser;

    if (!user) {
      showMessage(
        "Please login first.",
        "error"
      );

      return;
    }

    try {
      setDeletingAccount(true);

      const token =
        await user.getIdToken();

      const response = await fetch(
        "/api/user/delete-account",
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to delete account"
        );
      }

      localStorage.clear();
      sessionStorage.clear();

      await signOut(auth);

      router.replace("/login");

    } catch (error) {
      console.error(
        "DELETE ACCOUNT ERROR:",
        error
      );

      showMessage(
        "Unable to delete your account.",
        "error"
      );

      setDeletingAccount(false);
    }
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {
    try {
      setLoggingOut(true);

      await signOut(auth);

      localStorage.clear();
      sessionStorage.clear();

      router.replace("/login");

    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      showMessage(
        "Unable to logout. Please try again.",
        "error"
      );

      setLoggingOut(false);
    }
  }


  // =====================================================
  // WAIT FOR AUTH
  // =====================================================

  if (
    authLoading ||
    !firebaseChecked ||
    loading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <div className="flex flex-col items-center gap-2">
          <Loader2
            className="h-7 w-7 animate-spin text-violet-600"
          />

          <p className="text-sm text-gray-500">
            Loading your settings...
          </p>
        </div>
      </div>
    );
  }


  // =====================================================
  // NO USER
  // =====================================================

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-4">

        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100">
            <Shield className="h-7 w-7 text-violet-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Login Required
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please login to access your account settings.
          </p>

          <button
            onClick={() =>
              router.push("/login")
            }
            className="mt-5 w-full rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // SETTINGS PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-6 py-6 lg:px-8">

      {/* 
        Full content width like the History page.
        This removes the excessive empty space created
        by max-w-5xl.
      */}
      <div className="w-full max-w-none">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-5">

          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
            Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your account and profile settings.
          </p>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`mb-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >

            {messageType === "success" ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            )}

            <p className="text-sm font-medium">
              {message}
            </p>

          </div>
        )}


        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="border-b border-gray-100 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <User className="h-5 w-5 text-violet-600" />
              </div>

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Profile Information
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Update your personal information.
                </p>

              </div>

            </div>

          </div>


          {/* CARD BODY */}

          <div className="px-5 py-5">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

              {/* =================================================
                  PROFILE IMAGE
              ================================================= */}

              <div className="flex shrink-0 flex-col items-center lg:w-28">

                <div className="relative">

                  <img
                    src={
                      profile.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${profile.firstName} ${profile.lastName}`
                      )}&background=ede9fe&color=7c3aed&size=200`
                    }
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-4 border-violet-100 object-cover shadow-sm"
                  />

                  <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-3 border-white bg-violet-600">

                    <User className="h-3.5 w-3.5 text-white" />

                  </div>

                </div>

                <p className="mt-2 text-center text-[11px] text-gray-400">
                  Profile picture
                </p>

              </div>


              {/* =================================================
                  FORM
              ================================================= */}

              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">

                {/* FIRST NAME */}

                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    First Name
                  </label>

                  <div className="relative">

                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          firstName:
                            e.target.value,
                        })
                      }
                      placeholder="Enter first name"
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
                    />

                  </div>

                </div>


                {/* LAST NAME */}

                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Last Name
                  </label>

                  <div className="relative">

                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          lastName:
                            e.target.value,
                        })
                      }
                      placeholder="Enter last name"
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
                    />

                  </div>

                </div>


                {/* EMAIL */}

                <div className="sm:col-span-2">

                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-500 outline-none"
                    />

                  </div>

                  <p className="mt-1.5 text-[11px] text-gray-400">
                    Your email address is managed through your authentication account.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">

              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            ACCOUNT & SECURITY
        ================================================= */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-gray-100 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <Shield className="h-5 w-5 text-violet-600" />
              </div>

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Account & Security
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Manage your account security and data.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              SECURITY OPTIONS
          ================================================= */}

          <div className="divide-y divide-gray-100">

            {/* CHANGE PASSWORD */}

            <button
              onClick={changePassword}
              disabled={changingPassword}
              className="group flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-gray-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 transition group-hover:bg-violet-100">
                  <Lock className="h-4 w-4 text-violet-600" />
                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    Change Password
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Receive a password reset link by email.
                  </p>

                </div>

              </div>

              {changingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              ) : (
                <span className="text-xs font-medium text-violet-600">
                  Change
                </span>
              )}

            </button>


            {/* CLEAR HISTORY */}

            <button
              onClick={clearHistory}
              disabled={clearingHistory}
              className="group flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-gray-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 transition group-hover:bg-blue-100">
                  <History className="h-4 w-4 text-blue-600" />
                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    Clear Search History
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Remove all your recent searches.
                  </p>

                </div>

              </div>

              {clearingHistory ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <span className="text-xs font-medium text-blue-600">
                  Clear
                </span>
              )}

            </button>


            {/* LOGOUT */}

            <button
              onClick={logout}
              disabled={loggingOut}
              className="group flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-gray-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-gray-200">
                  <LogOut className="h-4 w-4 text-gray-600" />
                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    Logout
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Sign out of your InsightTube-AI account.
                  </p>

                </div>

              </div>

              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  Logout
                </span>
              )}

            </button>


            {/* DELETE ACCOUNT */}

            <button
              onClick={() =>
                setShowDeleteConfirm(true)
              }
              disabled={deletingAccount}
              className="group flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-red-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 transition group-hover:bg-red-100">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>

                <div>

                  <p className="text-sm font-semibold text-red-600">
                    Delete Account
                  </p>

                  <p className="mt-0.5 text-xs text-red-400">
                    Permanently delete your account and data.
                  </p>

                </div>

              </div>

              <span className="text-xs font-medium text-red-600">
                Delete
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            DELETE MODAL
        ================================================= */}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Delete your account?
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                This action permanently removes your account
                and associated data. This cannot be undone.
              </p>

              <div className="mt-6 flex gap-2.5">

                <button
                  onClick={() =>
                    setShowDeleteConfirm(false)
                  }
                  disabled={deletingAccount}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={deleteAccount}
                  disabled={deletingAccount}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >

                  {deletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>
        )}


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="py-5 text-center">

          <p className="text-[11px] text-gray-400">
            InsightTube-AI • Account Settings
          </p>

        </div>

      </div>

    </div>
  );
}