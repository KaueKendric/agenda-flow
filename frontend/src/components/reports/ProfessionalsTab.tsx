import { Users, Trophy, DollarSign, Calendar } from 'lucide-react'
import { KPICard } from './KPICard'
import { ReportsBarChart } from './ReportsBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProfessionalsReport } from '@/types/reports'

interface ProfessionalsTabProps {
  data: ProfessionalsReport | null
  isLoading: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function ProfessionalsTab({ data, isLoading }: ProfessionalsTabProps) {
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

  const topProfessional = data.ranking[0]
  const totalAppointments = data.performanceByProfessional.reduce(
    (sum, p) => sum + p.appointments,
    0
  )

  const rankingChartData = [...data.ranking]
    .sort((a, b) => b.revenue - a.revenue)
    .map(item => ({
      name: item.name,
      value: item.revenue,
    }))

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ CORRETO - Renderize o ícone */}
        <KPICard
          title="Total de Profissionais"
          value={data.totalProfessionals}
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <KPICard
          title="Melhor Profissional"
          value={topProfessional?.name || '-'}
          icon={<Trophy className="h-5 w-5" />}
          color="warning"
        />
        <KPICard
          title="Receita do Melhor"
          value={formatCurrency(topProfessional?.revenue || 0)}
          icon={<DollarSign className="h-5 w-5" />}
          color="success"
        />
        <KPICard
          title="Total de Agendamentos"
          value={totalAppointments}
          icon={<Calendar className="h-5 w-5" />}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsBarChart
          title="Ranking por Receita"
          data={rankingChartData}
          color="hsl(262, 83%, 58%)"
        />

        {/* Performance Table */}
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Performance por Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[280px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Agendamentos</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="w-[120px]">Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.performanceByProfessional.map((professional, index) => (
                    <TableRow key={professional.id}>
                      <TableCell className="font-bold text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{professional.name}</TableCell>
                      <TableCell className="text-right">{professional.appointments}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(professional.revenue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={professional.completionRate}
                            className="h-2 flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-10">
                            {professional.completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
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
