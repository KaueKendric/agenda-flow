import { Calendar, CheckCircle, Percent, XCircle } from 'lucide-react'
import { KPICard } from './KPICard'
import { ReportsBarChart } from './ReportsBarChart'
import { ReportsPieChart } from './ReportsPieChart'
import { Skeleton } from '@/components/ui/skeleton'
import type { OperationalReport } from '@/types/reports'

interface OperationalTabProps {
  data: OperationalReport | null
  isLoading: boolean
}

export function OperationalTab({ data, isLoading }: OperationalTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] rounded-lg" />
          <Skeleton className="h-[350px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível para o período selecionado.
      </div>
    )
  }

  const peakHoursData = [...data.peakHours]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(item => ({
      name: `${item.hour.toString().padStart(2, '0')}:00`,
      value: item.count,
    }))

  const statusData = data.appointmentsByStatus.map(item => ({
    name: translateStatus(item.status),
    value: item.count,
    percentage: item.percentage,
  }))

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ CORRETO - Renderize o ícone */}
        <KPICard
          title="Total de Agendamentos"
          value={data.totalAppointments}
          icon={<Calendar className="h-5 w-5" />}
          color="primary"
        />
        <KPICard
          title="Agendamentos Completos"
          value={data.completedAppointments}
          icon={<CheckCircle className="h-5 w-5" />}
          color="success"
        />
        <KPICard
          title="Taxa de Ocupação"
          value={`${data.occupancyRate.toFixed(1)}%`}
          icon={<Percent className="h-5 w-5" />}
          color="warning"
        />
        <KPICard
          title="Taxa de Cancelamento"
          value={`${data.cancellationRate.toFixed(1)}%`}
          icon={<XCircle className="h-5 w-5" />}
          color="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsBarChart
          title="Horários de Pico (Top 8)"
          data={peakHoursData}
          color="hsl(174, 72%, 40%)"
          formatAsCurrency={false}
        />
        <ReportsPieChart title="Distribuição por Status" data={statusData} />
      </div>
    </div>
  )
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Completo',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não compareceu',
    IN_PROGRESS: 'Em andamento',
  }
  return translations[status] || status
}
