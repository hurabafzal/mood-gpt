// components/chat-sidebar.tsx
"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useMood } from "@/context/mood-context"
import { getFirestoreDb } from "@/lib/firebase"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { toast } from "react-toastify"
import { MoreVertical, Trash2 } from "lucide-react"
import { doc, deleteDoc } from "firebase/firestore"
import { useSearchParams } from "next/navigation"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as limitTo,
  onSnapshot,
} from "firebase/firestore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import { MessageSquarePlus, Search, X, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { getOrCreateConversation, type ConversationInput } from "@/lib/conversation"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { currentMood } = useMood()
  const { user, loading: authLoading } = useAuth()
  const [convs, setConvs] = useState<
    { id: string; title?: string; updatedAt: any }[]
  >([])

  const [sessionId, setSessionId] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window === "undefined") return
    let sid = localStorage.getItem("moodgpt_session_id")
    if (!sid) {
      sid = "session-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10)
      localStorage.setItem("moodgpt_session_id", sid)
      //console.log(":large_yellow_circle: generated sessionId", sid)
    } else {
      //console.log(":large_yellow_circle: loaded sessionId", sid)
    }
    setSessionId(sid)
  }, [])

  // Fetch the 10 most recent conversations for this user + mood
  useEffect(() => {
    if (!user) return
    let unsubscribe: () => void
      ; (async () => {
        const db = await getFirestoreDb()
        if (!db) return
        const q = query(
          collection(db, "conversations"),
          where("ownerUid", "==", user.uid),
          where("moodId", "==", currentMood.id),
          orderBy("updatedAt", "desc"),
          limitTo(10)
        )
        // const snap = await getDocs(q)
        // setConvs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
        unsubscribe = onSnapshot(q, (snapshot) => {
          setConvs(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
        })

      })()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, currentMood.id])
  59
  async function startNewConversation() {
    if (!user || authLoading || !sessionId) return
    const db = await getFirestoreDb()
    const convInput: ConversationInput = {
      ownerUid: user.uid,
      moodId: currentMood.id,
      sessionId,
    }
    // forceNew = true → always makes a fresh doc
    const newCid = await getOrCreateConversation(db!, convInput, { forceNew: true })
    // redirect into it
    router.replace(`/chat?mood=${currentMood.id}&cid=${newCid}`)
  }
  const handleChatdelete = async (e: any, cid: any) => {
    try {
      await deleteDoc(doc(db!, "conversations", cid));
      const urlCid = searchParams.get('cid')
      if (cid === urlCid) {
        startNewConversation()
      }
      toast.success("Chat Deleted Successfully")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r transition-transform duration-300 ease-in-out transform sm:relative sm:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Chats</h2>
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={onClose} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-2">
          <Button
            onClick={startNewConversation}
            className="w-full gap-2" variant="outline">
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md bg-background border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          {user ? (
            convs.length > 0 ? (
              <div className="space-y-1">
                {convs.map((conv) => (
                  <div key={conv.id}
                  className={cn(
                        "flex items-center p-3 pr-0 rounded-lg hover:bg-accent transition-colors w-full",
                        pathname.includes(`cid=${conv.id}`) && "bg-accent"
                      )}
                  >
                    <Link
                      href={`/chat?mood=${currentMood.id}&cid=${conv.id}`}
                      className={cn(
                        "flex items-center w-full",
                        pathname.includes(`cid=${conv.id}`) && "bg-accent"
                      )}
                    >
                      <div className="flex justify-between w-full items-center">
                        <span className="truncate w-20">{conv.title ?? "Untitled"}</span>
                        <time className="text-xs text-muted-foreground">
                          {conv.updatedAt && typeof conv.updatedAt.toDate === "function"
                            ? new Date(conv.updatedAt.toDate()).toLocaleString()
                            : "N/A"}
                        </time>
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="px-2 rounded transition outline-none focus:outline-none focus:ring-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            // e.stopPropagation()
                            handleChatdelete(e, conv.id)
                          }}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No chats yet. Start one above.
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="bg-muted/50 p-4 rounded-lg mb-4 flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground mr-2" />
              </div>
              <h3 className="font-medium mb-2">Saved Chats</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to see your chat history.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}