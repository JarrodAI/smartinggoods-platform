'use client'

import { Button } from './button'
import { Badge } from './badge'
import { AnimatedCounter } from './animated-counter'
import { cn } from '@/lib/utils'
import { ArrowRight, Play, Star, Users, Globe, Zap, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  variant?: "default" | "gradient" | "video" | "minimal" | "premium"
  title: string
  subtitle: string
  description: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  badge?: string
  stats?: Array<{
    value: number
    label: string
    prefix?: string
    suffix?: string
  }>
  backgroundImage?: string
  videoUrl?: string
  className?: string
}

export function HeroSection({
  variant = "default",
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  stats,
  backgroundImage,
  videoUrl,
  className
}: HeroSectionProps) {
  const variants = {
    default: "bg-white",
    gradient: "bg-gradient-to-br from-blue-50 via-white to-purple-50",
    video: "bg-black text-white relative overflow-hidden",
    minimal: "bg-gray-50",
    premium: "bg-gradient-to-br from-amber-50 via-white to-orange-50"
  }

  const titleColors = {
    default: "text-gray-900",
    gradient: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
    video: "text-white",
    minimal: "text-gray-900", 
    premium: "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
  }

  return (
    <section className={cn(variants[variant], "relative py-20 lg:py-32", className)}>
      {/* Background Elements */}
      {variant === "gradient" && (
        <>
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </>
      )}

      {variant === "video" && videoUrl && (
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {backgroundImage && variant !== "video" && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {badge && (
            <Badge 
              variant={variant === "premium" ? "premium" : "gradient"} 
              className="mb-6 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {badge}
            </Badge>
          )}

          <h1 className={cn(
            "text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight",
            titleColors[variant]
          )}>
            {title}
          </h1>

          <p className={cn(
            "text-xl sm:text-2xl font-semibold mb-6",
            variant === "video" ? "text-blue-200" : "text-gray-600"
          )}>
            {subtitle}
          </p>

          <p className={cn(
            "text-lg mb-8 max-w-2xl mx-auto leading-relaxed",
            variant === "video" ? "text-gray-200" : "text-gray-600"
          )}>
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant={variant === "premium" ? "premium" : "gradient"}
              size="xl"
              className="group"
              asChild
            >
              <a href={primaryCTA.href}>
                {primaryCTA.text}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>

            {secondaryCTA && (
              <Button
                variant={variant === "video" ? "glass" : "outline"}
                size="xl"
                asChild
              >
                <a href={secondaryCTA.href} className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  {secondaryCTA.text}
                </a>
              </Button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={cn(
                    "text-3xl sm:text-4xl font-bold mb-2",
                    variant === "video" ? "text-white" : 
                    variant === "premium" ? "text-amber-600" : "text-blue-600"
                  )}>
                    <AnimatedCounter
                      end={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      duration={2000}
                    />
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    variant === "video" ? "text-gray-200" : "text-gray-600"
                  )}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className={cn(
                "text-sm font-medium",
                variant === "video" ? "text-gray-200" : "text-gray-600"
              )}>
                Join 10,000+ businesses
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
              <span className={cn(
                "ml-2 text-sm font-medium",
                variant === "video" ? "text-gray-200" : "text-gray-600"
              )}>
                4.9/5 from 2,500+ reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      {variant === "premium" && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      )}
    </section>
  )
}