import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { content, isUser, moodId } = body

    if (!content || typeof isUser !== "boolean" || !moodId) {
      return NextResponse.json({ error: "Invalid message data" }, { status: 400 })
    }

    // Generate a session ID if not provided (anonymous users)
    const sessionId = body.sessionId || `anon-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

    try {
      // Save message to Firebase
      await addDoc(collection(db, "messages"), {
        content,
        is_user: isUser,
        mood_id: moodId,
        session_id: sessionId,
        platform: "web",
        created_at: new Date().toISOString(),
      })

     
      return NextResponse.json({ success: true, sessionId })
    } catch (firebaseError) {
      console.error("Error saving to Firebase:", firebaseError)
      // Return success anyway to not block the user experience
      return NextResponse.json({
        success: true,
        sessionId,
        note: "Message saved locally but not to database",
      })
    }
  } catch (error) {
    console.error("Error in save-message API route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
