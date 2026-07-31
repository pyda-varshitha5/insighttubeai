"use client";

import { useAuth } from "@/context/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "";
  const lastName = user?.displayName?.split(" ").slice(1).join(" ") || "";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          My Profile
        </h1>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-500">First Name</p>
            <p className="text-lg font-semibold">{firstName}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Last Name</p>
            <p className="text-lg font-semibold">{lastName}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-lg font-semibold">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}