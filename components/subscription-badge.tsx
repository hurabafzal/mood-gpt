"use client"

import { Badge } from "@/components/ui/badge"
import { getFirestoreDb } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Crown } from "lucide-react"
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

interface SubscriptionBadgeProps {
  user: User | null; // in case user is not logged in
}

export function SubscriptionBadge({ user } : SubscriptionBadgeProps) {
  // const { subscriptionPlan, unlimited } = useMessageLimit()
  const [subscriptionPlan, setSubscriptionPlan] = useState()
  useEffect(() => {
    setTimeout(() => {
      if (!user) return
        ; (async () => {
          const db = await getFirestoreDb()
          if (!db) {
            console.error("Firestore failed to initialize—cannot save message.")
            return
          }
          const userDocRef = doc(db!, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)
          const userData = userDocSnap.data()
          const userPlan = userData?.plan || "free"
          setSubscriptionPlan(userPlan)
        })()
    }, 1000);
  }, [user])

  if (subscriptionPlan === "lifetime") {
    return (
      <Badge
        variant="outline"
        className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1"
      >
        <Crown className="h-3 w-3 text-[#FFD700]" />
        <span>Founder</span>
      </Badge>
    )
  }

  if (subscriptionPlan === "creator") {
    return (
      <Badge
        variant="outline"
        className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
      >
        Creator Plan
      </Badge>
    )
  }
  if (subscriptionPlan === "basic") {
    return (
      <Badge
        variant="outline"
        className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
      >
        Basic Plan
      </Badge>
    )
  }

  return null
}
