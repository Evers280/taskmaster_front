import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "neo"
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl",
        variant === "neo" && "shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-500/30",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
