// app/api/chat/route.ts
import { NextResponse } from "next/server"

// Define the message type
interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      )
    }

    // Retrieve keys from environment
    const deepInfraKey = process.env.DEEPINFRA_API_KEY
    const openAiKey = process.env.OPENAI_API_KEY

    // Must have at least one
    if (!deepInfraKey && !openAiKey) {
      console.error("No API keys configured")
      return NextResponse.json(
        {
          response:
            "API configuration error: No API keys found. Please add either DEEPINFRA_API_KEY or OPENAI_API_KEY to your environment variables.",
          error: "missing_api_keys",
        },
        { status: 500 }
      )
    }

    // Now safely initialize these two:
    // let apiUrl = ""
    // let model = ""
    // const headers: Record<string, string> = {
    //   "Content-Type": "application/json",
    // }

    // if (deepInfraKey) {
    //   apiUrl = "https://api.deepinfra.com/v1/openai/chat/completions"
    //   headers["Authorization"] = `Bearer ${deepInfraKey}`
    //   model = "meta-llama/Llama-2-70b-chat-hf"
      
    // } else {
    //   // here openAiKey must be defined
    //   apiUrl = "https://api.openai.com/v1/chat/completions"
    //   headers["Authorization"] = `Bearer ${openAiKey}`
    //   model = "gpt-3.5-turbo"
      
    // }

    // Optionally append formatting hints to any system prompt
    const systemMessages = messages.filter((m) => m.role === "system")
    if (systemMessages.length) {
      systemMessages[0].content +=
        " Use proper formatting with paragraphs, bullet points, and numbered lists where appropriate."
    }

    // Forward the request
    // const response = await fetch(apiUrl, {
    //   method: "POST",
    //   headers,
    //   body: JSON.stringify({
    //     model,
    //     messages: messages as ChatMessage[],
    //     temperature: 0.7,
    //     max_tokens: 800,
    //   }),
    // })

    const callChatAPI = async (
      url: string,
      headers: Record<string, string>,
      model: string
    ) => {
      return await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: messages as ChatMessage[],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
    };
    if (openAiKey) {
      const openAIHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      };
      const openAIUrl = "https://api.openai.com/v1/chat/completions";
      try {
        const openAIResponse = await callChatAPI(
          openAIUrl,
          openAIHeaders,
          "gpt-3.5-turbo"
        );
        if (openAIResponse.ok) {
          const data = await openAIResponse.json();
          const generatedText = data.choices?.[0]?.message?.content;
          return NextResponse.json({ response: generatedText });
        } else {
          console.warn("OpenAI failed:", await openAIResponse.text());
        }
      } catch (err) {
        console.error("OpenAI error:", err);
      }
    }
    // If OpenAI fails, try DeepInfra
    if (deepInfraKey) {
      const deepInfraHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepInfraKey}`,
      };
      const deepInfraUrl =
        "https://api.deepinfra.com/v1/openai/chat/completions";
      try {
        const deepInfraResponse = await callChatAPI(
          deepInfraUrl,
          deepInfraHeaders,
          "meta-llama/Llama-2-70b-chat-hf"
        );
        if (deepInfraResponse.ok) {
          const data = await deepInfraResponse.json();
          const generatedText = data.choices?.[0]?.message?.content;
          return NextResponse.json({ response: generatedText });
        } else {
          console.warn("DeepInfra failed:", await deepInfraResponse.text());
        }
      } catch (err) {
        console.error("DeepInfra error:", err);
      }
    }

    return NextResponse.json(
      {
        response: "The system is currently busy. Please try again later.",
        error: "api_error",
      },
      { status: 500 }
    );


    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}))
    //   console.error("AI service error:", errorData)

    //   if (response.status === 401) {
    //     return NextResponse.json(
    //       {
    //         response:
    //           "Authentication error: The API key provided is invalid or has expired. Please check your API keys.",
    //         error: "invalid_api_key",
    //       },
    //       { status: 401 }
    //     )
    //   }
    //   if (response.status === 429) {
    //     return NextResponse.json(
    //       {
    //         response:
    //           "Rate limit exceeded: The API usage limit has been reached. Please try again later.",
    //         error: "rate_limit",
    //       },
    //       { status: 429 }
    //     )
    //   }


    //   return NextResponse.json(
    //     {
    //       response:
    //         "The system is currently busy. Please try again later.",
    //       error: "api_error",
    //     },
    //     { status: response.status }
    //   )
    // }

    // const data = await response.json()
    // const generatedText = data.choices?.[0]?.message?.content

    // return NextResponse.json({ response: generatedText })
  } catch (err) {
    console.error("Error in chat API route:", err)
    return NextResponse.json(
      {
        response:
          "An unexpected error occurred. Please try again later or contact support if the issue persists.",
        error: "server_error",
      },
      { status: 500 }
    )
  }
}
