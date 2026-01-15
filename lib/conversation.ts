/* lib/conversation.ts -------------------------------------------------- */
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore"

export interface ConversationInput {
  ownerUid : string        // signed-in user id
  moodId   : string        // "funny", "sarcastic", …
  sessionId: string        // anonymous browser session
}

/**
 * Returns the id of an existing conversation (ownerUid + moodId)
 * or creates a new one.  ⇒  ALWAYS logs what it does!
 */
export async function getOrCreateConversation(
  db: Firestore,
  { ownerUid, moodId, sessionId }: ConversationInput,
  options: { forceNew?: boolean } = {},
): Promise<string> {
  //console.log("[conv] get/create →", { ownerUid, moodId, sessionId, forceNew: options.forceNew })

  
  // 🟢 Skip conversation creation for guests
  if (!ownerUid) {
    //console.log("[conv] guest user – skip conversation creation")
    return ""
  }

  // 1 — unless forceNew, try to reuse an existing
  if (!options.forceNew) {
    const q = query(
      collection(db, "conversations"),
      where("moodId", "==", moodId),
      where(ownerUid ? "ownerUid" : "sessionId", "==", ownerUid ?? sessionId),
      limit(1),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      //console.log("[conv] re-use →", snap.docs[0].id)
      return snap.docs[0].id
    }
  }

  // 2 — nothing found or forceNew → create new
  try {
    const docRef = await addDoc(collection(db, "conversations"), {
      ownerUid,
      moodId,
      sessionId,
      title: "New chat",                // default title
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    //console.log("[conv] created →", docRef.id)
    return docRef.id
  } catch (err) {
    console.error("[conv] create FAILED ❌", err)
    throw err  // bubble up so caller can handle
  }
}
