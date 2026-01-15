"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

type PlanOption = "creator" | "lifetime"

interface PaymentButtonProps {
  plan?: PlanOption
  className?: string
}

export function PaymentButton({ plan = "creator", className = "" }: PaymentButtonProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const planDetails = {
    creator: {
      name: "Creator Plan",
      amount: 9.99,
      buttonText: "Upgrade to Creator Plan ($9.99)",
    },
    lifetime: {
      name: "Lifetime Access",
      amount: 399.99,
      buttonText: "Get 3 Year Access ($399.99)",
    },
  }

  const handlePayment = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/create-tap-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          amount: planDetails[plan].amount,
          planType: plan,
        }),
      })

      if (!response.ok) {
        throw new Error("Payment initiation failed")
      }

      const data = await response.json()

      // Redirect to Tap payment page
      window.location.href = data.url
    } catch (error) {
      console.error("Payment error:", error)
      alert("Failed to initiate payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !user}
      className={`${
        plan === "lifetime"
          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      } ${className}`}
    >
      {isLoading ? "Processing..." : planDetails[plan].buttonText}
    </Button>
  )
}
