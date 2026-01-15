// File: app/api/skipcash/payment/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
// import { v4 as uuidv4 } from "uuid";
import { console } from "inspector";
import dayjs from "dayjs";
const SKIPCASH_URL = process.env.SKIPCASH_SANDBOX_URL || "https://api.skipcash.app";
const SKIPCASH_KEY_ID = process.env.SKIPCASH_KEY_ID!;
const SKIPCASH_SECRET_KEY = process.env.SKIPCASH_SECRET_KEY!;
const SKIPCASH_RETURN_URL = process.env.SKIPCASH_RETURN_URL!;
const SKIPCASH_WEBHOOK_URL = process.env.SKIPCASH_WEBHOOK_URL!;
export async function POST(req: Request) {
  try {
    const { amount, firstName, lastName, phone, email, plan, uid } = await req.json();
    // const uid = uuidv4();
    // const transactionId = `txn-${Date.now()}`;

    if (!uid) {
      return NextResponse.json({ error: "UID missing" }, { status: 400 })
    }
    const formattedPhone = phone.startsWith("966") ? phone : "966" + phone.replace(/^0+/, "");
    const returnUrl = `${SKIPCASH_RETURN_URL}?plan=${plan}&uid=${uid}`;
    const startDate = dayjs().format("YYYY-MM-DD");
    const endDate = dayjs().add(1, "year").format("YYYY-MM-DD");
    const payload = {
      Uid: uid,
      KeyId: SKIPCASH_KEY_ID,
      Amount: amount,
      FirstName: firstName,
      LastName: lastName,
      Phone: formattedPhone,
      Email: email,
      TransactionId: uid,
      Custom1: plan,
      returnUrl: returnUrl,
      webhookUrl: SKIPCASH_WEBHOOK_URL,
      "isRecurring": true,
      "planName": plan,
      "frequency": "1",
      "interval": "month",
      startDate,
      endDate,
      "allowedFailedAttempts": "3",
      // "firstPaymentAmount": "1.00",
    };
    console.log("SkipCash Payment Payload:", payload);
    const sigString =
      `Uid=${payload.Uid},` +
      `KeyId=${payload.KeyId},` +
      `Amount=${payload.Amount},` +
      `FirstName=${payload.FirstName},` +
      `LastName=${payload.LastName},` +
      `Phone=${payload.Phone},` +
      `Email=${payload.Email},` +
      `TransactionId=${payload.TransactionId},` +
      `Custom1=${payload.Custom1}`;
    console.log("SkipCash Signature String:", sigString);
    const secretKey = SKIPCASH_SECRET_KEY;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(sigString)
      .digest("base64");
    console.log("SkipCash Signature:", signature);
    const res = await fetch(`${SKIPCASH_URL}/api/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: signature,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("SkipCash Response Status:", res.status);
    console.log("SkipCash Response Headers:", res.headers);
    const data = await res.json();
    console.log("SkipCash Response Data:", data);
    if (data.resultObj?.payUrl) {
      return NextResponse.json({ payUrl: data.resultObj.payUrl, res });
    }
    console.log("SkipCash Error Data:", data);
    console.log("resultobject", data.resultObj);
    console.log("resultobject payUrl", data.resultObj?.payUrl);
    return NextResponse.json({ error: "SkipCash error", details: data }, { status: 500 });
  } catch (err: any) {
    console.error("fatal:", err);
    return NextResponse.json({ error: "Internal error", details: err.message }, { status: 500 });
  }
}
