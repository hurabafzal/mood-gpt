"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function UpgradeSuccessPage() {
  // Set the subscription status in localStorage
  useEffect(() => {
    localStorage.setItem(
      "moodgpt_subscription",
      JSON.stringify({
        plan: "creator",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      }),
    )

    // Reset message count to allow for more messages
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    localStorage.setItem(
      "moodgpt_message_limit",
      JSON.stringify({
        count: 0,
        emailCollected: true,
        date: today,
      }),
    )
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-800">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Upgrade Successful!</h1>
          <p className="text-xl mb-8">You now have access to the Creator plan with 363 messages per day.</p>
          <Link href="/">
            <Button size="lg">Start Chatting</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
