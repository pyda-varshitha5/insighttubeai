"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";

import SavedHeader from "@/components/saved/SavedHeader";
import SavedFilters from "@/components/saved/SavedFilters";
import SavedList from "@/components/saved/SavedList";
import SavedEmptyBanner from "@/components/saved/SavedEmptyBanner";

export default function SavedPage() {
  const { user } = useAuth();

  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      try {
        setLoading(true);
        setError("");

        // Get Firebase ID token
        const token = await user.getIdToken();

        // Fetch saved summaries with authentication
        const res = await fetch("/api/saved", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "Failed to fetch saved summaries"
          );
        }

        // API returns { success: true, summaries: [...] }
        setSaved(data.summaries || []);
      } catch (error) {
        console.error("FETCH SAVED ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load saved summaries"
        );

        setSaved([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SavedHeader />

      <SavedFilters total={saved.length} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-slate-500">
            Loading saved summaries...
          </p>
        </div>
      ) : error ? (
        <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      ) : saved.length === 0 ? (
        <SavedEmptyBanner />
      ) : (
        <SavedList />
      )}
    </div>
  );
}