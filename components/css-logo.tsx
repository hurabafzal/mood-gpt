import { cn } from "@/lib/utils"

interface CSSLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showTail?: boolean
}

export function CSSLogo({ size = "md", className, showTail = true }: CSSLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const emojiSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
    xl: "text-2xl",
  }

  const tailSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-6 h-6",
  }

  return (
    <div
      className={cn("bg-black rounded-lg overflow-hidden flex flex-wrap relative", sizeClasses[size], className)}
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
    >
      {/* Angry face - top left */}
      <div className="w-1/2 h-1/2 bg-[#FF4D4D] flex items-center justify-center">
        <div className={emojiSizes[size]}>😠</div>
      </div>

      {/* Happy face - top right */}
      <div className="w-1/2 h-1/2 bg-[#FFB700] flex items-center justify-center">
        <div className={emojiSizes[size]}>😊</div>
      </div>

      {/* Sad face - bottom left */}
      <div className="w-1/2 h-1/2 bg-[#9747FF] flex items-center justify-center">
        <div className={emojiSizes[size]}>😢</div>
      </div>

      {/* Cute face - bottom right */}
      <div className="w-1/2 h-1/2 bg-[#2ECC71] flex items-center justify-center">
        <div className={emojiSizes[size]}>😍</div>
      </div>

      {/* Speech bubble tail */}
      {showTail && (
        <div
          className={cn("absolute bottom-0 left-0 bg-black transform translate-y-1/4 rotate-45", tailSizes[size])}
        ></div>
      )}
    </div>
  )
}
