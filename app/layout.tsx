import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { VercelAnalytics } from "@/components/analytics"
import { Suspense } from "react"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MoodGPT - Chat with AI in different moods",
  description: "Choose your AI's personality and have conversations with different moods and attitudes.",
  keywords: "AI chat, personality, mood, chatbot, conversation",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <Suspense>{children}</Suspense>
        </Providers>
        <ToastContainer position="top-right"/>
        <VercelAnalytics />
      </body>
    </html>
  )
}
