import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfessionalCard } from './ProfessionalCard';
import type { Professional } from '@/types/professional';

interface ProfessionalsListProps {
  professionals: Professional[];
  isLoading: boolean;
  onEdit: (professional: Professional) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export function ProfessionalsList({ 
  professionals, 
  isLoading, 
  onEdit, 
  onDelete,
  deletingId 
}: ProfessionalsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[280px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum profissional cadastrado
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Clique em "+ Novo Profissional" para começar a adicionar profissionais ao seu estabelecimento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {professionals.map((professional) => (
        <ProfessionalCard
          key={professional.id}
          professional={professional}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === professional.id}
        />
      ))}
    </div>
  );
}
