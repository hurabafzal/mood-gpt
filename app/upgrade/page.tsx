"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getAuth } from "firebase/auth"          // add

export default function UpgradePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const user = getAuth().currentUser
    if (!user) {
      toast({ variant: "destructive", title: "Please sign in first" })
      setIsProcessing(false)
      return
    }

    try {
      const res = await fetch("/api/skipcash/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: "24.99",
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          plan: "creator",
          uid: user.uid 
        }),
      })

      const data = await res.json()
      if (data?.payUrl) {
        window.location.href = data.payUrl
      } else {
        throw new Error("Invalid response from payment API")
      }
    } catch (error) {
      console.error("Payment Error", error)
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive"
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 px-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade to Creator Plan</CardTitle>
              <CardDescription>Get 363 messages per day for just $24.99/month</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Subscribe for $24.99/month"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter />
          </Card>
          <div className="text-center mt-4 text-sm text-muted-foreground">
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
