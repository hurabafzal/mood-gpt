"use client"

import Link from "next/link"
import { moods, type MoodType } from "@/types/mood"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

// Define a simple Messages types
interface DummyMessage {
  id: string
  mood_id: string
  content: string
  is_user: boolean
  created_at: string
}

// Dummy chat history data
const dummyMessages: DummyMessage[] = [
  {
    id: "msg-1",
    mood_id: "funny",
    content: "What did the ocean say to the beach? Nothing, it just waved!",
    is_user: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "msg-2",
    mood_id: "sarcastic",
    content: "Have you tried turning it off and on again?",
    is_user: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "msg-3",
    mood_id: "mean",
    content: "Your code is like a cryptic crossword puzzle, but less useful.",
    is_user: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
]

export function ChatHistory() {
  const pathname = usePathname()

  // Get mood emoji and color
  const getMoodEmoji = (moodId: string) => {
    const mood = moods.find((m) => m.id === (moodId as MoodType))
    return mood ? mood.emoji : "💬"
  }

  const getMoodColor = (moodId: string) => {
    const mood = moods.find((m) => m.id === (moodId as MoodType))
    return mood ? mood.color : "#6E6E6E"
  }

  const getMoodName = (moodId: string) => {
    const mood = moods.find((m) => m.id === (moodId as MoodType))
    return mood ? mood.name : "Chat"
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-1">
      {dummyMessages.map((message) => (
        <Link href={`/chat?mood=${message.mood_id}`} key={message.id}>
          <div
            className={cn(
              "p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer",
              pathname === `/chat?mood=${message.mood_id}` && "bg-accent",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                style={{ backgroundColor: `${getMoodColor(message.mood_id)}30` }}
              >
                <span>{getMoodEmoji(message.mood_id)}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{getMoodName(message.mood_id)}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(message.created_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {message.is_user ? "You: " : ""}
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
