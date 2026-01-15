import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, Crown, Shield } from "lucide-react"

const pricingPlans = [
  {
    name: "Free",
    emoji: "🆓",
    price: "Free",
    description: "Perfect for casual chats and trying out different moods",
    features: ["2 messages per day", "Access all 9 personalities", "✨ Mood of the Day"],
    ctaText: "Start for Free",
    color: "#6E6E6E",
  },
  {
    name: "Basic",
    emoji: "💬",
    price: "$9.99",
    description: "Ideal for regular users who want more room to talk",
    features: [
      "50 messages per day",
      "Plan lasts 1 month ",
      "Everything in Free plan",
    ],
    ctaText: "Go Basic",
    color: "#00A86B",            
  },
  
  {
    name: "Creator",
    emoji: "🧠",
    price: "$24.99",
    description: "For content creators and power users",
    features: ["363 messages per day", "Priority support", "Everything in Basic plan"],
    ctaText: "Upgrade Now",
    color: "#9747FF",
    popular: true,
  },
  {
    name: "👑 Founder 3 Year Plan",
    emoji: "",
    price: "$799.99",
    description: "Everything in Creator, for 3 years",
    features: [
      "500 messages per day",
      "Priority access to all future updates and tools",
    ],
    ctaText: "Unlock 3 Years of Access",
    color: "#FFD700",
    highlight: true,
    mostValuable: true,
    covered: true,
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From casual chats to power users — pick what fits your conversation needs.
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col p-6 rounded-2xl border transition-all hover:shadow-lg mood-card bg-white dark:bg-transparent ${plan.popular ? "border-2 shadow-md scale-[1.02]" : ""
                  } ${plan.highlight ? "border-2 border-[#FFD700] shadow-md scale-[1.02] relative overflow-hidden" : ""}`}
                style={{ borderColor: plan.popular || plan.highlight ? plan.color : undefined }}
              >
                {plan.covered && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10 whitespace-nowrap">
                    Plan Covered! 🎉
                  </div>
                )}
                {plan.mostValuable && (
                  <div className="absolute top-0 right-0 bg-[#FFD700] text-black px-3 py-1 text-xs font-bold transform translate-x-2 -translate-y-0 rotate-45 origin-bottom-left">
                    MOST VALUABLE
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  {plan.emoji && <span className="text-2xl">{plan.emoji}</span>}
                  {plan.name === "👑 Founder 3 Year Plan" ? (
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[#FFD700]" />
                      Founder 3 Year Plan
                    </h3>
                  ) : (
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  )}
                  {plan.popular && (
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white ml-auto"
                      style={{ backgroundColor: plan.color }}
                    >
                      Popular
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline">
                    {plan.covered ? (
                      <>
                        <span className="text-3xl font-bold line-through text-gray-400">{plan.price}</span>
                        <span className="text-3xl font-bold text-green-500 ml-2">$399.99</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">{plan.price}</span>
                    )}
                    {plan.price !== "Free" && plan.name !== "👑 Founder 3 Year Plan" && (
                      <span className="text-muted-foreground ml-1">/month</span>
                    )}
                    {plan.name === "👑 Founder 3 Year Plan" && (
                      <span className="text-muted-foreground ml-1">once</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 shrink-0" style={{ color: plan.color }} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === "Free" ? (
                  <Link href="/">
                    <Button
                      className="w-full mt-auto"
                      style={{
                        backgroundColor: plan.color,
                        color: "white",
                      }}
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                ) : plan.name === "Basic" ? (
                  /* ⬇️ link to new page */
                  <Link href="/basic-plan">
                    <Button
                      className="w-full mt-auto"
                      style={{ backgroundColor: plan.color, color: "white" }}
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                ): plan.name === "👑 Founder 3 Year Plan" ? (
                    <Link href="/lifetime-access">
                      <Button
                        className={`w-full mt-auto ${plan.covered ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"} ${plan.covered ? "text-white" : "text-black"}`}
                      >
                        {plan.covered ? "Activate Now" : plan.ctaText}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/upgrade">
                      <Button
                        className="w-full mt-auto"
                        style={{
                          backgroundColor: plan.color,
                          color: "white",
                        }}
                      >
                        {plan.ctaText}
                      </Button>
                    </Link>
                  )}

                {plan.covered && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center text-sm font-medium text-green-600">
                      <Shield className="h-4 w-4 mr-1" /> Plan already covered for you
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Link href="/">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start for Free
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">No credit card required for free plan.</p>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-12 text-sm text-muted-foreground max-w-2xl mx-auto">
            <p>
              MoodGPT is an independent product that uses AI models, including OpenAI's GPT API. It is not affiliated
              with or endorsed by OpenAI.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
