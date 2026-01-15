import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, limit, query } from "firebase/firestore"

export async function GET() {
  try {
    // Check if Firestore is available
    if (!db) {
      return NextResponse.json({
        connected: false,
        error:
          "Firestore is not available. This might be because you're in a server environment or Firebase initialization failed.",
      })
    }

    // Test Firebase connection by trying to fetch a document
    const testQuery = query(collection(db, "emails"), limit(1))

    try {
      const snapshot = await getDocs(testQuery)

      return NextResponse.json({
        connected: true,
        collections: ["emails", "messages"], // These are the collections we're using
        documentCount: snapshot.size,
      })
    } catch (queryError) {
      console.error("Error querying Firebase:", queryError)
      return NextResponse.json({
        connected: false,
        error: queryError instanceof Error ? queryError.message : "Error querying database",
      })
    }
  } catch (error) {
    console.error("Error testing Firebase connection:", error)
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
