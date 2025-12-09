import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PieChartProps {
  title: string
  data: { name: string; value: number; percentage?: number; [key: string]: unknown }[]
}

const COLORS = [
  'hsl(174, 72%, 40%)', // teal
  'hsl(142, 71%, 45%)', // green
  'hsl(38, 92%, 50%)',  // amber
  'hsl(346, 77%, 50%)', // rose
  'hsl(262, 83%, 58%)', // purple
  'hsl(330, 81%, 60%)', // pink
  'hsl(186, 72%, 45%)', // cyan
  'hsl(24, 95%, 53%)',  // orange
  'hsl(231, 48%, 48%)', // indigo
]

export function ReportsPieChart({ title, data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const chartData = data.map(item => ({
    ...item,
    percentage: item.percentage ?? (total > 0 ? (item.value / total) * 100 : 0),
  }))

  const handleLabel = (props: PieLabelRenderProps) => {
    const { name, value } = props
    const percentage = total > 0 ? ((value as number) / total) * 100 : 0
    return `${name}: ${percentage.toFixed(1)}%`
  }

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={handleLabel}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(_value: number, _name: string) => {
                  const item = chartData.find(d => d.name === _name)
                  return [
                    `${item?.percentage.toFixed(1) ?? '0'}%`,
                    _name,
                  ]
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
