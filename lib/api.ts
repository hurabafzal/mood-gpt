// Define the message type for the API
import { toast } from "react-toastify"
interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}
/**
 * Generates a chat response using the Deep Infra API
 * @param systemPrompt The system prompt to use
 * @param messages The message history
 * @returns The generated response
 */
export async function generateChatResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  try {
    // Prepare the messages array with the system prompt
    const apiMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }, ...messages]
    // Make the API request
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: apiMessages,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      console.error("API error:", data)
      toast.info(data.response)
      return data.response || "Sorry, I couldn't generate a response. Please try again."
      
    }
    return data.response
  } catch (error) {
    console.error("Error in generateChatResponse:", error)
    return "Sorry, something went wrong while generating a response. Please try again."
  }
}