import { useMessageLimit } from "@/hooks/use-message-limit"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MessageLimit() {
  const { subscriptionPlan } = useMessageLimit()

  const dailyLimit = subscriptionPlan === "creator" ? 363 : 5

  return (
    <div className="bg-muted/50 p-6 rounded-lg text-center">
      <h3 className="text-lg font-medium mb-2">Daily message limit reached</h3>
      <p className="text-sm text-muted-foreground mb-4">
        You've reached your daily message limit of {dailyLimit} messages.
        {subscriptionPlan === "free" && " Upgrade to Creator plan for 363 messages per day!"}
      </p>
      <div className="text-xs text-muted-foreground mb-4">
        <p>Your limit will reset at midnight.</p>
      </div>

      {subscriptionPlan === "free" && (
        <Link href="/pricing">
          <Button variant="outline" className="mt-2">
            View Pricing Plans
          </Button>
        </Link>
      )}
    </div>
  )
}
