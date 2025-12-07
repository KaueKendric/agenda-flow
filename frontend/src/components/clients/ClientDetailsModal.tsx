import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pencil,
} from 'lucide-react'
import { clientsApi } from '@/lib/clients-api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Client, ClientStats } from '@/types/clients'

interface ClientDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string | null
  onEdit: (client: Client) => void
}

export function ClientDetailsModal({
  open,
  onOpenChange,
  clientId,
  onEdit,
}: ClientDetailsModalProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadClientDetails = useCallback(async () => {
    if (!clientId) return

    setIsLoading(true)
    try {
      const [clientData, statsData] = await Promise.all([
        clientsApi.getById(clientId),
        clientsApi.getStats(clientId),
      ])
      setClient(clientData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (open && clientId) {
      loadClientDetails()
    }
  }, [open, clientId, loadClientDetails])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (!open) return null

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Perfil do Cliente</DialogTitle>
            {client && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(client)
                  onOpenChange(false)
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : client && stats ? (
          <div className="space-y-6">
            {/* Dados Principais */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  {client.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {client.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={tag === 'VIP' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.cpf && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{client.cpf}</span>
                  </div>
                )}
                {client.birthDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(client.birthDate), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{client.company}</span>
                  </div>
                )}
                {(client.city || client.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {client.city}
                      {client.state && `, ${client.state}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Estatísticas
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalAppointments}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total de Agendamentos
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedAppointments}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Concluídos
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalSpent)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Gasto
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    {stats.attendanceRate.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Taxa de Comparecimento
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Serviços Favoritos */}
            {stats.topServices.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Serviços Mais Utilizados</h4>
                <div className="space-y-2">
                  {stats.topServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                    >
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="secondary">{service.count}x</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximos Agendamentos */}
            {stats.upcomingAppointments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Próximos Agendamentos
                </h4>
                <div className="space-y-2">
                  {stats.upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium">{apt.service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(apt.dateTime), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          com {apt.professional.user.name}
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.status === 'CONFIRMED' ? 'default' : 'secondary'
                        }
                      >
                        {apt.status === 'CONFIRMED' ? 'Confirmado' : 'Agendado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo de Status */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">
                    {stats.completedAppointments}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Concluídos
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="font-medium">
                    {stats.canceledAppointments}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cancelados
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="font-medium">{stats.noShowAppointments}</div>
                  <div className="text-xs text-muted-foreground">Faltou</div>
                </div>
              </div>
            </div>

            {/* Observações */}
            {client.notes && (
              <div>
                <h4 className="font-semibold mb-2">Observações</h4>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  {client.notes}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
