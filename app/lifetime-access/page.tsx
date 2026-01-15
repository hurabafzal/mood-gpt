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
import { Crown } from "lucide-react"
import { getAuth } from "firebase/auth"

export default function LifetimeAccessPage() {
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
          amount: "399.99",
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          plan: "lifetime",
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
          <Card className="border-2 border-[#FFD700]">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-[#FFD700]" />
                <CardTitle>Founder 3 Year Plan</CardTitle>
              </div>
              <CardDescription>
                <span className="font-medium text-amber-600 dark:text-amber-400">MOST VALUABLE OFFER</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay $399.99 for 3 Year Access"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
          <div className="text-center mt-4 text-sm text-muted-foreground">
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
