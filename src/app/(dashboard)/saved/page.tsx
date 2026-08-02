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

  useEffect(() => {
    if (!user) return;

    const fetchSaved = async () => {
      const res = await fetch(`/api/saved?userId=${user.uid}`);
      const data = await res.json();
      setSaved(data);
    };

    fetchSaved();
  }, [user]);

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 px-6 py-8 sm:px-8">
      <SavedHeader />

      <SavedFilters total={saved.length} />

      <SavedList />

      {saved.length === 0 && <SavedEmptyBanner />}
    </div>
  );
}