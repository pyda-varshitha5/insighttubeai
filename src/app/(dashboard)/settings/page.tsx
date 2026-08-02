"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";
import {
  User,
  Bell,
  Settings,
  Shield,
  Database,
  Trash2,
  Lock,
  LogOut,
  Save,
  Moon,
  Sun,
} from "lucide-react";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  photoURL: string;
}

interface Preferences {
  theme: "Light" | "Dark";
  language: string;
  timezone: string;
  summaryLength: string;
}

interface Notifications {
  emailNotifications: boolean;
  summaryCompleted: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
}

export default function SettingsPage() {
    const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    photoURL: "",
  });

  const [preferences, setPreferences] =
    useState<Preferences>({
      theme: "Light",
      language: "English",
      timezone: "(GMT+05:30) Asia/Kolkata",
      summaryLength: "Medium",
    });

  const [notifications, setNotifications] =
    useState<Notifications>({
      emailNotifications: true,
      summaryCompleted: true,
      weeklyDigest: false,
      productUpdates: true,
    });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      // MongoDB API will be connected later

      setProfile({
        firstName: "Varshitha",
        lastName: "Pyda",
        email: "example@gmail.com",
        phone: "",
        bio: "",
        photoURL:
          "https://ui-avatars.com/api/?name=Varshitha",
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function toggleNotification(
    key: keyof Notifications
  ) {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function updatePreference(
    key: keyof Preferences,
    value: string
  ) {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  
  
  function deleteAccount() {
    alert("Delete Account");
  }

  async function logout() {
  try {
    await signOut(auth);

    localStorage.clear();
    sessionStorage.clear();

    router.replace("/login");
  } catch (error) {
    console.error(error);
    alert("Failed to logout.");
  }
}

async function changePassword() {
  try {
    if (!auth.currentUser?.email) {
      alert("Please login first.");
      return;
    }

    await sendPasswordResetEmail(
      auth,
      auth.currentUser.email
    );

    alert("Password reset email sent.");
  } catch (error) {
    console.error(error);
    alert("Unable to send reset email.");
  }
}

async function clearHistory() {
  try {
    if (!auth.currentUser?.email) {
      alert("User not found.");
      return;
    }

    const response = await fetch(
      "/api/user/clear-history",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: auth.currentUser.email,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to clear history.");
    }

    alert("Search history cleared.");
  } catch (error) {
    console.error(error);
    alert("Unable to clear history.");
  }
}

  return (
    <div className="min-h-screen bg-[#F7F8FC]">

  <div className="mx-auto max-w-7xl p-8">

    {/* Header */}

    <div className="mb-8">

      <h1 className="text-4xl font-bold text-gray-900">
        Settings
      </h1>

      <p className="mt-2 text-gray-500">
        Manage your account preferences and application settings.
      </p>

    </div>

    {/* Profile Card */}

    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-3">

            <User className="h-6 w-6 text-violet-600"/>

          </div>

          <div>

            <h2 className="text-2xl font-semibold">
              Profile Information
            </h2>

            <p className="text-gray-500">
              Update your personal information and profile picture.
            </p>

          </div>

        </div>

        <button
          className="rounded-xl border border-gray-300 px-5 py-2 font-medium hover:bg-gray-50"
        >
          Edit Profile
        </button>

      </div>

      <div className="mt-8 flex items-center gap-8">

        <img
          src={
            profile.photoURL ||
            "https://ui-avatars.com/api/?name=User"
          }
          alt="Profile"
          className="h-28 w-28 rounded-full border-4 border-violet-100 object-cover"
        />

        <div className="grid flex-1 grid-cols-2 gap-6">

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              First Name
            </label>

            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
              value={profile.firstName}
              onChange={(e)=>
                setProfile({
                  ...profile,
                  firstName:e.target.value
                })
              }
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Last Name
            </label>

            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
              value={profile.lastName}
              onChange={(e)=>
                setProfile({
                  ...profile,
                  lastName:e.target.value
                })
              }
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>

            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
              value={profile.email}
              onChange={(e)=>
                setProfile({
                  ...profile,
                  email:e.target.value
                })
              }
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone Number
            </label>

            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
              value={profile.phone}
              onChange={(e)=>
                setProfile({
                  ...profile,
                  phone:e.target.value
                })
              }
            />

          </div>

        </div>

      </div>

      <div className="mt-6">

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Bio
        </label>

        <textarea
          rows={4}
          className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-violet-500"
          value={profile.bio}
          onChange={(e)=>
            setProfile({
              ...profile,
              bio:e.target.value
            })
          }
        />

      </div>

      <div className="mt-8 flex justify-end gap-4">

        {saved && (

          <div className="rounded-xl bg-green-100 px-4 py-3 text-green-700">
            Settings Saved Successfully
          </div>

        )}

        <button
          onClick={saveSettings}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-white hover:bg-violet-700"
        >

          <Save size={18}/>

          Save Changes

        </button>

      </div>

    </div>

    {/* Preferences + Notifications */}

    <div className="mt-8 grid grid-cols-2 gap-8">
              {/* Preferences Card */}

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-3">

            <Settings className="h-6 w-6 text-violet-600"/>

          </div>

          <div>

            <h2 className="text-2xl font-semibold">
              Preferences
            </h2>

            <p className="text-gray-500">
              Customize your application experience.
            </p>

          </div>

        </div>

        <div className="space-y-6">

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Theme
            </label>

            <select
              className="w-full rounded-xl border border-gray-300 p-3"
              value={preferences.theme}
              onChange={(e)=>
                updatePreference("theme",e.target.value)
              }
            >
              <option>Light</option>
              <option>Dark</option>
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Language
            </label>

            <select
              className="w-full rounded-xl border border-gray-300 p-3"
              value={preferences.language}
              onChange={(e)=>
                updatePreference("language",e.target.value)
              }
            >

              <option>English</option>
              <option>Hindi</option>
              <option>Telugu</option>

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Timezone
            </label>

            <select
              className="w-full rounded-xl border border-gray-300 p-3"
              value={preferences.timezone}
              onChange={(e)=>
                updatePreference("timezone",e.target.value)
              }
            >

              <option>(GMT+05:30) Asia/Kolkata</option>

              <option>UTC</option>

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Summary Length
            </label>

            <select
              className="w-full rounded-xl border border-gray-300 p-3"
              value={preferences.summaryLength}
              onChange={(e)=>
                updatePreference("summaryLength",e.target.value)
              }
            >

              <option>Short</option>

              <option>Medium</option>

              <option>Detailed</option>

            </select>

          </div>

        </div>

      </div>

      {/* Notifications Card */}

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-3">

            <Bell className="h-6 w-6 text-violet-600"/>

          </div>

          <div>

            <h2 className="text-2xl font-semibold">
              Notifications
            </h2>

            <p className="text-gray-500">
              Control notification preferences.
            </p>

          </div>

        </div>

        <div className="space-y-5">

          <div className="flex items-center justify-between">

            <span>Email Notifications</span>

            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={()=>
                toggleNotification("emailNotifications")
              }
            />

          </div>

          <div className="flex items-center justify-between">

            <span>Summary Completed</span>

            <input
              type="checkbox"
              checked={notifications.summaryCompleted}
              onChange={()=>
                toggleNotification("summaryCompleted")
              }
            />

          </div>

          <div className="flex items-center justify-between">

            <span>Weekly Digest</span>

            <input
              type="checkbox"
              checked={notifications.weeklyDigest}
              onChange={()=>
                toggleNotification("weeklyDigest")
              }
            />

          </div>

          <div className="flex items-center justify-between">

            <span>Product Updates</span>

            <input
              type="checkbox"
              checked={notifications.productUpdates}
              onChange={()=>
                toggleNotification("productUpdates")
              }
            />

          </div>

        </div>

      </div>

    </div>

    {/* Data & Privacy */}

    <div className="mt-8 grid grid-cols-2 gap-8">
              {/* Data & Privacy Card */}

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-3">
            <Database className="h-6 w-6 text-violet-600" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Data & Privacy
            </h2>

            <p className="text-gray-500">
              Manage your personal data and privacy.
            </p>
          </div>

        </div>

        <div className="space-y-5">

          <button
            onClick={clearHistory}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div>

              <p className="font-semibold">
                Clear Search History
              </p>

              <p className="text-sm text-gray-500">
                Remove all recent searches.
              </p>

            </div>

            <Trash2 className="text-red-500" />

          </button>

          <button
            onClick={deleteAccount}
            className="flex w-full items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 hover:bg-red-100"
          >

            <div>

              <p className="font-semibold text-red-600">
                Delete Account
              </p>

              <p className="text-sm text-red-500">
                Permanently remove your account.
              </p>

            </div>

            <Trash2 className="text-red-600" />

          </button>

        </div>

      </div>

      {/* Account Card */}

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-3">
            <Shield className="h-6 w-6 text-violet-600" />
          </div>

          <div>

            <h2 className="text-2xl font-semibold">
              Account
            </h2>

            <p className="text-gray-500">
              Manage your account security.
            </p>

          </div>

        </div>

        <div className="space-y-5">

          <button
            onClick={changePassword}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
          >

            <div>

              <p className="font-semibold">
                Change Password
              </p>

              <p className="text-sm text-gray-500">
                Update your login password.
              </p>

            </div>

            <Lock className="text-violet-600" />

          </button>

          <button
            onClick={logout}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
          >

            <div>

              <p className="font-semibold">
                Logout
              </p>

              <p className="text-sm text-gray-500">
                Sign out of your account.
              </p>

            </div>

            <LogOut className="text-red-500" />

          </button>

        </div>

      </div>

    </div>

    {/* Bottom Save */}

    <div className="mt-10 flex justify-end">

      <button
        onClick={saveSettings}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-white shadow-lg transition hover:bg-violet-700"
      >

        <Save size={18} />

        Save All Settings

      </button>

    </div>

  </div>

</div>

  );
}
    