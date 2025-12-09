import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Pencil, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { Appointment, Pagination as PaginationType } from '@/types/appointments';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/appointments';

interface AppointmentsListProps {
  appointments: Appointment[];
  loading: boolean;
  pagination: PaginationType; 
  onPageChange: (page: number) => void;
  onView: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export function AppointmentsList({
  appointments,
  loading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onCancel,
}: AppointmentsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum agendamento encontrado.</p>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price));
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Data/Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow
                key={appointment.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => onView(appointment)}
              >
                <TableCell>
                  <div className="font-medium">
                    {format(new Date(appointment.dateTime), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {appointment.client?.name || 'Sem nome'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.client?.phone || appointment.client?.email || ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{appointment.service.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(appointment.service.price)}
                  </div>
                </TableCell>
                <TableCell>
                  {appointment.professional.user?.name || 'Sem nome'}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[appointment.status]}>
                    {STATUS_LABELS[appointment.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={() => onView(appointment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onEdit(appointment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onCancel(appointment)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-card rounded-lg border p-4 space-y-3"
            onClick={() => onView(appointment)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {format(new Date(appointment.dateTime), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {appointment.startTime} - {appointment.endTime}
                </div>
              </div>
              <Badge className={STATUS_COLORS[appointment.status]}>
                {STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
            <div>
              <div className="font-medium">
                {appointment.client?.name || 'Sem nome'}
              </div>
              <div className="text-sm text-muted-foreground">
                {appointment.client?.phone || appointment.client?.email || ''}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>{appointment.service.name}</span>
              <span className="text-muted-foreground">
                {appointment.professional.user?.name || 'Sem nome'}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" onClick={() => onView(appointment)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEdit(appointment)}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onCancel(appointment)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => onPageChange(i + 1)}
                  isActive={pagination.page === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                className={
                  pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
