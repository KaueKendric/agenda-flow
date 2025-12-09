import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from 'lucide-react'
import type { PeriodType, DateRange } from '@/types/reports'

interface PeriodSelectorProps {
  selectedPeriod: PeriodType
  dateRange: DateRange
  onPeriodChange: (period: PeriodType, range: DateRange) => void
}

const periods: { label: string; value: PeriodType }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Esta Semana', value: 'week' },
  { label: 'Este Mês', value: 'month' },
  { label: 'Este Ano', value: 'year' },
  { label: 'Personalizado', value: 'custom' },
]

export function PeriodSelector({
  selectedPeriod,
  dateRange,
  onPeriodChange,
}: PeriodSelectorProps) {
  const [customStart, setCustomStart] = useState(dateRange.startDate)
  const [customEnd, setCustomEnd] = useState(dateRange.endDate)

  // ✅ Função para calcular datas baseado no período
  const calculateDateRange = (period: PeriodType): DateRange => {
    const now = new Date()

    switch (period) {
      case 'today': {
        const date = format(now, 'yyyy-MM-dd')
        return { startDate: date, endDate: date }
      }

      case 'week': {
        const start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        const end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        return { startDate: start, endDate: end }
      }

      case 'month': {
        const start = format(startOfMonth(now), 'yyyy-MM-dd')
        const end = format(endOfMonth(now), 'yyyy-MM-dd')
        return { startDate: start, endDate: end }
      }

      case 'year': {
        const start = format(startOfYear(now), 'yyyy-MM-dd')
        const end = format(endOfYear(now), 'yyyy-MM-dd')
        return { startDate: start, endDate: end }
      }

      case 'custom': {
        return { startDate: customStart, endDate: customEnd }
      }

      default:
        return dateRange
    }
  }

  // ✅ Handler que passa PERIOD E RANGE
  const handlePeriodClick = (period: PeriodType) => {
    const range = calculateDateRange(period)
    onPeriodChange(period, range)
  }

  // ✅ Handler para datas customizadas
  const handleCustomDatesChange = (start: string, end: string) => {
    setCustomStart(start)
    setCustomEnd(end)
    const range: DateRange = { startDate: start, endDate: end }
    onPeriodChange('custom', range)
  }

  // ✅ Formatar datas para exibição
  const formatDisplayDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map(period => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            if (period.value === 'custom') {
              // Não faz nada aqui, deixa o popover abrir
              return
            }
            handlePeriodClick(period.value)
          }}
        >
          {period.label}
        </Button>
      ))}

      {selectedPeriod === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              {formatDisplayDate(dateRange.startDate)} - {formatDisplayDate(dateRange.endDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Selecione o período</h3>

              {/* Data inicial */}
              <div>
                <label className="text-sm font-medium block mb-2">Data inicial</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => {
                    const newStart = e.target.value
                    setCustomStart(newStart)
                    handleCustomDatesChange(newStart, customEnd)
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Data final */}
              <div>
                <label className="text-sm font-medium block mb-2">Data final</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => {
                    const newEnd = e.target.value
                    setCustomEnd(newEnd)
                    handleCustomDatesChange(customStart, newEnd)
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Resumo */}
              <div className="p-2 bg-secondary/50 rounded-md text-sm text-muted-foreground">
                Período: {formatDisplayDate(customStart)} até {formatDisplayDate(customEnd)}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
