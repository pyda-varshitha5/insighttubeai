"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { FileText } from "lucide-react";
import SavedCard from "./SavedCard";

interface SavedSummary {
  _id: string;
  title: string;
  markdown: string;
  createdAt: string;
}

export default function SavedList() {
  const { user } = useAuth();

  const [savedItems, setSavedItems] = useState<SavedSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      try {
        setLoading(true);

        // Get Firebase authentication token
        const token = await user.getIdToken();

        // Fetch saved summaries
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

        // API returns:
        // {
        //   success: true,
        //   summaries: [...]
        // }

        setSavedItems(data.summaries || []);
      } catch (err) {
        console.error("FETCH SAVED ERROR:", err);
        setSavedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  // ============================================
  // DELETE SAVED SUMMARY
  // ============================================

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      const res = await fetch(`/api/saved/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
          data?.error || "Failed to delete saved summary"
        );
      }

      // Remove deleted item from UI
      setSavedItems((prev) =>
        prev.filter((item) => item._id !== id)
      );

      // Update dashboard progress
      window.dispatchEvent(
        new Event("progress-updated")
      );
    } catch (err) {
      console.error("DELETE SAVED ERROR:", err);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-500">
          Loading saved summaries...
        </p>
      </div>
    );
  }

  // ============================================
  // EMPTY
  // ============================================

  if (savedItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">
          No saved summaries yet.
        </p>
      </div>
    );
  }

  // ============================================
  // SAVED LIST
  // ============================================

  return (
    <div className="space-y-4">
      {savedItems.map((item, index) => {
        const wordCount = item.markdown
          ? item.markdown.split(/\s+/).filter(Boolean).length
          : 0;

        const readTime = Math.max(
          1,
          Math.ceil(wordCount / 200)
        );

        return (
          <SavedCard
            key={item._id}
            id={item._id}
            onDelete={handleDelete}
            icon={FileText}
            iconGradient="from-violet-100 to-violet-50"
            iconColor="text-violet-600"
            title={item.title}
            description={
              item.markdown
                ? item.markdown.slice(0, 120) +
                  (item.markdown.length > 120 ? "..." : "")
                : "Saved summary"
            }
            readTime={`${readTime} min read`}
            date={
              item.createdAt
                ? new Date(
                    item.createdAt
                  ).toLocaleDateString()
                : ""
            }
            time={
              item.createdAt
                ? new Date(
                    item.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""
            }
            isLast={
              index === savedItems.length - 1
            }
          />
        );
      })}
    </div>
  );
}