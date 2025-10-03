import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "gradient" | "dots" | "pulse" | "premium"
  className?: string
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  className 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-blue-600 animate-pulse",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s"
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("relative", sizes[size], className)}>
        <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75" />
        <div className="relative rounded-full bg-blue-600 h-full w-full" />
      </div>
    )
  }

  if (variant === "premium") {
    return (
      <div className={cn("relative", sizes[size], className)}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-spin" />
        <div className="absolute inset-1 rounded-full bg-white" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
      </div>
    )
  }

  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-border",
          sizes[size],
          className
        )}
        style={{
          background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)",
          borderRadius: "50%",
          mask: "radial-gradient(circle at center, transparent 30%, black 30%)",
          WebkitMask: "radial-gradient(circle at center, transparent 30%, black 30%)"
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-gray-200 border-t-blue-600",
        sizes[size],
        className
      )}
    />
  )
}