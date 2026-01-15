import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json().catch(() => ({}))
    const { email } = body

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Simple email validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

  

    try {
      // Save email to Firebase
      await addDoc(collection(db, "emails"), {
        email,
        created_at: new Date().toISOString(),
      })

     
    } catch (firebaseError) {
      console.error("Error saving to Firebase:", firebaseError)
      // Continue even if there's an error with Firebase
    }

    // Return success regardless of Firebase status
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in save-email API route:", error)
    // Return success anyway since we're storing in localStorage on the client
    return NextResponse.json({ success: true, note: "Error occurred, but email stored locally" })
  }
}
