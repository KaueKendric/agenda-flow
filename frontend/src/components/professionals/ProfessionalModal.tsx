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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { professionalsApi } from '@/lib/professionals-api';
import { ProfessionalFormTab } from './ProfessionalFormTab';
import { ProfessionalServicesTab } from './ProfessionalServicesTab';
import type { Professional } from '@/types/professional';

interface ProfessionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialties: string[];
  bio: string;
  commission: number;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialties: [],
  bio: '',
  commission: 30,
};

export function ProfessionalModal({
  open,
  onOpenChange,
  professional,
  onSuccess,
}: ProfessionalModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProfessional, setSavedProfessional] = useState<Professional | null>(null);

  const isEditing = !!professional;

  useEffect(() => {
    if (open) {
      if (professional) {
        setFormData({
          name: professional.user.name || '',
          email: professional.user.email || '',
          password: '',
          phone: professional.phone || '',
          specialties: professional.specialties || [],
          bio: professional.bio || '',
          commission: professional.commission || 30,
        });
        setSavedProfessional(professional);
      } else {
        setFormData(initialFormData);
        setSavedProfessional(null);
      }
      setErrors({});
      setActiveTab('form');
    }
  }, [open, professional]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = 'Selecione pelo menos uma especialidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (!validate()) return;

  setIsSubmitting(true);
  try {
    if (isEditing && professional) {
      await professionalsApi.update(professional.id, {
        phone: formData.phone || undefined,
        specialties: formData.specialties,
        bio: formData.bio || undefined,
        commission: Number(formData.commission),
      });
      toast({
        title: 'Sucesso',
        description: 'Profissional atualizado com sucesso',
      });
    } else {
      // Create user first
      const userResponse = await professionalsApi.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'PROFESSIONAL',
      });

      // Then create professional
      const newProfessional = await professionalsApi.create({
        userId: userResponse.user.id,
        phone: formData.phone || undefined,
        specialties: formData.specialties,
        bio: formData.bio || undefined,
        commission: Number(formData.commission), 
      });

      setSavedProfessional(newProfessional);
      toast({
        title: 'Sucesso',
        description: 'Profissional criado com sucesso',
      });
    }

    onSuccess();
    
    if (!isEditing) {
      setActiveTab('services');
    } else {
      onOpenChange(false);
    }
  } catch (error: unknown) {
    const message = error instanceof Error 
      ? error.message 
      : 'Erro ao salvar profissional';
    
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive',
    });

    if (message.includes('email') || message.includes('Email')) {
      setErrors({ email: 'Este email já está em uso' });
    }
  } finally {
    setIsSubmitting(false);
  }
};


  const currentProfessional = savedProfessional || professional || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do profissional'
              : 'Preencha os dados para cadastrar um novo profissional'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="services" disabled={!currentProfessional}>
              Serviços
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <ProfessionalFormTab
              formData={formData}
              onChange={setFormData}
              errors={errors}
              isEditing={isEditing}
            />
          </TabsContent>

          <TabsContent value="services">
            {currentProfessional && (
              <ProfessionalServicesTab
                professional={currentProfessional}
                onUpdate={onSuccess}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {activeTab === 'services' ? 'Fechar' : 'Cancelar'}
          </Button>
          {activeTab === 'form' && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Salvar alterações' : 'Criar profissional'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
