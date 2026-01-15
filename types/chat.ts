export interface ChatHistory {
  id: string
  moodId: string
  title: string
  preview: string
  timestamp: string
  unread?: boolean
}

// Dummy data for chat history
export const dummyChatHistory: ChatHistory[] = [
  {
    id: "chat-1",
    moodId: "funny",
    title: "Dad jokes compilation",
    preview: "What did the ocean say to the beach? Nothing, it just waved!",
    timestamp: "2 hours ago",
  },
  {
    id: "chat-2",
    moodId: "sarcastic",
    title: "Tech support troubles",
    preview: "Have you tried turning it off and on again?",
    timestamp: "Yesterday",
  },
  {
    id: "chat-3",
    moodId: "mean",
    title: "Roasting session",
    preview: "Your code is like a cryptic crossword puzzle, but less useful.",
    timestamp: "2 days ago",
  },
  {
    id: "chat-4",
    moodId: "cute",
    title: "Motivational chat",
    preview: "You're doing amazing! Keep up the good work! ^_^",
    timestamp: "1 week ago",
  },
  {
    id: "chat-5",
    moodId: "annoyed",
    title: "Customer service complaint",
    preview: "Fine, I'll help you with your obviously simple problem.",
    timestamp: "2 weeks ago",
  },
]
