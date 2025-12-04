import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { appointmentsApi } from '@/lib/appointments-api';
import type { Appointment } from '@/types/appointment';

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSave: () => void;
  professionals: { id: string; name: string }[];
  services: { id: string; name: string; duration: number; price: string }[];
  clients: { id: string; name: string }[];
}

export function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSave,
  professionals,
  services,
  clients,
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    clientId: '',
    professionalId: '',
    serviceId: '',
    date: undefined as Date | undefined,
    startTime: '',
    notes: '',
  });

  const selectedService = services.find((s) => s.id === formData.serviceId);

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientId: appointment.client.id,
        professionalId: appointment.professional.id,
        serviceId: appointment.service.id,
        date: new Date(appointment.dateTime),
        startTime: appointment.startTime,
        notes: appointment.notes || '',
      });
    } else {
      setFormData({
        clientId: '',
        professionalId: '',
        serviceId: '',
        date: undefined,
        startTime: '',
        notes: '',
      });
    }
    setAvailableSlots([]);
  }, [appointment, open]);

  // Fetch available slots when professional, service, and date are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.professionalId && formData.serviceId && formData.date) {
        setLoadingSlots(true);
        try {
          console.log('🔍 Fetching available slots...', {
            professionalId: formData.professionalId,
            serviceId: formData.serviceId,
            date: format(formData.date, 'yyyy-MM-dd'),
          });

          const response = await appointmentsApi.getAvailableSlots({
            professionalId: formData.professionalId,
            serviceId: formData.serviceId,
            date: format(formData.date, 'yyyy-MM-dd'),
          });

          console.log('📥 Available slots response:', response);
          setAvailableSlots(response.availableSlots || []);
        } catch (error) {
          console.error('❌ Failed to fetch available slots:', error);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [formData.professionalId, formData.serviceId, formData.date]);

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.professionalId || !formData.serviceId || !formData.date || !formData.startTime) {
      return;
    }

    setLoading(true);
    try {
      const data = {
        clientId: formData.clientId,
        professionalId: formData.professionalId,
        serviceId: formData.serviceId,
        date: format(formData.date, 'yyyy-MM-dd'),
        startTime: formData.startTime,
        notes: formData.notes || undefined,
      };

      console.log('💾 Saving appointment:', data);

      if (appointment) {
        await appointmentsApi.update(appointment.id, data);
      } else {
        await appointmentsApi.create(data);
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Failed to save appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Client */}
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente *</Label>
            {clients.length > 0 ? (
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="client"
                placeholder="ID do cliente (UUID)"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              />
            )}
          </div>

          {/* Professional */}
          <div className="grid gap-2">
            <Label htmlFor="professional">Profissional *</Label>
            {professionals.length > 0 ? (
              <Select
                value={formData.professionalId}
                onValueChange={(value) =>
                  setFormData({ ...formData, professionalId: value, startTime: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="professional"
                placeholder="ID do profissional (UUID)"
                value={formData.professionalId}
                onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
              />
            )}
          </div>

          {/* Service */}
          <div className="grid gap-2">
            <Label htmlFor="service">Serviço *</Label>
            {services.length > 0 ? (
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value, startTime: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="service"
                placeholder="ID do serviço (UUID)"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              />
            )}
            {selectedService && (
              <div className="text-sm text-muted-foreground">
                Duração: {selectedService.duration} min | Preço: {formatPrice(selectedService.price)}
              </div>
            )}
          </div>

          {/* Date */}
            <div className="grid gap-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 z-[9999]" 
                  align="start"
                  side="top"
                  sideOffset={5}
                  avoidCollisions={true}
                  collisionPadding={10}
                >
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date, startTime: '' });
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>


          {/* Time Slot */}
          <div className="grid gap-2">
            <Label htmlFor="time">Horário *</Label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando horários disponíveis...
              </div>
            ) : availableSlots.length > 0 ? (
              <Select
                value={formData.startTime}
                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : formData.professionalId && formData.serviceId && formData.date ? (
              <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/50">
                ⚠️ Nenhum horário disponível para esta data.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md">
                Selecione profissional, serviço e data para ver os horários disponíveis.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o agendamento..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.clientId || !formData.professionalId || !formData.serviceId || !formData.date || !formData.startTime}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {appointment ? 'Salvar Alterações' : 'Criar Agendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
