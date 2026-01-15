"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FiCheck, FiX } from "react-icons/fi"        // ✓ / ✕ icons
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"


type AuthMode = "signin" | "signup"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<AuthMode>("signin")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailValid, setEmailValid] = useState<null | boolean>(null)
  const [retryPlanned, setRetryPlanned] = useState(false)
  const [emailMsg, setEmailMsg] = useState("")
  const [show, setShow] = useState(false)

  async function authOrThrow(): Promise<Auth> {
    const auth = await getFirebaseAuth()
    if (!auth) throw new Error("Firebase Auth failed to initialize.")
    return auth
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (emailValid === false) {
      toast.info(
        // title: "Invalid e-mail",
        "Please enter a working address first.",
        // variant: "destructive",
      )
      return
    }
    setLoading(true)

    try {
      const auth = await authOrThrow()

      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password)
        toast.success(

          "Your account has been created successfully. Please sign in.",
        )
        setEmail("")
        setPassword("")
        setEmailValid(null)
        try {
          await signOut(auth);
          // //console.log("Signed out Successfully")
        } catch (signOutError) {
          console.warn("Failed to sign out after signup:", signOutError);
        }
        setMode("signin")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success(

          "You have been signed in successfully.",
        )
        router.push("/")
      }
    } catch (err: any) {
      console.debug("Auth error code:", err.code, err.message)

      let title = "Authentication error"
      let description = "Something went wrong. Please try again."

      switch (err.code) {
        case "auth/user-not-found":
          title = "No account found"
          description =
            "No account exists with that email. Please create one first."
          break

        case "auth/wrong-password":
        case "auth/invalid-credential":
          // handle both codes as “bad email/password combo”
          title = "Invalid credentials"
          description = "The email or password is incorrect. Please try again."
          break

        case "auth/invalid-email":
          title = "Invalid email"
          description = "The email address you entered is not valid."
          break

        case "auth/weak-password":
          title = "Weak password"
          description = "Password should be at least 6 characters long."
          break
        case "auth/email-already-in-use":
          title = "User exist"
          description = "This email is already registered. Please sign in."
          setEmail("")
          setPassword("")
          setMode("signin")
          break

        default:
          description = description || err.message
      }
      toast.info(
        description
      )
    } finally {
      setLoading(false)
    }
  }
  /** Kickbox – runs when the field loses focus */
  async function verifyEmail() {
    if (!email) return
    try {
      setCheckingEmail(true)
      // ---- 8-second abort controller ------------------------
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
        setEmailMsg("") // clear any previous error
      } else {
        // setEmailValid(false)
        // const reason =
        //   data?.kb?.reason?.replace(/_/g, " ") ||
        //   "Address can’t receive mail"
        // setEmailMsg(reason.charAt(0).toUpperCase() + reason.slice(1))

        // -------- timeout from the backend?
        if (data.error === "timeout") {
          toast.info(
            "Kickbox is taking too long. We’ll try again in a few seconds…",
          )
          // auto-retry once after 3 s
          setTimeout(() => verifyEmail(), 3_000)
          return
        }

        // -------- normal deliverability failure
        setEmailValid(false)
        const reason =
          data?.kb?.reason?.replace(/_/g, " ") ||
          "Address can’t receive mail"
        setEmailMsg(reason.charAt(0).toUpperCase() + reason.slice(1))
        // ✅ ADD TOAST HERE
        toast.error("Please enter a working address first.")
      }
    } catch (err: any) {
      console.error("Kickbox verify failed:", err)
      // Fail open: allow the user, but warn
      // setEmailValid(true)
      // toast({
      //   title: "Validation unavailable",
      //   description: "We couldn’t validate your email right now.",
      // })
      if (err.name === "AbortError") {
        // ------- timeout branch -----------------------------
        toast.info(
          "E-mail check taking too long, we’ll try again automatically…",
        )
        // one automatic retry after 3 s (only once)
        if (!retryPlanned) {
          setRetryPlanned(true)
          setTimeout(() => {
            setRetryPlanned(false)
            verifyEmail()                      // 🔁 retry
          }, 3000)
        }
      } else {
        // ------- other errors (Kickbox down, network, …) ----
        toast.warning(
          "Validation unavailable, we couldn’t validate your email right now.",
        )
        setEmailValid(true)                    // fail-open
      }
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      const auth = await authOrThrow()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      console.debug("🔑 Google sign-in result:", result.user)
      toast.success(
        "Welcome!, You have been signed in with Google successfully.",
      )
      router.push("/")
    } catch (err: any) {
      console.debug("Google auth error:", err.code, err.message)
      toast.error(
        "Failed to authenticate with Google. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "signin" ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Sign in to access your account and chat history"
            : "Create a new account to save your chats and preferences"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  const value = e.target.value
                  setEmail(value)

                  if (emailValid !== null) {
                    setEmailValid(null)
                    setEmailMsg("")
                  }
                }}
                required
                onBlur={verifyEmail}  // ← kickbox check on field blur
              />
              {/* icon overlay */}
              {email && emailValid !== null && !checkingEmail && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                  {emailValid ? (
                    <FiCheck className="text-emerald-500" />
                  ) : (
                    <FiX className="text-destructive" />
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">


            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 p-1"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div >
          </div>
          <Button type="submit" className="w-full" disabled={loading || checkingEmail || emailValid === false}>
            {loading
              ? "Processing..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}
        </div>
        <Button
          variant="link"
          className="w-full"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          disabled={loading}
        >
          {mode === "signin" ? "Create an account" : "Sign In"}
        </Button>
      </CardFooter>
    </Card>
  )
}
