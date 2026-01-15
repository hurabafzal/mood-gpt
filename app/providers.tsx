"use client"

import type { ReactNode } from "react"
import { MoodProvider } from "@/context/mood-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"


export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <MoodProvider>{children}</MoodProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
