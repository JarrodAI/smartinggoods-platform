'use client'

import { Card, CardContent } from "./card"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"
import { Star, Quote } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface TestimonialCardProps {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar?: string
  variant?: "default" | "premium" | "minimal" | "detailed"
  className?: string
  verified?: boolean
  businessType?: string
}

export function TestimonialCard({
  name,
  role,
  company,
  content,
  rating,
  avatar,
  variant = "default",
  className,
  verified = false,
  businessType
}: TestimonialCardProps) {
  const variants = {
    default: "border-gray-200 hover:shadow-lg",
    premium: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl",
    minimal: "border-0 shadow-none bg-transparent",
    detailed: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl"
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ))
  }

  return (
    <Card className={cn(variants[variant], "transition-all duration-300", className)}>
      <CardContent className="p-6">
        {variant !== 'minimal' && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              {renderStars()}
            </div>
            {verified && (
              <Badge variant="success" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
        )}

        <div className="relative mb-4">
          {variant === 'detailed' && (
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-200" />
          )}
          <p className={cn(
            "text-gray-700 leading-relaxed",
            variant === 'detailed' ? "pl-6" : ""
          )}>
            "{content}"
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Avatar variant={variant === 'premium' ? 'premium' : 'default'}>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{name}</h4>
              {variant === 'minimal' && (
                <div className="flex items-center space-x-1">
                  {renderStars()}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{role}</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm font-medium text-gray-800">{company}</p>
              {businessType && (
                <Badge variant="outline" className="text-xs">
                  {businessType}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {variant === 'detailed' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Verified Customer</span>
              <span>2 months ago</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}