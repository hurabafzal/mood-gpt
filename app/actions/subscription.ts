"use server"

import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export type SubscriptionPlan = "free" |"basic"| "creator"

export interface SubscriptionDetails {
  plan: SubscriptionPlan
  startDate: string
  endDate?: string
}

// Function to check message limit
export async function checkMessageLimit(userId?: string) {
  if (!userId) {
    // Use local storage limit for non-authenticated users
    return {
      limited: false,
      count: 0,
      limit: 3,
    }
  }

  try {
    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return {
        limited: false,
        count: 0,
        limit: 3,
      }
    }

    const userData = userDoc.data()
    const subscription = userData.subscription || { plan: "free" }
    const messageCount = userData.messageCount || 0

    // Get daily message limit based on subscription
    const dailyLimit = subscription.plan === "creator" ? 363 : subscription.plan === "basic" ? 50  : 5

    return {
      limited: messageCount >= dailyLimit,
      count: messageCount,
      limit: dailyLimit,
    }
  } catch (error) {
    console.error("Error checking message limit:", error)
    // Default to not limited in case of error
    return {
      limited: false,
      count: 0,
      limit: 3,
    }
  }
}

// Function to get subscription details
export async function getSubscriptionDetails(userId?: string) {
  if (!userId) {
    // Return default subscription for non-authenticated users
    return {
      success: true,
      plan: "free" as SubscriptionPlan,
      subscription: {
        plan: "free",
        startDate: new Date().toISOString(),
      } as SubscriptionDetails,
    }
  }

  try {
    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return {
        success: true,
        plan: "free" as SubscriptionPlan,
        subscription: {
          plan: "free",
          startDate: new Date().toISOString(),
        } as SubscriptionDetails,
      }
    }

    const userData = userDoc.data()
    const subscription = userData.subscription || {
      plan: "free",
      startDate: new Date().toISOString(),
    }

    return {
      success: true,
      plan: subscription.plan as SubscriptionPlan,
      subscription: subscription as SubscriptionDetails,
    }
  } catch (error) {
    console.error("Error getting subscription details:", error)
    return {
      success: false,
      error: "Failed to get subscription details",
      plan: "free" as SubscriptionPlan,
      subscription: {
        plan: "free",
        startDate: new Date().toISOString(),
      } as SubscriptionDetails,
    }
  }
}

// Function to update subscription plan
export async function updateSubscriptionPlan(userId: string, plan: SubscriptionPlan) {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
    }
  }

  try {
    // In a real app, this would update the subscription in Firestore
    // For now, we'll just return success
    return {
      success: true,
      plan,
    }
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    return {
      success: false,
      error: "Failed to update subscription plan",
    }
  }
}
