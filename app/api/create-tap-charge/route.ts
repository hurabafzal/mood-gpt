import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { uid, email, amount, planType = "creator" } = await request.json()

    // Validate required fields
    if (!uid || !email || !amount) {
      return NextResponse.json({ error: "Missing required fields: uid, email, or amount" }, { status: 400 })
    }

    // Create a charge with Tap Payments API
    const response = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: "USD",
        customer: {
          email,
          first_name: "MoodGPT",
          last_name: "User",
        },
        source: {
          id: "src_all",
        },
        redirect: {
          url: `https://yourdomain.com/payment-success?uid=${uid}&plan=${planType}`,
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tap-webhook`,
        },
        metadata: {
          uid,
          planType,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Tap API error:", errorData)
      return NextResponse.json({ error: "Failed to create charge with Tap Payments" }, { status: response.status })
    }

    const data = await response.json()

    // Return the transaction URL to redirect the user
    return NextResponse.json({ url: data.transaction.url })
  } catch (error) {
    console.error("Error creating Tap charge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
