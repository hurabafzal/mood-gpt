"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import ReactMarkdown from "react-markdown"
import { Copy, Check } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  message: string
  isUser: boolean
  moodClass: string
}

export function ChatMessage({ message, isUser, moodClass }: ChatMessageProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Copy plain text (strip markdown formatting)
      await navigator.clipboard.writeText(message)
      setCopied(true)
      toast.success("Message copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy message")
    }
  }

  return (
    <div className={cn("mb-4", isUser ? "text-right" : "text-left")}>
      <div
        className={cn(
          "inline-block max-w-[80%] px-4 py-2 rounded-lg text-left relative",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : `${moodClass} rounded-tl-none ${isDark ? "dark:bg-opacity-90" : ""}`,
          !isUser && "text-[var(--bubble-text)] bg-[var(--bubble-bg)]",
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">
            {isUser ? (
              message
            ) : (
              <div className="prose prose-sm max-w-none text-white 
                              prose-p:text-white 
                              prose-li:text-white 
                              prose-ol:text-white 
                              prose-ul:text-white 
                              prose-strong:text-white 
                              prose-em:text-white 
                              prose-h1:text-white 
                              prose-h2:text-white 
                              prose-h3:text-white 
                              prose-h4:text-white 
                              prose-h5:text-white 
                              prose-h6:text-white
                            prose-li:marker:text-white">
                <ReactMarkdown>
                  {message}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0",
              isUser 
                ? "text-primary-foreground hover:bg-primary-foreground/20" 
                : "text-white hover:bg-white/20"
            )}
            onClick={handleCopy}
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
