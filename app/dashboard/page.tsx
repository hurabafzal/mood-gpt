"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { PaymentButton } from "@/components/payment-button"
import { Crown } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

          <div className="grid gap-6 mb-8 md:grid-cols-2">
            {/* Creator Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle>Creator Plan</CardTitle>
                <CardDescription>Monthly subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Unlock premium features with our Creator Plan:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>363 conversations per day</li>
                    <li>Access to all mood personalities</li>
                    <li>Priority support</li>
                  </ul>
                  <div className="pt-4">
                    <PaymentButton plan="creator" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3 Year access Card */}
            <Card className="border-2 border-[#FFD700] relative mt-6 md:mt-0">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10 whitespace-nowrap">
                Limited Time Offer! 🔥
              </div>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[#FFD700]" />
                  <CardTitle>Founder 3 Years Plan</CardTitle>
                </div>
                <CardDescription>
                  <span className="font-medium text-amber-600 dark:text-amber-400">MOST VALUABLE</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold line-through text-gray-400">$799.99</span>
                    <span className="text-2xl font-bold text-green-500 ml-2">$399.99</span>
                    <span className="text-muted-foreground ml-1">once</span>
                  </div>
                  <p className="text-sm text-orange-600 font-medium">50% off - Limited time only!</p>
                  <p>Get 3 year access with one-time payment:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Unlimited</span> conversations for 3 years
                    </li>
                    <li>Priority access to all future updates and tools</li>
                    <li>Founder badge on account</li>
                  </ul>
                  <div className="pt-4">
                    <PaymentButton plan="lifetime" className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-12 text-sm text-muted-foreground max-w-2xl mx-auto">
            <p>
              MoodGPT is an independent product that uses AI models, including OpenAI's GPT API. It is not affiliated
              with or endorsed by OpenAI.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
