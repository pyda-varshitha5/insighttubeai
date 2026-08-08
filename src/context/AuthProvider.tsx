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

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          setUser(firebaseUser);

          // Check whether this login was started
          // from the Admin Login tab.
          const adminLoginIntent =
            localStorage.getItem("adminLoginIntent");

          if (firebaseUser && adminLoginIntent === "true") {
            localStorage.removeItem("adminLoginIntent");

            const idToken =
              await firebaseUser.getIdToken();

            const response = await fetch("/api/admin", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });

            const data = await response.json();

            if (response.ok && data.authorized) {
              router.push("/admin/dashboard");
              return;
            }

           await signOut(auth);

setUser(null);

localStorage.setItem(
  "adminLoginError",
  "You are not authorized to access the admin panel."
);

window.location.href = "/";
return;
          }

          setLoading(false);
        } catch (error) {
          console.error(
            "Authentication check failed:",
            error
          );

          localStorage.removeItem("adminLoginIntent");

          await signOut(auth);

          setUser(null);
          setLoading(false);

          router.push("/login");
        }
      }
    );

    return unsubscribe;
  }, [router]);

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

export function useAuth() {
  return useContext(AuthContext);
}