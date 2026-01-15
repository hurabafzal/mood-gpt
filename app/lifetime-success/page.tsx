"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Crown } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const uid = searchParams.get("uid")
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-[#FFD700]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Crown className="h-6 w-6 text-[#FFD700]" />
            </div>
            <CardTitle className="text-2xl">Welcome, Founder!</CardTitle>
            <CardDescription>Your 3 Years Access is now active</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Congratulations! You now have 3 Years access to MoodGPT with all premium features and future
              updates.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Your Founder badge is now active on your account.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Redirecting to dashboard in {countdown} seconds...</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
