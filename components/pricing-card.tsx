"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { PayPalButton } from "./paypal-button"
import { ManualUpgradeButton } from "./manual-upgrade-button"
import Link from "next/link"

interface PricingCardProps {
  name: string
  emoji: string
  price: string
  description: string
  features: string[]
  color: string
  messageLimit?: string
  ctaText?: string
  popular?: boolean
}

export function PricingCard({
  name,
  emoji,
  price,
  description,
  features,
  color,
  ctaText,
  popular = false,
}: PricingCardProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [paypalFailed, setPaypalFailed] = useState(false)

  // Lighten colors for dark mode
  const buttonColor = isDark ? `${color}DD` : color
  const checkColor = isDark ? "#A8C7FA" : color

  // Function to clean up feature text and replace message counts with "Unlimited" for Creator tier
  const processFeatureText = (text: string, planName: string) => {
    // Remove "counts as 1 message" text
    let processedText = text.replace(" (counts as 1 message)", "")

    // Replace message counts with "Unlimited" for Creator tier
    if (planName === "Creator" && processedText.match(/\d+ messages per day/)) {
      processedText = "Unlimited messages"
    }

    return processedText
  }

  // Extract numeric price for PayPal
  const numericPrice = price.startsWith("$") ? price.substring(1) : "0"

  const handlePayPalError = () => {
    //console.log("PayPal failed, showing alternative payment option")
    setPaypalFailed(true)
  }

  return (
    <div
      className={cn(
        "flex flex-col p-6 rounded-2xl border transition-all hover:shadow-lg mood-card bg-white dark:bg-transparent",
        popular && "border-2 shadow-md scale-[1.02]",
      )}
      style={{ borderColor: popular ? color : undefined }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{emoji}</span>
        <h3 className="text-xl font-bold">{name}</h3>
        {popular && (
          <span className="text-xs px-2 py-1 rounded-full text-white ml-auto" style={{ backgroundColor: color }}>
            Popular
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 mr-2 shrink-0 check-icon" style={{ color: checkColor }} />
            <span className="text-sm">{processFeatureText(feature, name)}</span>
          </li>
        ))}
      </ul>

      {name === "Free" ? (
        <Link href="/moods">
          <Button
            className="w-full mt-auto"
            style={
              {
                backgroundColor: buttonColor,
                color: "white",
                "--tw-hover-opacity": "0.9",
              } as React.CSSProperties
            }
          >
            {ctaText || "Get Started"}
          </Button>
        </Link>
      ) : paypalFailed ? (
        <ManualUpgradeButton
          className="w-full mt-auto"
          style={
            {
              backgroundColor: buttonColor,
              color: "white",
              "--tw-hover-opacity": "0.9",
            } as React.CSSProperties
          }
          buttonText={ctaText || "Upgrade Now"}
        />
      ) : (
        <PayPalButton
          amount={numericPrice}
          buttonText={ctaText || "Upgrade Now"}
          className="w-full mt-auto"
          style={
            {
              backgroundColor: buttonColor,
              color: "white",
              "--tw-hover-opacity": "0.9",
            } as React.CSSProperties
          }
          redirectUrl="/upgrade-success"
          onError={handlePayPalError}
        />
      )}
    </div>
  )
}
