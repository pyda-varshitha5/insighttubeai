"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  User,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";

// ======================================================
// AUTH CONTEXT TYPE
// ======================================================

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

// ======================================================
// CONTEXT
// ======================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

// ======================================================
// CHECK ADMIN
// ======================================================

async function checkAdmin(
  firebaseUser: User
): Promise<boolean> {
  try {
    const token = await firebaseUser.getIdToken(true);

    const response = await fetch("/api/admin", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(
      "Admin check:",
      response.status,
      data
    );

    if (!response.ok) {
      return false;
    }

    return (
      data?.authorized === true ||
      data?.success === true ||
      data?.isAdmin === true
    );
  } catch (error) {
    console.error(
      "Admin check failed:",
      error
    );

    return false;
  }
}

// ======================================================
// SYNC USER TO MONGODB
// ======================================================

async function syncUserToMongo(
  firebaseUser: User
) {
  try {
    const token =
      await firebaseUser.getIdToken();

    const displayName =
      firebaseUser.displayName || "";

    const nameParts =
      displayName.trim().split(/\s+/);

    const firstName =
      nameParts.shift() || "User";

    const lastName =
      nameParts.join(" ");

    const response = await fetch(
      "/api/user/sync",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          uid: firebaseUser.uid,
          firstName,
          lastName,
          email: firebaseUser.email,
          photoURL:
            firebaseUser.photoURL || "",
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "User sync:",
      response.status,
      data
    );

    if (
      !response.ok ||
      !data?.success
    ) {
      console.error(
        "User sync failed:",
        data
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "User sync error:",
      error
    );

    return false;
  }
}

// ======================================================
// AUTH PROVIDER
// ======================================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  // ====================================================
  // FIREBASE AUTH LISTENER
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!mounted) {
            return;
          }

          // ============================================
          // NO USER
          // ============================================

          if (!firebaseUser) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);

            return;
          }

          // ============================================
          // USER FOUND
          // ============================================

          setUser(firebaseUser);

          console.log(
            "Authenticated user:",
            firebaseUser.email
          );

          try {
            // ==========================================
            // CHECK ADMIN
            // ==========================================

            const admin =
              await checkAdmin(
                firebaseUser
              );

            if (!mounted) {
              return;
            }

            setIsAdmin(admin);

            console.log(
              "Admin status:",
              admin
            );

            // ==========================================
            // IMPORTANT
            // ==========================================
            //
            // DO NOT REDIRECT HERE.
            //
            // Admin redirection is handled by
            // LoginCard after the admin explicitly
            // chooses "Admin Login".
            //
            // This prevents Firebase from automatically
            // opening the admin dashboard when the user
            // visits the landing page.
            //
            // ==========================================

            if (!admin) {
              await syncUserToMongo(
                firebaseUser
              );

              if (!mounted) {
                return;
              }
            }

            // ==========================================
            // AUTH FINISHED
            // ==========================================

            setLoading(false);
          } catch (error) {
            console.error(
              "Authentication check failed:",
              error
            );

            if (!mounted) {
              return;
            }

            setLoading(false);
          }
        }
      );

    // ================================================
    // CLEANUP
    // ================================================

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// USE AUTH
// ======================================================

export function useAuth() {
  return useContext(AuthContext);
}