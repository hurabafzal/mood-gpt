import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
          <h1>Disclaimer</h1>

          <div className="bg-muted p-6 rounded-lg border mb-8">
            <p className="text-lg font-medium">
              MoodGPT is an independent project that uses AI models, including those from DeepInfra and OpenAI. We are
              not affiliated with or endorsed by OpenAI, ChatGPT, or any related entity. All product names and
              trademarks belong to their respective owners.
            </p>
          </div>

          <h2>About Our AI Services</h2>
          <p>
            MoodGPT provides access to AI-powered chat experiences with different personalities and moods. While we
            strive to create engaging and helpful interactions, please be aware of the following:
          </p>

          <ul>
            <li>
              <strong>AI Limitations:</strong> The AI models we use may occasionally produce inaccurate, inappropriate,
              or misleading content. We implement safeguards, but cannot guarantee perfect results.
            </li>
            <li>
              <strong>Not Professional Advice:</strong> Interactions with our AI should not be considered professional
              advice in fields such as medicine, law, finance, or mental health.
            </li>
            <li>
              <strong>Third-Party Services:</strong> Our service integrates AI models from third parties, and the
              availability and functionality of these models are subject to change.
            </li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            "ChatGPT" and "GPT" are trademarks of OpenAI. Our use of "GPT" in "MoodGPT" is descriptive of the underlying
            technology and is not intended to imply any endorsement or affiliation.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have any questions about this disclaimer or our services, please contact us at:
            <br />
            <a href="mailto:support@moodgpt.com">support@moodgpt.com</a>
          </p>

          <p className="text-sm text-muted-foreground mt-8">Last updated: May 3, 2025</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
