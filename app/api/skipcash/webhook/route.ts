// File: app/api/skipcash/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import crypto from "crypto"
import "@/lib/firebase-admin"            // ← makes sure admin SDK is initialised

type SkipCashWebhook = {
  PaymentId: string
  Amount: string
  StatusId: number
  TransactionId: string | null          // we send uid here
  Custom1: string | null                // plan name (creator / pro …)
  VisaId: string
  TokenId: string
  RecurringSubscriptionId: string
}

const ZERO_GUID = "00000000-0000-0000-0000-000000000000"

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SkipCashWebhook
  console.log("🌐 SkipCash webhook received ↴")
  console.log(JSON.stringify(body, null, 2))
  console.log("Full debug payload:", body)

  /* ── 2. Verify HMAC signature ───────────────────────────────── */
  const authHeader = req.headers.get("authorization") ?? ""

  const sigPieces = [
    `PaymentId=${body.PaymentId}`,
    `Amount=${body.Amount}`,
    `StatusId=${body.StatusId}`,
    body.TransactionId ? `TransactionId=${body.TransactionId}` : null,
    body.Custom1 ? `Custom1=${body.Custom1}` : null,
    `VisaId=${body.VisaId}`
  ].filter(Boolean).join(",")

  const expectedSig = crypto
    .createHmac("sha256", process.env.SKIPCASH_WEBHOOK_KEY!)
    .update(sigPieces)
    .digest("base64")

  if (authHeader !== expectedSig) {
    console.warn("❌ Invalid webhook signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  /* ── 3. Idempotency: ignore if we’ve stored this PaymentId already ── */
  const db = getFirestore()
  const payDoc = db.doc(`payments/${body.PaymentId}`)
  const paySnap = await payDoc.get()
  if (paySnap.exists) {
    console.log("↩︎ Duplicate PaymentId, skipping")
    return new NextResponse("OK")
  }
  await payDoc.set({
    receivedAt: Date.now(),
    amount: body.Amount,
    statusId: body.StatusId,
    transactionId: body.TransactionId,
    plan: body.Custom1,
    visaId: body.VisaId,
    tokenId: body.TokenId,
    rawPayload: JSON.stringify(body),

  })  // mark as processed

  /* ── 4. Map TransactionId → uid ─────────────────────────────── */
  const uid = body.TransactionId                 // ensured by payment route
  if (!uid) {
    console.warn("No uid in TransactionId – cannot map payment")
    return new NextResponse("OK")
  }

  /* ── 5. Persist subscription or status update ───────────────── */
  const userRef = db.doc(`users/${uid}`)

  if (body.StatusId === 2 && body.RecurringSubscriptionId !== ZERO_GUID) {
    // first successful charge of a subscription
    await userRef.set(
      {
        plan: body.Custom1 ?? "paid",
        subscriptionId: body.RecurringSubscriptionId,
        subStatus: "active",
        planStartAt: new Date().toISOString(),
        lastPaymentAt: new Date().toISOString(),
        subStatusUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
    console.log(`✅ Stored subscriptionId for user ${uid}`)
  }

  if (body.StatusId === 4) {
    await userRef.set(
      { 
        plan: "free",
        subStatus: "failed",
        subStatusUpdatedAt: new Date().toISOString() 
      },
      { merge: true }
    )
    console.log(`🚫 Monthly Payment Failed for user ${uid}`)
  }

  /* ── 6. All good ─────────────────────────────────────────────── */
  return new NextResponse("OK")
}
