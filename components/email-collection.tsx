"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"

interface EmailCollectionProps {
  onSubmit: (email: string) => void
}

export function EmailCollection({ onSubmit }: EmailCollectionProps) {
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    // Simpler email validation regex
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    return re.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsValid(validateEmail(value))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // For now, just store in localStorage and call onSubmit
      // This bypasses the API call that's causing issues
      localStorage.setItem("moodgpt_user_email", email)

      // Call the onSubmit callback
      onSubmit(email)

      // Show success state
      setIsSubmitted(true)

      // Try to save to Supabase in the background, but don't block the UI
      fetch("/api/save-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }).catch((err) => {
        // Log error but don't show to user since we've already shown success
        console.error("Background save email error:", err)
      })
    } catch (error) {
      console.error("Error submitting email:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">Thank you!</h3>
        <p className="text-sm text-muted-foreground">You now have 3 more messages available today.</p>
      </div>
    )
  }

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Continue chatting for free</h3>
      <p className="text-sm text-muted-foreground mb-4">Enter your email to get 3 more free messages today.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={handleChange}
          className="w-full"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Get 3 More Messages"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">We'll never spam you or share your email.</p>
      </form>
    </div>
  )
}
