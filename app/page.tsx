"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { moods, getMood } from "@/types/mood"
import { useMood } from "@/context/mood-context"
import { Logo } from "@/components/logo"

// Separate component that uses useSearchParams
function MoodSelectorWithParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setMood, randomizeMood } = useMood()

  useEffect(() => {
    if (searchParams.get("random") === "true") {
      randomizeMood()
      // Get the random mood ID that was just set
      const randomMoodId = localStorage.getItem("moodgpt_selected_mood")
      if (randomMoodId) {
        router.push(`/chat?mood=${randomMoodId}`)
      } else {
        router.push("/chat")
      }
    }
  }, [searchParams, randomizeMood, router])

  const handleMoodSelect = (moodId: string) => {
    try {
      // Validate the mood ID first
      getMood(moodId as any)

      // Set the mood
      setMood(moodId as any)

      // Then navigate to the chat page with the mood ID as a query parameter
      router.push(`/chat?mood=${moodId}`)
    } catch (error) {
      console.error(`Error selecting mood ${moodId}:`, error)
      // If there's an error, just navigate to chat without a mood parameter
      router.push("/chat")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {moods.map((mood) => (
        <button
          key={mood.id}
          onClick={() => handleMoodSelect(mood.id)}
          className="flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:translate-y-[-4px] dark:hover:bg-gray-800/50 dark:hover:brightness-125 mood-card bg-white dark:bg-transparent"
          style={{
            borderColor: mood.color,
            backgroundColor: `${mood.color}15`,
            boxShadow: `0 4px 12px ${mood.color}20`,
          }}
          data-mood-id={mood.id}
        >
          <div
            className="text-4xl mb-3 rounded-full p-3 shadow-sm"
            style={{
              color: mood.color,
              boxShadow: `0 2px 8px ${mood.color}30`,
            }}
          >
            {mood.emoji}
          </div>
          <h2
            className="text-xl font-bold"
            style={{
              color: mood.color,
              textShadow: `0 0 20px ${mood.color}40`,
            }}
          >
            {mood.name}
          </h2>
          <p className="text-muted-foreground text-center mt-2 text-sm">{mood.tagline}</p>
        </button>
      ))}
    </div>
  )
}

// Client component that properly wraps useSearchParams in Suspense
function MoodSelector() {
  return (
    <Suspense fallback={<MoodSelectorFallback />}>
      <MoodSelectorWithParams />
    </Suspense>
  )
}

// Loading fallback component
function MoodSelectorFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-6 rounded-xl border-2 animate-pulse bg-gray-100 dark:bg-gray-800 h-48"
        ></div>
      ))}
    </div>
  )
}

// Random mood link component that doesn't use useSearchParams
function RandomMoodLink() {
  return (
    <div className="text-center mt-12">
      <a href="/?random=true" className="text-muted-foreground hover:underline inline-flex items-center">
        <span>✨ Try the Mood of the Day</span>
      </a>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            {/* Add a fixed-size container for the logo */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24">
                <Logo size="xl" showText={true} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Chat with AI in different moods and personalities
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your vibe. Get advice, jokes, insights, or encouragement.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">Choose Your AI Personality</h2>

          <MoodSelector />
          <RandomMoodLink />

          <div className="text-xs text-muted-foreground mt-8 max-w-lg mx-auto text-center">
            <p>
              MoodGPT is an independent project not affiliated with or endorsed by OpenAI.{" "}
              <a href="/disclaimer" className="underline hover:text-foreground">
                Read our disclaimer
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
