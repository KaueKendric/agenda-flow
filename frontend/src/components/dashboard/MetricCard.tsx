import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: number;
  delay?: number;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  progress,
  delay = 0 
}: MetricCardProps) {
  return (
    <Card 
      className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}%</span>
              <span className="text-muted-foreground text-xs">vs ontem</span>
            </div>
          )}
          
          {progress !== undefined && (
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
