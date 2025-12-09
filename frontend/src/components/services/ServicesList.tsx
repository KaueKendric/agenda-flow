import { Loader2, Package } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import type { Service } from '@/types/services';

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  deletingId: string | null;
  canEdit: boolean;
}

export function ServicesList({
  services,
  isLoading,
  onEdit,
  onDelete,
  deletingId,
  canEdit,
}: ServicesListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum serviço encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {canEdit 
            ? 'Clique em "Novo Serviço" para criar o primeiro serviço do seu estabelecimento.'
            : 'Ainda não há serviços cadastrados no sistema.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === service.id}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
