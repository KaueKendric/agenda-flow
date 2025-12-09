import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { servicesApi } from '@/lib/services-api';
import type { Service } from '@/types/services';

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  duration: number;
  price: number;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  duration: 30,
  price: 0,
};

export function ServiceModal({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!service;

  useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          name: service.name,
          description: service.description || '',
          duration: service.duration,
          price: service.price,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [open, service]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.duration < 5) {
      newErrors.duration = 'Duração mínima é 5 minutos';
    }

    if (formData.duration > 600) {
      newErrors.duration = 'Duração máxima é 600 minutos (10 horas)';
    }

    if (formData.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        duration: Number(formData.duration),
        price: Number(formData.price),
        professionalId: null,
      };

      if (isEditing && service) {
        await servicesApi.update(service.id, data);
        toast({
          title: 'Sucesso',
          description: 'Serviço atualizado com sucesso',
        });
      } else {
        await servicesApi.create(data);
        toast({
          title: 'Sucesso',
          description: 'Serviço criado com sucesso',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : 'Erro ao salvar serviço';
      
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do serviço'
              : 'Preencha os dados para criar um novo serviço'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do serviço *</Label>
            <Input
              id="name"
              placeholder="Ex: Corte Masculino"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Breve descrição do serviço..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min) *</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="600"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className={errors.duration ? 'border-destructive' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Salvar alterações' : 'Criar serviço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
