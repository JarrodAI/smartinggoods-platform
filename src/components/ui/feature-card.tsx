'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  features: string[]
  price?: string
  originalPrice?: string
  badge?: string
  badgeVariant?: "default" | "premium" | "success" | "gradient"
  variant?: "default" | "premium" | "popular" | "enterprise"
  className?: string
  onSelect?: () => void
  buttonText?: string
  isPopular?: boolean
  discount?: string
}

export function FeatureCard({
  title,
  description,
  features,
  price,
  originalPrice,
  badge,
  badgeVariant = "default",
  variant = "default",
  className,
  onSelect,
  buttonText = "Get Started",
  isPopular = false,
  discount
}: FeatureCardProps) {
  const variants = {
    default: "border-gray-200 hover:shadow-lg",
    premium: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl ring-2 ring-amber-200",
    popular: "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl ring-2 ring-blue-500 relative overflow-hidden",
    enterprise: "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl ring-2 ring-purple-500"
  }

  const buttonVariants = {
    default: "default",
    premium: "premium",
    popular: "gradient", 
    enterprise: "gradient"
  } as const

  const icons = {
    default: <Check className="h-5 w-5" />,
    premium: <Crown className="h-5 w-5" />,
    popular: <Star className="h-5 w-5" />,
    enterprise: <Sparkles className="h-5 w-5" />
  }

  return (
    <Card className={cn(variants[variant], "transition-all duration-300 relative", className)}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Badge variant="gradient" className="px-4 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {variant === 'popular' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none" />
      )}

      <CardHeader className="text-center pb-4">
        {badge && (
          <Badge variant={badgeVariant} className="w-fit mx-auto mb-2">
            {badge}
          </Badge>
        )}
        
        <div className="flex items-center justify-center mb-2">
          <div className={cn(
            "p-2 rounded-full",
            variant === 'premium' ? "bg-amber-100 text-amber-600" :
            variant === 'popular' ? "bg-blue-100 text-blue-600" :
            variant === 'enterprise' ? "bg-purple-100 text-purple-600" :
            "bg-gray-100 text-gray-600"
          )}>
            {icons[variant]}
          </div>
        </div>

        <CardTitle className="text-2xl font-bold mb-2">{title}</CardTitle>
        
        {price && (
          <div className="mb-2">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl font-bold text-gray-900">{price}</span>
              {originalPrice && (
                <span className="text-lg text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
            {discount && (
              <Badge variant="success" className="mt-1">
                Save {discount}
              </Badge>
            )}
          </div>
        )}
        
        <p className="text-gray-600 text-sm">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          variant={buttonVariants[variant]}
          className="w-full mt-6"
          size="lg"
          onClick={onSelect}
        >
          {buttonText}
          <Zap className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}