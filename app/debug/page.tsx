import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DebugInfo } from "@/components/debug-info"
import { db, app } from "@/lib/firebase"

export default function DebugPage() {
  // Check Firebase initialization status
  const firebaseInitialized = !!app
  const firestoreInitialized = !!db

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
          <p className="mb-6">Use this page to troubleshoot issues with the application.</p>

          <div className="mb-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <h2 className="text-lg font-semibold mb-2">Firebase Initialization Status</h2>
            <div className="space-y-1">
              <p>
                <strong>Firebase App:</strong> {firebaseInitialized ? "✅ Initialized" : "❌ Not initialized"}
              </p>
              <p>
                <strong>Firestore:</strong> {firestoreInitialized ? "✅ Initialized" : "❌ Not initialized"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Note: Firebase services are only initialized in browser environments. Server-side rendering will show
                these as not initialized.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <DebugInfo />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Common Issues</h2>
            <div className="space-y-2">
              <h3 className="font-medium">1. "Service firestore is not available" Error</h3>
              <p>
                This error typically occurs when trying to use Firestore in a server component or when Firebase is not
                properly initialized. Make sure you're only using Firestore in client components or API routes.
              </p>

              <h3 className="font-medium mt-4">2. Missing API Keys</h3>
              <p>
                Make sure you have set either the DEEPINFRA_API_KEY or OPENAI_API_KEY environment variable in your
                deployment.
              </p>

              <h3 className="font-medium mt-4">3. Firebase Configuration</h3>
              <p>Ensure all Firebase environment variables are set correctly in your deployment:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
              </ul>

              <h3 className="font-medium mt-4">4. API Route Issues</h3>
              <p>Check if the API routes are working by using the Test API Connection button above.</p>

              <h3 className="font-medium mt-4">5. CORS Issues</h3>
              <p>If you're seeing CORS errors in the console, make sure your API routes are properly configured.</p>

              <h3 className="font-medium mt-4">6. Environment Variables</h3>
              <p>
                Remember that environment variables need to be set in your deployment platform (Vercel, Netlify, etc.).
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
