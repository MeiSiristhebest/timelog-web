"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: string
    isUp: boolean
  }
  data?: unknown[]
  dataKey?: string
  color?: string
  className?: string
}

export function DataCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  data,
  dataKey = "value",
  color = "var(--accent)",
  className,
}: DataCardProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  return (
    <Card className={cn("overflow-hidden group hover:border-accent/40 transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted group-hover:text-ink transition-colors">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 rounded-lg bg-canvas-depth border border-line group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
            <Icon className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-ink tracking-tight">{value}</div>
          {trend && (
            <div
              className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1",
                trend.isUp
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {trend.isUp ? "↑" : "↓"} {trend.value}
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted font-bold mt-1 mb-4 border-l-2 border-line pl-2">
          {description}
        </p>
        
        {mounted && data && data.length > 0 && (
          <div className="h-[40px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={data}>
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
