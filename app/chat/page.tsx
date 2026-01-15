/* app/chat/page.tsx */
"use client"

import React, {
  useState,
  useRef,
  useEffect,
  Suspense,
  FormEvent,
} from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { incrementPromptCount } from "@/lib/usage"
import { ArrowLeft, Send } from "lucide-react"
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { EmailCollection } from "@/components/email-collection"
import { MessageLimit } from "@/components/message-limit"
import { SubscriptionBadge } from "@/components/subscription-badge"

import { useMood } from "@/context/mood-context"
import { useMessageLimit } from "@/hooks/use-message-limit"
import { useAuth } from "@/context/auth-context"

import { getMood, type MoodType } from "@/types/mood"
import { generateChatResponse } from "@/lib/api"

import { getFirestoreDb } from "@/lib/firebase"
import {
  addDoc,
  doc,
  setDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
  getDoc,
} from "firebase/firestore"
import {
  getOrCreateConversation,
  type ConversationInput,
} from "@/lib/conversation"

/* ---------- local types ---------- */
interface Message {
  id: string
  content: string
  is_user: boolean
  timestamp: string
}
type HistoryEntry = { role: "user" | "assistant"; content: string }

/* ------------------------------------------------------------------ */
function ChatContentWithParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCid = searchParams.get("cid")

  const { currentMood, setMood } = useMood()
  const { user, loading: authLoading } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setLH] = useState(false)
  const [isInited, setInited] = useState(false)
  const [cid, setCid] = useState<string | null>(null)


  const [guestPromptCount, setGuestPromptCount] = useState(0)
  const isGuest = !user || user.isAnonymous

  useEffect(() => {
    const count = parseInt(localStorage.getItem("guest_prompt_count") || "0")
    setGuestPromptCount(count)
  }, [])

  function incrementGuestPromptCount() {
    const newCount = guestPromptCount + 1
    localStorage.setItem("guest_prompt_count", newCount.toString())
    setGuestPromptCount(newCount)
  }



  const {
    limitReached,
    // showEmailPrompt,
    incrementCount,
    // setEmailCollected,
    subscriptionPlan,
  } = useMessageLimit()

  // const guestLimitReached = isGuest && limitReached
  // const guestNeedsEmail = isGuest && showEmailPrompt

  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* ---------- session id (client only) ---------- */
  const [sessionId, setSessionId] = useState<string | null>(null)


  useEffect(() => {
    if (typeof window === "undefined") return
    let sid = localStorage.getItem("moodgpt_session_id")
    if (!sid) {
      sid = "session-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10)
      localStorage.setItem("moodgpt_session_id", sid)

    } else {

    }
    setSessionId(sid)
  }, [])

  // ↔️ whenever the URL’s ?cid=… param changes, immediately adopt it
  useEffect(() => {
    const urlCid = searchParams.get("cid")
    if (urlCid) {

      setCid(urlCid)
    } else {
      // Clear cid when no cid in URL to ensure new conversation
      setCid(null)
      setMessages([]) // Clear messages to show fresh chat
    }
  }, [searchParams])

  /* ---------- 0. validate mood ---------- */
  useEffect(() => {
    const moodParam = searchParams.get("mood")

    if (moodParam) {
      try {
        getMood(moodParam as MoodType)
        setMood(moodParam as MoodType)
      } catch (err) {
        console.error("🟥 invalid mood – redirect home", err)
        router.push("/")
        return
      }
    }
    // Only mark “initialized” once we know auth state
    if (!authLoading) {
      setInited(true)
    }
  }, [searchParams, setMood, router, authLoading])

  /* redirect guests once we know auth state */
  useEffect(() => {

    if (authLoading) {

      return
    }
    if (!user && guestPromptCount < 2) {

      return
    }
    if (!user) {
      router.replace("/auth")
      return
    }
  }, [authLoading, user, router])

  /* ---------- 1. ensure / create new conversation ---------- */
  useEffect(() => {
    // Only run creation logic once we know auth + mood + no URL-cid
    if (!isInited || authLoading || !user || !sessionId) return
      ; (async () => {
        const db = await getFirestoreDb()
        if (!db) return

        const existingCid = searchParams.get("cid")


        if (existingCid) {
          setCid(existingCid)

          return
        }

        // Always create a new conversation when no cid is provided
        const convInput: ConversationInput = {
          ownerUid: user.uid,
          moodId: currentMood.id,
          sessionId,
        }
        try {
          const newCid = await getOrCreateConversation(db, convInput, { forceNew: true })

          setCid(newCid)
          router.replace(`/chat?mood=${currentMood.id}&cid=${newCid}`)
        } catch (err) {
          console.error("🟥 getOrCreateConversation failed", err)
          toast.warning(
            "Failed to start a new conversation.",
          )
        }
      })()
  }, [isInited, currentMood.id, user, router, searchParams, sessionId, toast])


  /* ---------- 2. load history ---------- */
  useEffect(() => {
    if (!cid || !user) return // block guest history loading
      ; (async () => {
        setLH(true)

        try {
          const db = await getFirestoreDb()
          if (!db) throw new Error("DB init failed")

          const snap = await getDocs(
            query(
              collection(db, "conversations", cid, "messages"),
              orderBy("timestamp", "asc"),
              limit(100),
            ),
          )
          const loaded = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as any) }) as Message,
          )

          setMessages(loaded)
        } catch (err) {
          console.error("🟥 load history error", err)
          toast.warning(
            "Failed to load chat history, try again later",
          )
        } finally {
          setLH(false)
        }
      })()
  }, [cid, toast])

  /* auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* ---------- helper: save ---------- */
  async function saveMessage(db: Firestore, content: string, isUser: boolean) {
    const messageData: Record<string, any> = {
      content,
      is_user: isUser,
      mood_id: currentMood.id,
      session_id: sessionId,
      platform: "web",
      created_at: serverTimestamp(),
    }
    if (user) {
      messageData["user_id"] = user.uid
      messageData["ownerUid"] = user.uid
    }

    if (user && cid) {
      await addDoc(
        collection(db, "conversations", cid, "messages"),
        { ...messageData, timestamp: serverTimestamp() }
      )
      await setDoc(
        doc(db, "conversations", cid),
        { updatedAt: serverTimestamp() },
        { merge: true }
      )
    } else {
      await addDoc(collection(db, "guest_messages"), messageData)
    }
  }

  /* ---------- 3. send ---------- */
  const handleSend = async (e: FormEvent) => {
    e.preventDefault()

    if (
      !input.trim() ||
      // (isGuest && (limitReached || showEmailPrompt)) ||
      isTyping ||
      isLoadingHistory
    ) return

    if (!user && guestPromptCount >= 2) {
      toast.info(
        "Login Required, Please sign in to continue chatting.",
      )
      router.push("/auth")
      return
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      content: input,
      is_user: true,
      timestamp: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setIsTyping(true)
    if (isGuest) incrementCount()
    if (!user) incrementGuestPromptCount()


    const db = await getFirestoreDb()
    if (!db) {
      console.error("Firestore failed to initialize—cannot save message.")
      return
    }
    // 🚦 Limit prompt count for signed-in users
    if (user && !user.isAnonymous) {
      const userDocRef = doc(db, "users", user.uid)
      const userDocSnap = await getDoc(userDocRef)
      const userData = userDocSnap.data()
      const userPlan = userData?.plan || "free"


      const count = await incrementPromptCount(db, user.uid)


      if (userPlan === "free" && count > 20) {
        toast.info(
          "Upgrade Required, you’ve reached the free prompt limit. Please upgrade."
        )
        router.push("/pricing")
        return
      }

      if (userPlan === "basic" && count > 50) {
        toast.info(
          "Upgrade Required, you’ve reached the free prompt limit. Please upgrade."
        )
        router.push("/pricing")
        return
      }

      if (userPlan === "creator" && count > 363) {
        toast.info(
          "Creater plan only allows 363 messages a day, come back tomorrow to get more messages!"
        )
        setIsTyping(false)
        return
      }
      if (userPlan === "lifetime" && count > 500) {
        toast.info(
          "Founder plan only allows 500 messages a day, come back tomorrow to get more messages!"
        )
        setIsTyping(false)
        return
      }

    }

    // now it's safe to write
    await saveMessage(db, userMsg.content, true)

    // set conversation title from first user prompt
    if (messages.length === 0 && cid) {
      await setDoc(
        doc(db, "conversations", cid),
        { title: userMsg.content.slice(0, 50) },
        { merge: true },
      )
    }

    try {
      const history: HistoryEntry[] = [
        ...messages.map((m) => ({
          role: m.is_user ? "user" : "assistant",
          content: m.content,
        })) as HistoryEntry[],
        { role: "user", content: userMsg.content },
      ]



      const aiText = await generateChatResponse(
        currentMood.systemPrompt ||
        `You are ${currentMood.name}. ${currentMood.tagline}.`,
        history,
      )


      const botMsg: Message = {
        id: Date.now().toString() + "-bot",
        content: aiText,
        is_user: false,
        timestamp: new Date().toISOString(),
      }
      setMessages((m) => [...m, botMsg])
      if (db) await saveMessage(db, botMsg.content, false)
    } catch (err) {
      console.error("🟥 generateChatResponse error", err)
      toast.warning(
        "Failed to generate a response, please try again.",
      )
    } finally {
      setIsTyping(false)
    }
  }

  /* ---------- UI ---------- */
  if (authLoading || !isInited || isLoadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary" />
      </div>
    )
  }


  return (
    <>
      {/* header */}
      <header
        className="py-2 px-6 flex items-center gap-2 border-b"
        style={{ backgroundColor: currentMood.color + "20" }}
      >
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>


        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentMood.emoji}</span>
          <h1 className="font-bold">{currentMood.name}</h1>
        </div>
        <div className="ml-auto">
          <SubscriptionBadge user={user}/>
        </div>
      </header>

      {/* chat */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
        <div className="max-w-3xl w-full mx-auto flex-1 overflow-y-auto">
          <div className="space-y-4 pb-4">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m.content}
                isUser={m.is_user}
                moodClass={`mood-${currentMood.id}`}
              />
            ))}

            {isTyping && (
              <div className={`mood-${currentMood.id} text-left mb-4`}>
                <div className="inline-block px-4 py-2 rounded-lg rounded-tl-none text-[var(--bubble-text)] bg-[var(--bubble-bg)]">
                  <div className="flex gap-1">
                    <div className="animate-bounce">•</div>
                    <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      •
                    </div>
                    <div className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                      •
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* {isGuest && showEmailPrompt && !isTyping && (
              <div className="my-6">
                <EmailCollection
                  onSubmit={(email) => {
                    setEmailCollected()
                    toast.info(

                      "Email Submitted, you now have 3 more messages available!",
                    )
                    fetch("/api/save-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, userId: user?.uid }),
                    }).catch(console.error)
                  }}
                />
              </div>
            )} */}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* input */}
        <div className="max-w-3xl w-full mx-auto pt-4 border-t">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              className="flex-1"
              disabled={
                isTyping
                // || guestLimitReached
                // || guestNeedsEmail 
                // || showEmailPrompt 
                || isLoadingHistory
              }
            />

            <Button
              type="submit"
              disabled={
                isTyping ||
                !input.trim() ||
                // limitReached ||
                // guestLimitReached ||
                // guestNeedsEmail ||
                // showEmailPrompt ||
                isLoadingHistory
              }
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </main>
    </>
  )
}

/* suspense wrapper */
function ChatContent() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading…</div>}>
      <ChatContentWithParams />
    </Suspense>
  )
}

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <ChatContent />
    </div>
  )
}