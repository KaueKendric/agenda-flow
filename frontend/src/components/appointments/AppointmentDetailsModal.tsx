import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Briefcase,
  FileText,
  Loader2,
  CheckCircle,
  PlayCircle,
  XCircle,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { appointmentsApi } from '@/lib/appointments-api';
import type { Appointment, AppointmentStatus } from '@/types/appointment';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/appointment'

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onEdit: (appointment: Appointment) => void;
}

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  onStatusChange,
  onEdit,
}: AppointmentDetailsModalProps) {
  const [loading, setLoading] = useState<AppointmentStatus | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!appointment) return null;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price));
  };

  const handleStatusChange = async (status: AppointmentStatus) => {
    setLoading(status);
    try {
      await appointmentsApi.updateStatus(appointment.id, status);
      onStatusChange(appointment.id, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    setConfirmCancel(false);
    await handleStatusChange('CANCELLED');
    onOpenChange(false);
  };

  const canConfirm = appointment.status === 'SCHEDULED';
  const canStart = appointment.status === 'CONFIRMED';
  const canComplete = appointment.status === 'IN_PROGRESS';
  const canCancel = !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detalhes do Agendamento</DialogTitle>
              <Badge className={STATUS_COLORS[appointment.status]}>
                {STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date & Time */}
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {format(new Date(appointment.dateTime), "EEEE, dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {appointment.startTime} - {appointment.endTime} ({appointment.duration} min)
                </div>
              </div>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </h4>
              <div className="pl-6 space-y-1 text-sm">
                <p>{appointment.client.user.name || 'Sem nome'}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {appointment.client.user.email}
                </p>
                {appointment.client.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {appointment.client.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Professional */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Profissional
              </h4>
              <div className="pl-6 space-y-1 text-sm">
                <p>{appointment.professional.user.name || 'Sem nome'}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {appointment.professional.user.email}
                </p>
              </div>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <h4 className="font-medium">Serviço</h4>
              <div className="pl-0 p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="font-medium">{appointment.service.name}</p>
                {appointment.service.description && (
                  <p className="text-sm text-muted-foreground">{appointment.service.description}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <span>Duração: {appointment.service.duration} min</span>
                  <span className="font-medium">
                    {appointment.price ? formatPrice(appointment.price) : formatPrice(appointment.service.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </h4>
                <p className="pl-6 text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {canConfirm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('CONFIRMED')}
                  disabled={loading !== null}
                  className="flex-1 sm:flex-none"
                >
                  {loading === 'CONFIRMED' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Confirmar
                </Button>
              )}
              {canStart && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={loading !== null}
                  className="flex-1 sm:flex-none"
                >
                  {loading === 'IN_PROGRESS' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-1" />
                  )}
                  Iniciar
                </Button>
              )}
              {canComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('COMPLETED')}
                  disabled={loading !== null}
                  className="flex-1 sm:flex-none"
                >
                  {loading === 'COMPLETED' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Concluir
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(appointment);
                  onOpenChange(false);
                }}
                disabled={loading !== null}
                className="flex-1 sm:flex-none"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmCancel(true)}
                  disabled={loading !== null}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será marcado como cancelado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
