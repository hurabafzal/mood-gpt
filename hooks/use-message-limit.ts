"use client"

import { useState, useEffect } from "react"

interface MessageLimitState {
  count: number
  emailCollected: boolean
  limitReached: boolean
  showEmailPrompt: boolean
  subscriptionPlan: "free" | "basic" | "creator" | "lifetime"
  unlimited: boolean
}

interface SubscriptionData {
  plan: "free" |  "basic" | "creator" | "lifetime"
  startDate: string
  endDate?: string
}

export function useMessageLimit() {
  const [state, setState] = useState<MessageLimitState>({
    count: 0,
    emailCollected: false,
    limitReached: false,
    showEmailPrompt: false,
    subscriptionPlan: "free",
    unlimited: false,
  })

  // Load state from localStorage on component mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    const storedData = localStorage.getItem("moodgpt_message_limit")
    const subscriptionData = localStorage.getItem("moodgpt_subscription")

    let subscriptionPlan: "free" | "basic" | "creator" | "lifetime" = "free"
    let unlimited = false

    // Check if user has an active subscription
    if (subscriptionData) {
      try {
        const subscription = JSON.parse(subscriptionData) as SubscriptionData

        // Check if subscription is still valid
        if (subscription.plan === "lifetime" || (subscription.endDate && new Date(subscription.endDate) > new Date())) {
          subscriptionPlan = subscription.plan

          // Set unlimited flag for lifetime subscribers
          if (subscription.plan === "lifetime") {
            unlimited = true
          }
        }
      } catch (e) {
        console.error("Error parsing subscription data", e)
      }
    }

    if (storedData) {
      try {
        const data = JSON.parse(storedData)

        // Reset count if it's a new day
        if (data.date !== today) {
          setState({
            count: 0,
            emailCollected: data.emailCollected || false,
            limitReached: false,
            showEmailPrompt: false,
            subscriptionPlan,
            unlimited: unlimited || data.unlimited || false,
          })
          return
        }

        // Get daily message limit based on subscription
        const dailyLimit = subscriptionPlan === "creator" ? 363 : subscriptionPlan === "basic" ? 50 : 5
        const initialLimit = subscriptionPlan === "creator" ? 363 : subscriptionPlan === "basic"  ? 50 : 2

        // Determine if we should show email prompt (after initial limit messages for free users)
        const showEmailPrompt = subscriptionPlan === "free" && data.count >= initialLimit && !data.emailCollected

        // Determine if limit is reached (never for lifetime subscribers)
        const limitReached = unlimited
          ? false
          : (subscriptionPlan === "free" && data.emailCollected && data.count >= dailyLimit) ||
            (subscriptionPlan === "free" && !data.emailCollected && data.count >= initialLimit && !showEmailPrompt) ||
            ((subscriptionPlan === "basic" || subscriptionPlan === "creator") && data.count >= dailyLimit)

        setState({
          count: data.count || 0,
          emailCollected: data.emailCollected || false,
          limitReached,
          showEmailPrompt,
          subscriptionPlan,
          unlimited: unlimited || data.unlimited || false,
        })
      } catch (e) {
        console.error("Error parsing message limit data", e)
      }
    } else {
      // Initialize with subscription plan
      setState((prev) => ({
        ...prev,
        subscriptionPlan,
        unlimited,
      }))
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    localStorage.setItem(
      "moodgpt_message_limit",
      JSON.stringify({
        count: state.count,
        emailCollected: state.emailCollected,
        date: today,
        unlimited: state.unlimited,
      }),
    )
  }, [state.count, state.emailCollected, state.unlimited])

  // Function to increment message count
  const incrementCount = () => {
    setState((prev) => {
      // If user has unlimited messages, don't increment or check limits
      if (prev.unlimited) {
        return {
          ...prev,
          limitReached: false,
          showEmailPrompt: false,
        }
      }

      const newCount = prev.count + 1

      // Get daily message limit based on subscription
      const dailyLimit = prev.subscriptionPlan === "creator" ? 363 : prev.subscriptionPlan === "basic" ? 50 : 5
      const initialLimit = prev.subscriptionPlan === "creator" ? 363 : prev.subscriptionPlan === "basic" ? 50 : 2

      // Determine if we should show email prompt (after initial limit messages for free users)
      const showEmailPrompt = prev.subscriptionPlan === "free" && newCount >= initialLimit && !prev.emailCollected

      // Determine if limit is reached
      const limitReached =
        (prev.subscriptionPlan === "free" && prev.emailCollected && newCount >= dailyLimit) ||
        (prev.subscriptionPlan === "free" && !prev.emailCollected && newCount >= initialLimit && !showEmailPrompt) ||
        ((prev.subscriptionPlan === "basic" || prev.subscriptionPlan === "creator") && newCount >= dailyLimit)

      return {
        ...prev,
        count: newCount,
        showEmailPrompt,
        limitReached,
      }
    })
  }

  // Function to set email as collected
  const setEmailCollected = () => {
    setState((prev) => {
      // Get daily message limit based on subscription
      const dailyLimit = prev.subscriptionPlan === "creator" ? 363 : prev.subscriptionPlan === "basic" ? 50 : 5

      return {
        ...prev,
        emailCollected: true,
        showEmailPrompt: false,
        limitReached: prev.unlimited ? false : prev.count >= dailyLimit,
      }
    })
  }

  return {
    messageCount: state.count,
    emailCollected: state.emailCollected,
    limitReached: state.limitReached,
    showEmailPrompt: state.showEmailPrompt,
    subscriptionPlan: state.subscriptionPlan,
    unlimited: state.unlimited,
    incrementCount,
    setEmailCollected,
  }
}
