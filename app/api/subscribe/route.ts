import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // In a real application, you would store this email in a database
    // For now, we'll just log it and return success
    

    // If you have Mailchimp integration, you could add the email to your list here

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing subscription:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
