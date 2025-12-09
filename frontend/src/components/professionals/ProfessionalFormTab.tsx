import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SPECIALTIES } from '@/types/professionals';

interface ProfessionalFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialties: string[];
  bio: string;
  commission: number;
}

interface ProfessionalFormTabProps {
  formData: ProfessionalFormData;
  onChange: (data: ProfessionalFormData) => void;
  errors: Record<string, string>;
  isEditing: boolean;
}

export function ProfessionalFormTab({ 
  formData, 
  onChange, 
  errors,
  isEditing 
}: ProfessionalFormTabProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange({ ...formData, phone: formatted });
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      onChange({ ...formData, specialties: [...formData.specialties, specialty] });
    }
  };

  const removeSpecialty = (specialty: string) => {
    onChange({ 
      ...formData, 
      specialties: formData.specialties.filter(s => s !== specialty) 
    });
  };

  const availableSpecialties = SPECIALTIES.filter(
    s => !formData.specialties.includes(s)
  );

  return (
    <div className="space-y-6 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            placeholder="Nome do profissional"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            disabled={isEditing}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            disabled={isEditing}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            placeholder="Senha de acesso"
            value={formData.password}
            onChange={(e) => onChange({ ...formData, password: e.target.value })}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
          <p className="text-xs text-muted-foreground">
            O profissional usará esta senha para acessar o sistema
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          placeholder="(00) 00000-0000"
          value={formData.phone}
          onChange={handlePhoneChange}
          maxLength={15}
        />
      </div>

      <div className="space-y-2">
        <Label>Especialidades *</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.specialties.map((specialty) => (
            <Badge 
              key={specialty}
              variant="secondary"
              className="bg-primary/20 text-primary gap-1 pr-1"
            >
              {specialty}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-primary/20"
                onClick={() => removeSpecialty(specialty)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availableSpecialties.map((specialty) => (
            <Badge
              key={specialty}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => addSpecialty(specialty)}
            >
              + {specialty}
            </Badge>
          ))}
        </div>
        {errors.specialties && (
          <p className="text-sm text-destructive">{errors.specialties}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biografia</Label>
        <Textarea
          id="bio"
          placeholder="Breve descrição sobre o profissional..."
          value={formData.bio}
          onChange={(e) => onChange({ ...formData, bio: e.target.value })}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.bio.length}/500 caracteres
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Comissão (%)</Label>
          <span className="text-sm font-medium text-primary">
            {formData.commission}%
          </span>
        </div>
        <Slider
          value={[formData.commission]}
          onValueChange={([value]) => onChange({ ...formData, commission: value })}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
