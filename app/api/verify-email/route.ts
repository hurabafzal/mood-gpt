// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import { kickboxVerify } from "@/lib/email-validations";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "No e-mail supplied" }, { status: 400 });
    }

    const kb = await kickboxVerify(email);

    /* In sandbox mode Kickbox always returns “deliverable”.
       We still send the full payload so you can inspect `reason` in the client. */
    return NextResponse.json({ ok: kb.result === "deliverable", kb });
  } catch (err: any) {
    console.error("Kickbox API error:", err);
        if (err.message === "timeout") {
      return NextResponse.json({ ok: false, error: "timeout" }, { status: 504 });
    }
    return NextResponse.json({ ok: false, error: "verify-failed" }, { status: 500 });
  }
}
