"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFailed() {
  const sp     = useSearchParams()
  const reason = sp.get("reason") || "Failed"
  const plan   = sp.get("plan")   || "creator"
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment {reason}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>
              We couldn’t complete your&nbsp;
              {plan === "lifetime" ? "3 Year access" : "subscription"} purchase.
              Your card was declined&nbsp;
              {reason === "FAILED" ? "(code 51 — insufficient funds)" : `(status ${reason})`}.
            </p>
            <Button onClick={() => router.push("/pricing")} className="w-full">
              Try a different card
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
