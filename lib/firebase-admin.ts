import * as admin from "firebase-admin"

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App | undefined
let adminAuth: admin.auth.Auth | undefined
let adminFirestore: admin.firestore.Firestore | undefined

try {
  // Check if we have the required environment variables
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn("Firebase Admin SDK initialization skipped: Missing environment variables")
  } else {
    // Initialize the app if it hasn't been initialized already
    if (!admin.apps.length) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      })
    } else {
      firebaseAdmin = admin.app()
    }

    // Initialize Auth and Firestore
    adminAuth = admin.auth()
    adminFirestore = admin.firestore()
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error)
}

export { firebaseAdmin, adminAuth, adminFirestore }
