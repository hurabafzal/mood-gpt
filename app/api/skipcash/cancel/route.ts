import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getFirestore } from "firebase-admin/firestore"
import { adminAuth } from "@/lib/firebase-admin"   // ✅ use exported name

export async function POST(req: NextRequest) {
  try {
    /* 1️⃣ Auth header “Bearer <idToken>” */
    const idToken = req.headers.get("authorization")?.split("Bearer ")[1]
    if (!idToken) return new NextResponse("No token", { status: 401 })

    const decoded = await (adminAuth!).verifyIdToken(idToken)
    const uid = decoded.uid

    /* 2️⃣ Read user document that webhook wrote */
    const userDoc = await getFirestore().doc(`users/${uid}`).get()
    if (!userDoc.exists) return new NextResponse("No user record", { status: 404 })

    const { subscriptionId } = userDoc.data() as { subscriptionId?: string }
    if (!subscriptionId) return new NextResponse("No active subscription", { status: 404 })

    /* 3️⃣ Build SkipCash payload */
    const body = { Id: subscriptionId, KeyId: process.env.SKIPCASH_KEY_ID! }
    const sig = crypto
      .createHmac("sha256", process.env.SKIPCASH_SECRET_KEY!)
      .update(`Id=${body.Id},KeyId=${body.KeyId}`)
      .digest("base64")

    console.log("SkipCash cancel payload:", body)
    console.log("SkipCash cancel signature:", sig)

    /* 4️⃣ Call SkipCash */
    const res = await fetch(
      `${process.env.SKIPCASH_URL || "https://api.skipcash.app"}/api/v1/payments/subscription/cancel`,
      {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: sig },
        body: JSON.stringify(body)
      }
    )
    console.log("SkipCash cancel response:", res.status, res.statusText)


    const json = await res.json()
    console.log("SkipCash cancel JSON:", JSON.stringify(json,null,2))   //  <<< add this
    if (json?.resultObj?.isCancelled) {
      await userDoc.ref.set({ subStatus: "cancelled", cancelledAt: Date.now(), subStatusUpdatedAt: new Date().toISOString() }, { merge: true })
      console.log(`🚫 Recurring Payments Cancelled for user ${uid}`)
      return NextResponse.json({ ok: true })
    }
    console.log("SkipCash cancel response:", json)
    return NextResponse.json({ ok: false, detail: json }, { status: 502 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
