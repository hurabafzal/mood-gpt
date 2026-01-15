"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle, Sparkles } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const uid = searchParams.get("uid")
  const plan = searchParams.get("plan") || "creator"
  const initialStatus = searchParams.get("status")?.toUpperCase() || "PAID"   
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [checked, setChecked]   = useState(false)   // we polled SkipCash
  const [failed,  setFailed]    = useState(false)   // status === Failed
  const { user, loading, updatePaymentPlan } = useAuth()

  const isLifetime = plan === "lifetime"

  useEffect(() => {
  if (initialStatus === "FAILED" || initialStatus === "CANCELLED") {
    // go straight to the failure page; no need to poll
    router.replace(`/payment-failed?reason=${initialStatus}&plan=${plan}`);
  }
  // If it’s “PAID” or missing we let the normal polling logic run.
}, [initialStatus, plan, router]);


  // useEffect(() => {
  //   if (!loading && user) {
  //     updatePaymentPlan(plan)
  //   }
  // }, [loading, user, plan, updatePaymentPlan])

   // ① redirect to failure page when SkipCash says the charge failed
  useEffect(() => {
       if (checked && failed) return;          // do nothing on failure
    if (!loading && user && checked) {
      updatePaymentPlan(plan)               // only on SUCCESS
      
    }
  }, [loading, user, checked, plan, updatePaymentPlan])

  //-------------------------------------------------------------------
  // Poll the new status route once when the page loads
  useEffect(() => {
     if (initialStatus === "FAILED" || initialStatus === "CANCELLED") return;

  const check = async () => {
      if (!uid) return setChecked(true);
      try {
        const r   = await fetch(`/api/skipcash/status?uid=${uid}`);
        const { status } = await r.json();          // PAID | FAILED | …
        if (initialStatus !== "PAID") {
          setFailed(true);
          router.replace(`/payment-failed?reason=${initialStatus}&plan=${plan}`);
          return;
        }
      } catch { /* ignore */ }
      setChecked(true);
    };
    check();
  }, [uid, plan, router, initialStatus]);
  useEffect(() => {
    if (!loading && user) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push("/profile")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [loading, user, router])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isLifetime ? "bg-amber-100" : "bg-green-100"
                }`}
            >
              {isLifetime ? (
                <Sparkles className="h-6 w-6 text-amber-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              {isLifetime ? "Thank you for purchasing Founder Access" : "Thank you for upgrading to the Creator Plan"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              {isLifetime
                ? "Your account has been upgraded with unlimited access. You now have unlimited messages and access to all features."
                : "Your account has been upgraded. You now have access to all premium features."}
            </p>
            <p className="text-sm text-muted-foreground mb-6">Redirecting to profile in {countdown} seconds...</p>
            <Button onClick={() => router.push("/profile")} className="w-full">
              Return to Profile
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
