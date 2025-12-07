import { useEffect, useState } from 'react'
import { format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { appointmentsApi } from '@/lib/appointments-api'
import type { Appointment, AppointmentStatus } from '@/types/appointment'

interface DayAppointmentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  onAppointmentClick: (id: string) => void
}

const statusColor: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-blue-500/80 text-white',
  CONFIRMED: 'bg-green-500/80 text-white',
  IN_PROGRESS: 'bg-yellow-500/80 text-white',
  COMPLETED: 'bg-emerald-700/80 text-white',
  CANCELLED: 'bg-red-500/20 text-red-600 line-through',
  NO_SHOW: 'bg-gray-500/80 text-white',
}

const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Faltou',
}

export function DayAppointmentsModal({
  open,
  onOpenChange,
  date,
  onAppointmentClick,
}: DayAppointmentsModalProps) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Appointment[]>([])

  useEffect(() => {
    const load = async () => {
      if (!open || !date) {
        setItems([])
        return
      }

      setLoading(true)
      try {

        console.log('🔍 Buscando agendamentos do mês:', format(date, 'MM/yyyy'))
        
        const res = await appointmentsApi.list({
          page: 1,
          limit: 1000,
          // Não enviar filtro de data específica
        })

        console.log('📦 Total de agendamentos recebidos:', res.appointments?.length || 0)

        const allAppointments = res.appointments || []
        
        // Filtrar manualmente os agendamentos do dia selecionado
        const filtered = allAppointments.filter((apt) => {
          try {
            const aptDate = typeof apt.dateTime === 'string' 
              ? parseISO(apt.dateTime) 
              : apt.dateTime
            
            const match = isSameDay(aptDate, date)
            
            if (match) {
              console.log('✅ Match:', format(aptDate, 'yyyy-MM-dd HH:mm'))
            }
            
            return match
          } catch (error) {
            console.error('❌ Erro ao parsear data:', apt.dateTime, error)
            return false
          }
        })

        console.log('✅ Agendamentos do dia', format(date, 'dd/MM/yyyy'), ':', filtered.length)
        
        setItems(filtered)
      } catch (error) {
        console.error('❌ Erro ao buscar agendamentos:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, date])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Agendamentos de {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'}
          </DialogTitle>
          <DialogDescription>
            Veja todos os agendamentos do dia e abra os detalhes com um clique.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento para este dia.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items
              .slice()
              .sort((a, b) => {
                const aDate = typeof a.dateTime === 'string' ? parseISO(a.dateTime) : a.dateTime
                const bDate = typeof b.dateTime === 'string' ? parseISO(b.dateTime) : b.dateTime
                return aDate.getTime() - bDate.getTime()
              })
              .map((apt) => {
                const aptDate = typeof apt.dateTime === 'string' 
                  ? parseISO(apt.dateTime) 
                  : apt.dateTime
                const time = format(aptDate, 'HH:mm', { locale: ptBR })
                
                return (
                  <button
                    key={apt.id}
                    onClick={() => {
                      onAppointmentClick(apt.id)
                      onOpenChange(false)
                    }}
                    className="w-full text-left rounded-md border px-4 py-3 hover:bg-accent transition-colors"
                    title="Abrir detalhes"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="font-mono">
                            {time}
                          </Badge>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${statusColor[apt.status]}`}
                          >
                            {statusLabel[apt.status]}
                          </span>
                        </div>
                        <div className="font-medium truncate">
                          {apt.client?.name || 'Cliente não informado'}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {apt.service?.name || 'Serviço não informado'}
                        </div>
                        {apt.professional?.user?.name && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            com {apt.professional.user.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {items.length > 0 && `${items.length} agendamento${items.length > 1 ? 's' : ''}`}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
