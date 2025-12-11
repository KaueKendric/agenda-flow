import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Clock, AlertCircle } from 'lucide-react';
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
import type { Appointment } from '@/types/appointments';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
        setAvailableSlots([]);
        try {
          console.log('🔍 Buscando horários disponíveis...', {
            professionalId: formData.professionalId,
            serviceId: formData.serviceId,
            date: format(formData.date, 'yyyy-MM-dd'),
          });

          const response = await appointmentsApi.getAvailableSlots({
            professionalId: formData.professionalId,
            serviceId: formData.serviceId,
            date: format(formData.date, 'yyyy-MM-dd'),
          });

          console.log('📥 Slots disponíveis:', response.availableSlots);
          setAvailableSlots(response.availableSlots || []);
        } catch (error: unknown) {
          console.error('❌ Erro ao buscar horários:', error);
          const message = error instanceof Error 
            ? error.message 
            : 'Não foi possível buscar os horários disponíveis.';
          toast({
            title: 'Erro',
            description: message,
            variant: 'destructive',
          });

          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [formData.professionalId, formData.serviceId, formData.date, toast]);

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.professionalId || !formData.serviceId || !formData.date || !formData.startTime) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
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

      console.log('💾 Salvando agendamento:', data);

      if (appointment) {
        await appointmentsApi.update(appointment.id, data);
      } else {
        await appointmentsApi.create(data);
      }

      toast({
        title: 'Sucesso!',
        description: appointment ? 'Agendamento atualizado.' : 'Agendamento criado.',
      });

      onSave();
      onOpenChange(false);
    } catch (error: unknown) {
  console.error('❌ Erro ao salvar:', error);
  const message = error instanceof Error 
    ? error.message 
    : 'Não foi possível salvar o agendamento.';
  toast({
    title: 'Erro ao salvar',
    description: message,
    variant: 'destructive',
  });

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

  const canSubmit = 
    formData.clientId && 
    formData.professionalId && 
    formData.serviceId && 
    formData.date && 
    formData.startTime &&
    availableSlots.includes(formData.startTime); // VALIDAÇÃO EXTRA

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
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedService.duration} min
                </span>
                <span>•</span>
                <span>{formatPrice(selectedService.price)}</span>
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
                    'w-full justify-start text-left font-normal',
                    !formData.date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date
                    ? format(formData.date, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setFormData({ ...formData, date, startTime: '' });
                    }
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  locale={ptBR}
                  showOutsideDays={false}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot */}
          <div className="grid gap-2">
            <Label htmlFor="time">Horário *</Label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/30">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando horários disponíveis...
              </div>
            ) : availableSlots.length > 0 ? (
              <>
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
                        <span className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {slot}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                {availableSlots.length} horário{availableSlots.length !== 1 ? 's' : ''} disponíve{availableSlots.length !== 1 ? 'is' : 'l'} ✅
                </p>
              </>
            ) : formData.professionalId && formData.serviceId && formData.date ? (
              <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500 py-2 px-3 border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Nenhum horário disponível para esta data. Tente outra data ou profissional.</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/30">
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
            disabled={loading || !canSubmit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {appointment ? 'Salvar Alterações' : 'Criar Agendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
