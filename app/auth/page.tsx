import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
