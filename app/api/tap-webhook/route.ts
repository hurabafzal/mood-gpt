import { NextResponse } from "next/server"
import { adminAuth, adminFirestore } from "@/lib/firebase-admin"
import { FieldValue } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const event = await request.json()

    // Validate the webhook payload
    if (!event || !event.status) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    

    // Check if payment was captured and we have customer email
    if (event.status === "CAPTURED" && event.customer?.email) {
      const email = event.customer.email
      const metadata = event.metadata || {}
      const planType = metadata.planType || "creator"

      // Check if Firebase Admin SDK is initialized
      if (!adminAuth || !adminFirestore) {
        console.error("Firebase Admin SDK not initialized. Cannot update user.")
        return NextResponse.json(
          { error: "Firebase Admin SDK not initialized", received: true },
          { status: 200 }, // Still return 200 to acknowledge the webhook
        )
      }

      try {
        // Find the user by email
        const userRecord = await adminAuth.getUserByEmail(email)
        const uid = userRecord.uid

        // Update Firestore document based on plan type
        await adminFirestore
          .collection("users")
          .doc(uid)
          .update({
            plan: planType,
            updatedAt: FieldValue.serverTimestamp(),
            // For lifetime plans, add additional fields
            ...(planType === "lifetime"
              ? {
                  unlimited: true,
                  lifetimePurchaseDate: FieldValue.serverTimestamp(),
                }
              : {}),
          })

        // Set custom claim based on plan type
        await adminAuth.setCustomUserClaims(uid, {
          plan: planType,
          ...(planType === "lifetime" ? { unlimited: true } : {}),
        })

        
      } catch (error) {
        console.error("Error updating user plan:", error)
        // We still return 200 to Tap to acknowledge receipt
      }
    }

    // Always return a 200 response to acknowledge receipt of the webhook
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Tap webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
