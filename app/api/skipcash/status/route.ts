import { NextRequest, NextResponse } from "next/server";

const SKIPCASH_URL  = process.env.SKIPCASH_URL || "https://api.skipcash.app";
const SKIPCASH_KEY  = process.env.SKIPCASH_KEY_ID!;     // merchant ID

export async function GET(req: NextRequest) {
  const uid = new URL(req.url).searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid missing" }, { status: 400 });

  // SkipCash “Get payment by Uid” — docs show /payments/{Uid}?keyId=...
  const r  = await fetch(`${SKIPCASH_URL}/api/v1/payments/${uid}?keyId=${SKIPCASH_KEY}`);
   
  if (!r.ok) {
    return NextResponse.json({ error: "lookup failed" }, { status: 502 });
  }
  const json = await r.json();
  // json.resultObj.status = "success" | "failed" | "new" …
  const payment = json.resultObj ?? {};
  return NextResponse.json({
    status:      payment.status?.toUpperCase() || "UNKNOWN",
    reasonCode:  payment.reasonCode ?? null,
  });
}
