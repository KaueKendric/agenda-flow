import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { appointmentsApi } from '@/lib/appointments-api';
import { useToast } from '@/hooks/use-toast';

interface UpcomingAppointmentsProps {
  data: Array<{
    id: string;
    time: string;
    date: string;
    client: string;
    service: string;
    professional: string;
    status: string;
  }>;
  onUpdate?: () => void;
}

const statusColors = {
  SCHEDULED: 'bg-yellow-500/20 text-yellow-500',
  CONFIRMED: 'bg-green-500/20 text-green-500',
  CANCELLED: 'bg-red-500/20 text-red-500',
  COMPLETED: 'bg-blue-500/20 text-blue-500',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-500',
  NO_SHOW: 'bg-gray-500/20 text-gray-500',
};

const statusLabels = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
  IN_PROGRESS: 'Em Andamento',
  NO_SHOW: 'Faltou',
};

export function UpcomingAppointments({ data, onUpdate }: UpcomingAppointmentsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfirm = async (id: string) => {
    setLoading(id);
    try {
      await appointmentsApi.updateStatus(id, 'CONFIRMED');
      toast({
        title: 'Agendamento confirmado!',
        description: 'O status foi atualizado com sucesso.',
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Erro ao confirmar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    setLoading(id);
    try {
      await appointmentsApi.updateStatus(id, 'CANCELLED');
      toast({
        title: 'Agendamento cancelado',
        description: 'O status foi atualizado com sucesso.',
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  if (data.length === 0) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="text-lg font-semibold mb-4">Próximos Agendamentos</h3>
        <p className="text-muted-foreground text-center py-8">Nenhum agendamento próximo</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Próximos Agendamentos</h3>
        <Button variant="ghost" size="sm">Ver todos</Button>
      </div>

      <div className="space-y-4">
        {data.map((appointment) => {
          const canConfirm = appointment.status === 'SCHEDULED';
          const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);
          const isLoading = loading === appointment.id;

          return (
            <div
              key={appointment.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{appointment.time}</p>
                  <Badge className={statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-500/20'}>
                    {statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {appointment.client}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {appointment.service}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  Com {appointment.professional}
                </p>
              </div>

              <div className="flex gap-2">
                {canConfirm && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                    onClick={() => handleConfirm(appointment.id)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                {canCancel && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={isLoading}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
