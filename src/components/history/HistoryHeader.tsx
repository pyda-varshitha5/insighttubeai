"use client";

import { useAuth } from "@/context/AuthProvider";

export default function HistoryHeader() {
  const { user } = useAuth();

  const firstName =
    user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        History
      </h1>

      <p className="text-sm text-slate-500">
        View your recently searched topics and generated summaries.
      </p>
    </div>
  );
}