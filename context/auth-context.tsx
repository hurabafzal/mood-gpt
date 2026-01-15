// context/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  updatePaymentPlan: (paymentPlan: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isPlanExpired = (plan: string, planStartAt: string): boolean => {
  const now = new Date();
  const start = new Date(planStartAt);
  const diffMs = now.getTime() - start.getTime();

if (plan === "creator" || plan === "basic") {
    return diffMs >= 30 * 24 * 60 * 60 * 1000;
  }
  if (plan === "lifetime") {
    return diffMs >= 3 * 365 * 24 * 60 * 60 * 1000;
  }
  return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let unsubscribe: () => void = () => { };

    const setupAuth = async () => {
      try {
        // Retry getting Firebase Auth instance up to 3 times
        let authInstance;
        let attempts = 0;
        const maxAttempts = 3;
        while (!authInstance && attempts < maxAttempts) {
          authInstance = await getFirebaseAuth();
          if (!authInstance) {
            console.warn(`Firebase Auth not initialized (attempt ${attempts + 1}/${maxAttempts}). Retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retrying
            attempts++;
          }
        }

        //console.log("🟢 Firebase Auth initialized:", !!authInstance);

        if (!authInstance) {
          console.error("Firebase Auth failed to initialize after retries.");
          setLoading(false);
          return;
        }

        const { onAuthStateChanged } = await import("firebase/auth");

        unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          //console.log("🟢 onAuthStateChanged fired, fbUser =", user);
          if (user) {
            //console.log("🟢  — signed in as", user.uid, user.email);
            localStorage.removeItem("guest_prompt_count")

            setUser(user);

            try {
              const dbInstance = await getFirestoreDb();
              if (dbInstance) {
                const { doc, getDoc, setDoc } = await import("firebase/firestore");
                const userRef = doc(dbInstance, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                  await setDoc(userRef, {
                    email: user.email,
                    displayName: user.displayName || null,
                    photoURL: user.photoURL || null,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    plan: "free",
                  });
                } else {
                  const existingData = userSnap.data();
                  const updateData: any = {
                    lastLogin: new Date().toISOString(),
                  };

                  if (!existingData.plan) {
                    updateData.plan = "free";
                  }

                  await setDoc(userRef, updateData, { merge: true });

                  const { plan, planStartAt } = existingData;

                  if (plan && planStartAt && isPlanExpired(plan, planStartAt)) {
                    //console.log(`⌛ '${plan}' plan expired. Downgrading...`);
                    await updatePaymentPlan("free", user);
                  } else if (plan && planStartAt) {
                    const activeFor = (new Date().getTime() - new Date(planStartAt).getTime()) / 1000;
                    //console.log(`🔎 '${plan}' plan still active (${activeFor.toFixed(2)}s since start).`);
                  }

                }
              } else {
                console.warn("Firestore is not initialized. User data will not be saved.");
              }
            } catch (error) {
              console.error("Error accessing Firestore:", error);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error setting up auth:", error);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      unsubscribe();
    };
  }, []);

  const signOutUser = async () => {
    try {
      const authInstance = await getFirebaseAuth();
      if (!authInstance) {
        console.warn("Firebase Auth is not initialized. Cannot sign out.");
        return;
      }

      const { signOut } = await import("firebase/auth");
      await signOut(authInstance);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updatePaymentPlan = async (paymentPlan: string, userOverride?: User) => {
    try {
      const dbInstance = await getFirestoreDb();
      const effectiveUser = userOverride || user;

      if (!dbInstance || !effectiveUser) {
        console.warn("Cannot update paymentPlan: Firestore or user not available");
        return;
      }

      const { doc, updateDoc } = await import("firebase/firestore");
      const userRef = doc(dbInstance, "users", effectiveUser.uid);

      const updateData: any = {
        plan: paymentPlan,
        lastPaymentAt: new Date().toISOString(),
      };

      if (paymentPlan === "creator" || paymentPlan === "lifetime" || paymentPlan === "basic") {
        updateData.planStartAt = new Date().toISOString();
      }

      await updateDoc(userRef, updateData);
      //console.log("✅ paymentPlan updated to", paymentPlan);
    } catch (error) {
      console.error("Error updating paymentPlan:", error);
    }
  };

  return <AuthContext.Provider value={{ user, loading, signOutUser, updatePaymentPlan }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}