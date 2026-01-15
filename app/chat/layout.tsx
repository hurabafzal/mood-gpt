import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatLayout } from "@/components/chat-layout"


export default function ChatPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ChatLayout>{children}</ChatLayout>
      </div>
      <Footer />
    </div>
  )
}
