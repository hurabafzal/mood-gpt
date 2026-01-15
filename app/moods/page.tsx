import { redirect } from "next/navigation"

export default function MoodsPage() {
  // Redirect to the home page since moods is now the main page
  redirect("/")
}
