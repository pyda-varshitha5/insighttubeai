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
    if (!user) return;

    const fetchSaved = async () => {
      try {
        const res = await fetch(`/api/saved?userId=${user.uid}`);

        if (!res.ok) return;

        const data = await res.json();
        setSavedItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        Loading...
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
        No saved summaries yet.
      </div>
    );
  }
const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/saved/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) return;

    setSavedItems((prev) => prev.filter((item) => item._id !== id));

    window.dispatchEvent(new Event("progress-updated"));
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-sm">
      {savedItems.map((item, index) => (
       <SavedCard
  id={item._id}
  onDelete={handleDelete}
          key={item._id}
          icon={FileText}
          iconGradient="from-violet-100 to-violet-50"
          iconColor="text-violet-600"
          title={item.title}
          description={item.markdown.slice(0, 120) + "..."}
          readTime={`${Math.max(
            1,
            Math.ceil(item.markdown.split(/\s+/).length / 200)
          )} min read`}
          date={new Date(item.createdAt).toLocaleDateString()}
          time={new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          isLast={index === savedItems.length - 1}
        />
      ))}
    </div>
  );
}