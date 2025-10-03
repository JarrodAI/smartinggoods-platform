'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { AnimatedCounter } from "./animated-counter"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  previousValue?: number
  prefix?: string
  suffix?: string
  decimals?: number
  icon?: React.ReactNode
  variant?: "default" | "premium" | "success" | "warning" | "danger"
  className?: string
  showTrend?: boolean
  trendLabel?: string
}

export function StatsCard({
  title,
  value,
  previousValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon,
  variant = "default",
  className,
  showTrend = true,
  trendLabel = "vs last period"
}: StatsCardProps) {
  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return null
    const change = ((value - previousValue) / previousValue) * 100
    return {
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      isPositive: change > 0
    }
  }

  const trend = calculateTrend()

  const variants = {
    default: "border-gray-200 hover:shadow-lg",
    premium: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl",
    success: "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl",
    warning: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl",
    danger: "border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-xl"
  }

  const iconColors = {
    default: "text-blue-600",
    premium: "text-amber-600",
    success: "text-green-600", 
    warning: "text-yellow-600",
    danger: "text-red-600"
  }

  return (
    <Card className={cn(variants[variant], "transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("h-5 w-5", iconColors[variant])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          <AnimatedCounter
            end={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            duration={1500}
          />
        </div>
        {showTrend && trend && (
          <div className="flex items-center space-x-2">
            {trend.direction === 'up' && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
            {trend.direction === 'down' && (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            {trend.direction === 'neutral' && (
              <Minus className="h-4 w-4 text-gray-600" />
            )}
            <Badge 
              variant={trend.isPositive ? "success" : trend.direction === 'neutral' ? "outline" : "destructive"}
              className="text-xs"
            >
              {trend.direction !== 'neutral' && (trend.isPositive ? '+' : '-')}
              {trend.percentage.toFixed(1)}%
            </Badge>
            <span className="text-xs text-gray-500">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}