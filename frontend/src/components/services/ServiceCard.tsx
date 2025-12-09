import { Clock, DollarSign, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/service';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  isDeleting: boolean;
  canEdit: boolean;
}

export function ServiceCard({ 
  service, 
  onEdit, 
  onDelete, 
  isDeleting,
  canEdit 
}: ServiceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isGlobal = !service.professionalId;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {service.name}
              </h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>
            {isGlobal && (
              <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0">
                Global
              </Badge>
            )}
          </div>

          {/* Professional (if linked) */}
          {service.professional && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{service.professional.user.name}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{service.duration} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(service.price)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {canEdit && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onEdit(service)}
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(service)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
