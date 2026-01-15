"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "react-toastify"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { EyeOff, Eye } from "lucide-react"
export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const oobCode = searchParams.get("oobCode")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    useEffect(() => {
        if (!oobCode) {
            setError("Missing reset code.")
            setLoading(false)
            return
        }
        verifyPasswordResetCode(auth!, oobCode)
            .then((email) => {
                setEmail(email)
                setLoading(false)
            })
            .catch(() => {
                setError("The password reset link is invalid or has expired.")
                setLoading(false)
            })
    }, [oobCode])
    async function handleReset(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.")
            return
        }
        try {
            await confirmPasswordReset(auth!, oobCode!, newPassword)
            setIsSubmitted(true)
            router.push("/auth")
        } catch (err: any) {
            toast.error("Something went wrong. Please try again.")
        }
    }
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center py-12">
                <div className="w-full max-w-md px-4">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold gradient-text">Reset your password</h1>
                        <p className="mt-2 text-muted-foreground">
                            {loading
                                ? "Checking link..."
                                : error
                                    ? error
                                    :
                                    `Enter your new password for ${email}`
                            }
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        {/* {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Password Reset</h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been successfully changed.
                </p>
                <Link href="/auth">
                  <Button className="w-full">Back to Sign In</Button>
                </Link>
              </div>
            ) : !loading && !error ? ( */}
                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showNew ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-0 right-0 p-1"
                                        onClick={() => setShowNew((s) => !s)}
                                        aria-label={showNew ? "Hide password" : "Show password"}
                                    >
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-0 right-0 p-1"
                                        onClick={() => setShowConfirm((s) => !s)}
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full gradient-bg">
                                Reset Password
                            </Button>
                        </form>
                        {/* ) : null} */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                <Link href="/auth" className="font-medium text-primary hover:text-primary/80">
                                    Back to Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}