"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, CheckCircle } from "lucide-react"
import { FiCheck, FiX } from "react-icons/fi"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailValid, setEmailValid] = useState<null | boolean>(null)
  const [retryPlanned, setRetryPlanned] = useState(false)
  const [emailMsg, setEmailMsg] = useState("")

async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (emailValid === false) {
      toast.info("Please enter a working address first.")
      return
    }
    try {
      setIsSubmitting(true)
      await sendPasswordResetEmail(auth!, email, {
        url: `${process.env.NEXT_PUBLIC_APP_URL}auth`,
        handleCodeInApp: true,
      })
      setIsSubmitting(false)
      setEmailVerified(true)
      setIsSubmitted(true)
      toast.success("Password reset email sent! Please check your inbox.")
    } catch (err: any) {
    }
    console.log("Forgot password email submitted:", email)
  }

  async function verifyEmail(email: string) {
    if (!email) return
    try {
      setCheckingEmail(true)
      const ac = new AbortController()
      const id = setTimeout(() => ac.abort(), 8000)

      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: ac.signal,
      })

      const data = await res.json()
      clearTimeout(id)

      if (data.ok) {
        setEmailValid(true)
        setEmailMsg("")
      } else if (data.error === "timeout") {
        toast.info("Kickbox is taking too long. Retrying in a few seconds…")
        setTimeout(() => verifyEmail(email), 3000)
        return
      } else {
        setEmailValid(false)
        const reason =
          data?.kb?.reason?.replace(/_/g, " ") || "Address can’t receive mail"
        setEmailMsg(reason.charAt(0).toUpperCase() + reason.slice(1))
        toast.error("Please enter a working address first.")
      }
    } catch (err: any) {
      console.error("Kickbox verify failed:", err)
      if (err.name === "AbortError") {
        toast.info("E-mail check taking too long. Retrying...")
        if (!retryPlanned) {
          setRetryPlanned(true)
          setTimeout(() => {
            setRetryPlanned(false)
            verifyEmail(email)
          }, 3000)
        }
      } else {
        toast.warning("Validation unavailable at the moment.")
        setEmailValid(true)
      }
    } finally {
      setCheckingEmail(false)
    }
  }

  return (
<div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md mx-auto py-1">

            <CardHeader className="text-center space-y-4">
              <CardTitle className="">Reset your password</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Email Sent</h2>
                  <p className="text-muted-foreground mb-6">
                    We've sent an email with instructions to reset your password.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (emailValid !== null) {
                            setEmailValid(null)
                            setEmailMsg("")
                          }
                        }}
                        onBlur={() => verifyEmail(email)}
                        required
                      />
                      {email && emailValid !== null && !checkingEmail && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                          {emailValid ? (
                            <FiCheck className="text-emerald-500" />
                          ) : (
                            <FiX className="text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bg"
                    disabled={isSubmitting || checkingEmail || emailValid === false}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className={`w-full flex justify-center px-4`}>
              {emailVerified ? (
                <Link href="/auth" className="w-full max-w-sm">
                  <Button className="w-full">Back to Sign In</Button>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  <Link href="/auth" className="font-medium text-primary hover:text-primary/80">
                    Back to Sign In
                  </Link>
                </p>
              )}
            </CardFooter>

          </Card>
        </div>
      </main >
      <Footer />
    </div >
  )
}
