import { Users, UserPlus, UserCheck, RefreshCw } from 'lucide-react'
import { KPICard } from './KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ClientsReport } from '@/types/reports'

interface ClientsTabProps {
  data: ClientsReport | null
  isLoading: boolean
}

export function ClientsTab({ data, isLoading }: ClientsTabProps) {
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

  const maxFrequency = Math.max(...data.clientsByFrequency.map(f => f.count), 1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ CORRETO - Renderize o ícone */}
        <KPICard
          title="Total de Clientes"
          value={data.totalClients}
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <KPICard
          title="Novos Clientes"
          value={data.newClientsThisPeriod}
          icon={<UserPlus className="h-5 w-5" />}
          color="success"
        />
        <KPICard
          title="Clientes Ativos"
          value={data.activeClients}
          icon={<UserCheck className="h-5 w-5" />}
          color="warning"
        />
        <KPICard
          title="Taxa de Retenção"
          value={`${data.clientRetention.toFixed(1)}%`}
          icon={<RefreshCw className="h-5 w-5" />}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Distribution */}
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Clientes por Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.clientsByFrequency.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.frequency}</span>
                    <span className="font-medium">{item.count} clientes</span>
                  </div>
                  <Progress
                    value={(item.count / maxFrequency) * 100}
                    className="h-3"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Frequent Clients Table */}
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Clientes Frequentes (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[280px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Último Agendamento</TableHead>
                    <TableHead className="text-right">Visitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.frequentClients.slice(0, 10).map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        {format(parseISO(client.lastAppointment), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{client.appointmentCount}</Badge>
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
