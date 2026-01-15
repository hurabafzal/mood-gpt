import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-4 px-6 border-t mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="text-sm text-muted-foreground flex gap-4 dark:text-gray-400">
          <Link href="/terms" className="hover:underline dark:hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/disclaimer" className="hover:underline dark:hover:text-white">
            Disclaimer
          </Link>
        </div>
        <div className="text-sm text-muted-foreground dark:text-gray-400 text-center">
          MoodGPT is an AI chat platform that uses various AI models to create personality-based conversations. Not
          affiliated with or endorsed by OpenAI.
        </div>
      </div>
    </footer>
  )
}
