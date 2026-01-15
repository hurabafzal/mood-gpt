"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { moods } from "@/types/mood"
import { useTheme } from "next-themes"
import { toast } from "react-toastify"
import { getAuth } from "firebase/auth"               
import { Dialog, DialogContent, DialogHeader, DialogTitle,
          DialogDescription,                       // ← keep its name
          DialogFooter as DFooter }                // ← alias the footer
          from "@/components/ui/dialog"


export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: false,
    defaultMood: "",
    saveHistory: true,
    theme: "system",
  })
  const router = useRouter()
  const { setTheme } = useTheme()
  const [plan, setPlan] = useState("Free")

  /* === added dialog state */
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelBusy, setCancelBusy] = useState(false)

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [loading, user, router])

  // Load user preferences
  useEffect(() => {
    if (!user) return

    const loadPreferences = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();

          // Set preferences
          if (data.preferences) {
            const userPrefs = data.preferences;
            setPreferences({
              emailNotifications: userPrefs.emailNotifications ?? false,
              defaultMood: userPrefs.defaultMood || "",
              saveHistory: userPrefs.saveHistory ?? true,
              theme: userPrefs.theme || "system",
            });

            if (userPrefs.theme) {
              setTheme(userPrefs.theme);
            }
          }

          // ✅ Set plan from Firestore
          if (data.plan) {
            setPlan(data.plan);
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    }

    loadPreferences()
  }, [user, setTheme])

  const savePreferences = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          preferences: preferences,
        })
      } else {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          preferences: preferences,
        })
      }

      toast.info(
        "Settings saved,Your preferences have been updated successfully.",
      )
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast.warn(
        "Failed to save your preferences. Please try again.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleThemeChange = (theme: string) => {
    setPreferences((prev) => ({ ...prev, theme }))
    setTheme(theme)
  }

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

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
            </TabsList>

            <TabsContent value="preferences">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Customize the appearance of the application</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <Button
                      variant={preferences.theme === "light" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24 w-full"
                      onClick={() => handleThemeChange("light")}
                    >
                      <div className="w-12 h-12 rounded-full bg-white border mb-2"></div>
                      <span>Light</span>
                    </Button>
                    <Button
                      variant={preferences.theme === "dark" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24 w-full"
                      onClick={() => handleThemeChange("dark")}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-900 border mb-2"></div>
                      <span>Dark</span>
                    </Button>
                    <Button
                      variant={preferences.theme === "system" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24 w-full"
                      onClick={() => handleThemeChange("system")}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-white to-gray-900 border mb-2"></div>
                      <span>System</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Default Mood</CardTitle>
                    <CardDescription>Choose your default AI personality</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {moods.map((mood) => (
                      <Button
                        key={mood.id}
                        variant={preferences.defaultMood === mood.id ? "default" : "outline"}
                        className="flex items-center justify-start gap-2 h-auto py-3"
                        onClick={() => setPreferences((prev) => ({ ...prev, defaultMood: mood.id }))}
                        style={
                          preferences.defaultMood === mood.id ? { backgroundColor: mood.color, color: "white" } : {}
                        }
                      >
                        <span className="text-xl">{mood.emoji}</span>
                        <span>{mood.name}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account details and subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base">Email</Label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-base">Account Type</Label>
                    <p className="text-sm text-muted-foreground">{plan} Plan</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/pricing">Upgrade Plan</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Control how and when we contact you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-base">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Receive updates, tips, and special offers</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {/* ACTION ROW ------------------------------------------------------- */}
          <div className="mt-6 flex justify-end gap-3">
            {/* Cancel button – show only if user is on a paid plan */}
            {plan !== "Free" && (
              <Button
                variant="destructive"
                onClick={() => setCancelOpen(true)}
                disabled={cancelBusy}
              >
                Cancel subscription
              </Button>
            )}

            {/* <div className="mt-6 flex justify-end"> */}
            <Button onClick={savePreferences} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      {/* CONFIRMATION DIALOG ------------------------------------------------- */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop recurring payments?</DialogTitle>
            <DialogDescription>
              Your recurring billing with SkipCash will be cancelled. You can
              resubscribe any time.
            </DialogDescription>
          </DialogHeader>

          <DFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelBusy}
            >
              Keep plan
            </Button>
            <Button
              variant="destructive"
              disabled={cancelBusy}
              onClick={async () => {
                try {
                  setCancelBusy(true)
                  const cur = getAuth().currentUser
                  if (!cur) throw new Error("Not signed in")

                  const idToken = await cur.getIdToken()
                  const res = await fetch("/api/skipcash/cancel", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${idToken}` },
                  })

                  if (res.ok) {
                    toast.info("Cancellation requested" )
                    /* <- no local plan change; Firestore + webhook will update */
                  } else {
                    toast.info("Could not cancel" )
                  }
                } catch (err: any) {
                  toast(
                     "Unknown error",
                  )
                } finally {
                  setCancelBusy(false)
                  setCancelOpen(false)
                }
              }}
            >
              {cancelBusy ? "Cancelling…" : "Yes, cancel"}
            </Button>
          </DFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
