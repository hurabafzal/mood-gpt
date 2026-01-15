"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { firebaseApp, db, auth } from "@/lib/firebase"

export function DebugInfo() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/test")
      const data = await response.json()
      setApiStatus(data)
    } catch (err) {
      setError("Failed to fetch API status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const testFirebase = async () => {
    setLoading(true)
    setError(null)

    // Check Firebase initialization status
    const initStatus = {
      app: !!firebaseApp,
      firestore: !!db,
      auth: !!auth,
      environment: typeof window !== "undefined" ? "client" : "server",
    }

    setFirebaseStatus({
      initialized: initStatus,
      message:
        initStatus.app && initStatus.firestore && initStatus.auth
          ? "Firebase services initialized successfully"
          : "Some Firebase services failed to initialize",
    })

    try {
      const response = await fetch("/api/test-firebase")
      const data = await response.json()
      setFirebaseStatus((prev) => ({
        ...prev,
        apiTest: data,
      }))
    } catch (err) {
      setError("Failed to test Firebase connection")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
        <CardDescription>Check if the APIs are working correctly</CardDescription>
      </CardHeader>
      <CardContent>
        {apiStatus && (
          <div className="space-y-2 mb-4">
            <h3 className="font-semibold">AI API Status:</h3>
            <div>
              <strong>Status:</strong> {apiStatus.status}
            </div>
            <div>
              <strong>Message:</strong> {apiStatus.message}
            </div>
            <div>
              <strong>Deep Infra API Key:</strong> {apiStatus.env.hasDeepInfraKey ? "✅ Present" : "❌ Missing"}
            </div>
            <div>
              <strong>OpenAI API Key:</strong> {apiStatus.env.hasOpenAIKey ? "✅ Present" : "❌ Missing"}
            </div>
            <div>
              <strong>Firebase Config:</strong> {apiStatus.env.hasFirebaseConfig ? "✅ Present" : "❌ Missing"}
            </div>
          </div>
        )}

        {firebaseStatus && (
          <div className="space-y-2">
            <h3 className="font-semibold">Firebase Status:</h3>
            <div>
              <strong>Environment:</strong> {firebaseStatus.initialized.environment}
            </div>
            <div>
              <strong>Firebase App:</strong> {firebaseStatus.initialized.app ? "✅ Initialized" : "❌ Not initialized"}
            </div>
            <div>
              <strong>Firestore:</strong>{" "}
              {firebaseStatus.initialized.firestore ? "✅ Initialized" : "❌ Not initialized"}
            </div>
            <div>
              <strong>Auth:</strong> {firebaseStatus.initialized.auth ? "✅ Initialized" : "❌ Not initialized"}
            </div>
            <div>
              <strong>Message:</strong> {firebaseStatus.message}
            </div>
            {firebaseStatus.apiTest && (
              <>
                <div>
                  <strong>API Connection:</strong> {firebaseStatus.apiTest.connected ? "✅ Connected" : "❌ Failed"}
                </div>
                {firebaseStatus.apiTest.error && (
                  <div className="text-red-500">
                    <strong>API Error:</strong> {firebaseStatus.apiTest.error}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 items-stretch sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button onClick={testApi} disabled={loading} className="flex-1">
          {loading ? "Testing..." : "Test AI API"}
        </Button>
        <Button onClick={testFirebase} disabled={loading} className="flex-1">
          {loading ? "Testing..." : "Test Firebase"}
        </Button>
      </CardFooter>
    </Card>
  )
}
