import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger'
  subtitle?: string
}

const colorStyles = {
  primary: 'text-primary bg-primary/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  danger: 'text-rose-500 bg-rose-500/10',
}

export function KPICard({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
}: KPICardProps) {
  return (
    <Card className="border border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colorStyles[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
