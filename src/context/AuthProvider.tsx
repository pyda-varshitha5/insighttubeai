"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  User,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";

// ============================================
// AUTH CONTEXT TYPE
// ============================================

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// ============================================
// CREATE CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// ============================================
// AUTH PROVIDER
// ============================================

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ============================================
  // FIREBASE AUTH LISTENER
  // ============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          // ========================================
          // STORE FIREBASE USER
          // ========================================

          setUser(firebaseUser);

          // ========================================
          // ADMIN LOGIN CHECK
          // ========================================

          const adminLoginIntent =
            localStorage.getItem("adminLoginIntent");

          if (
            firebaseUser &&
            adminLoginIntent === "true"
          ) {
            // Remove intent immediately
            localStorage.removeItem(
              "adminLoginIntent"
            );

            // ======================================
            // GET FIREBASE ID TOKEN
            // ======================================

            const idToken =
              await firebaseUser.getIdToken();

            // ======================================
            // CHECK ADMIN AUTHORIZATION
            // ======================================

            const response = await fetch(
              "/api/admin",
              {
                method: "POST",
                headers: {
                  Authorization:
                    `Bearer ${idToken}`,
                },
              }
            );

            const data = await response.json();

            // ======================================
            // AUTHORIZED ADMIN
            // ======================================

            if (
              response.ok &&
              data.authorized
            ) {
              setLoading(false);

              router.push(
                "/admin/dashboard"
              );

              return;
            }

            // ======================================
            // UNAUTHORIZED ADMIN
            // ======================================

            await signOut(auth);

            setUser(null);
            setLoading(false);

            localStorage.setItem(
              "adminLoginError",
              "You are not authorized to access the admin panel."
            );

            // Return to landing/login page
            window.location.href = "/";

            return;
          }

          // ========================================
          // NORMAL USER LOGIN
          // ========================================

          setLoading(false);
        } catch (error) {
          console.error(
            "Authentication check failed:",
            error
          );

          // Clear admin login intent
          localStorage.removeItem(
            "adminLoginIntent"
          );

          // Try to sign out
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error(
              "Sign out failed:",
              signOutError
            );
          }

          setUser(null);
          setLoading(false);

          router.push("/login");
        }
      }
    );

    // ==========================================
    // CLEANUP FIREBASE LISTENER
    // ==========================================

    return () => unsubscribe();
  }, [router]);

  // ============================================
  // PROVIDER
  // ============================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// USE AUTH HOOK
// ============================================

export function useAuth() {
  return useContext(AuthContext);
}