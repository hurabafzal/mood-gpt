"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare } from "lucide-react"
import { getAuth } from "firebase/auth"

export default function BasicPlanPage() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.id]: e.target.value })

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
          amount: "9.99",
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          plan: "basic",
          uid: user.uid
        }),
      })
      const data = await res.json()
      if (data?.payUrl) {
        window.location.href = data.payUrl
      } else {
        throw new Error("Invalid response from payment API")
      }
    } catch (err) {
      console.error("Payment error", err)
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-6">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-[#00A86B]">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-[#00A86B]" />
                <CardTitle>Basic Plan</CardTitle>
              </div>
              <CardDescription>50 messages / day • 1-month subscription</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handlePurchase} className="space-y-4">
                {["firstName", "lastName", "email", "phone"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field === "firstName"
                        ? "First Name"
                        : field === "lastName"
                          ? "Last Name"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Input id={field} value={form[field as keyof typeof form]} onChange={handleChange} required />
                  </div>
                ))}

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay $9.99 for 1 Month"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
