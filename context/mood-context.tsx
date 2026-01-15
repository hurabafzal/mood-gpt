"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type MoodType, getMood, getRandomMood, type Mood } from "@/types/mood"

interface MoodContextType {
  currentMood: Mood
  setMood: (mood: MoodType) => void
  randomizeMood: () => void
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

export function MoodProvider({ children }: { children: ReactNode }) {
  const [currentMood, setCurrentMood] = useState<Mood>(getRandomMood())

  // Load mood from localStorage on component mount
  useEffect(() => {
    const storedMood = localStorage.getItem("moodgpt_selected_mood")
    if (storedMood) {
      try {
        setCurrentMood(getMood(storedMood as MoodType))
      } catch (e) {
        console.error("Error loading mood from localStorage:", e)
      }
    }
  }, [])

  const setMood = (mood: MoodType) => {
    try {
      const selectedMood = getMood(mood)
      setCurrentMood(selectedMood)
      // Save to localStorage
      localStorage.setItem("moodgpt_selected_mood", mood)
      //console.log(`Mood set to: ${mood}`)
    } catch (e) {
      console.error(`Error setting mood to ${mood}:`, e)
    }
  }

  const randomizeMood = () => {
    const randomMood = getRandomMood()
    setCurrentMood(randomMood)
    // Save to localStorage
    localStorage.setItem("moodgpt_selected_mood", randomMood.id)
    //console.log(`Random mood set to: ${randomMood.id}`)
  }

  return <MoodContext.Provider value={{ currentMood, setMood, randomizeMood }}>{children}</MoodContext.Provider>
}

export function useMood() {
  const context = useContext(MoodContext)
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider")
  }
  return context
}
