import { DollarSign, TrendingUp, Briefcase, Users } from 'lucide-react'
import { KPICard } from './KPICard'
import { ReportsLineChart } from './ReportsLineChart'
import { ReportsPieChart } from './ReportsPieChart'
import { ReportsBarChart } from './ReportsBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { FinancialReport } from '@/types/reports'

interface FinancialTabProps {
  data: FinancialReport | null
  isLoading: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function FinancialTab({ data, isLoading }: FinancialTabProps) {
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

  const uniqueServicesCount = new Set(data.revenueByService.map(s => s.serviceName)).size
  const uniqueProfessionalsCount = data.revenueByProfessional.length

  const barChartData = [...data.revenueByProfessional]
    .sort((a, b) => b.revenue - a.revenue)
    .map(item => ({
      name: item.name,
      value: item.revenue,
    }))

  const pieChartData = data.topServices.slice(0, 5).map(item => ({
    name: item.name,
    value: item.revenue,
    percentage: item.percentage,
  }))

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ CORRETO - Renderize o ícone */}
        <KPICard
          title="Receita Total"
          value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="success"
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(data.averageTicket)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="primary"
        />
        <KPICard
          title="Total de Serviços"
          value={uniqueServicesCount}
          icon={<Briefcase className="h-5 w-5" />}
          color="warning"
        />
        <KPICard
          title="Total de Profissionais"
          value={uniqueProfessionalsCount}
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsLineChart title="Evolução da Receita" data={data.revenueByPeriod} />
        <ReportsPieChart title="Top 5 Serviços" data={pieChartData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsBarChart title="Receita por Profissional" data={barChartData} />

        {/* Revenue by Service Table */}
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Receita por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[280px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Agendamentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...data.revenueByService]
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((service, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{service.serviceName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                        <TableCell className="text-right">{service.count}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
