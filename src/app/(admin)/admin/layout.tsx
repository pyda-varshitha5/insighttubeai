"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (loading) return;

    const checkAdmin = async () => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const idToken = await user.getIdToken();

        const response = await fetch("/api/admin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.authorized) {
          router.replace("/login");
          return;
        }

        setCheckingAdmin(false);
      } catch (error) {
        console.error("Admin access check failed:", error);
        router.replace("/login");
      }
    };

    checkAdmin();
  }, [user, loading, router]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}