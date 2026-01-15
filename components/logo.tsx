import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
}

export function Logo({ size = "md", className, showText = false }: LogoProps) {
  // Fixed size values in pixels
  const sizeValues = {
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96,
  }

  // Text size classes
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  }

  const logoSize = sizeValues[size]
  const textSize = textSizes[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Fixed size container with explicit width and height */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          maxWidth: `${logoSize}px`,
          maxHeight: `${logoSize}px`,
        }}
      >
        <Image
          src="/images/logo.png"
          alt="MoodGPT Logo"
          width={logoSize}
          height={logoSize}
          className="w-full h-full object-contain"
          style={{
            width: `${logoSize}px`,
            height: `${logoSize}px`,
          }}
          priority
        />
      </div>

      {showText && (
        <span className={cn("font-bold", textSize)}>
          <span className="text-primary">Mood</span>
          <span>GPT</span>
        </span>
      )}
    </div>
  )
}
