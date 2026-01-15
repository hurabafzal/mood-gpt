"use client"; 
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { Logo } from "./logo"
import { UserProfile } from "./auth/user-profile"
import { useAuth } from "@/context/auth-context"; 

export function Header() {
   const { user, loading } = useAuth(); 
  return (
    <header className="w-full py-4 px-6 border-b">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" showText={true} />
        </Link>

        <div className="flex items-center gap-4">
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors dark:text-gray-300 dark:hover:text-white"
                >
                  Moods
                </Link>
              </li>
               {/* show only for authenticated users */}
                {!loading && user && (
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors dark:text-gray-300 dark:hover:text-white"
                >
                  Pricing
                </Link>
              </li>
                )}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  )
}
