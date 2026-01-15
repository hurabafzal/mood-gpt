import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API route is working",
    env: {
      hasDeepInfraKey: !!process.env.DEEPINFRA_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasFirebaseConfig: !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ),
    },
  })
}
