import { Calendar, Briefcase, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Professional } from '@/types/professional';

interface ProfessionalCardProps {
  professional: Professional;
  onEdit: (professional: Professional) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ProfessionalCard({ 
  professional, 
  onEdit, 
  onDelete,
  isDeleting 
}: ProfessionalCardProps) {
  const initials = professional.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PR';

  const displayedSpecialties = professional.specialties.slice(0, 3);
  const remainingCount = professional.specialties.length - 3;

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={professional.user.image} alt={professional.user.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {professional.user.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {professional.user.email}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {displayedSpecialties.map((specialty) => (
                <Badge 
                  key={specialty} 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border-0 text-xs"
                >
                  {specialty}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="bg-muted text-muted-foreground border-0 text-xs"
                >
                  +{remainingCount}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <span className="font-medium text-foreground">{professional.specialties.length}</span> esp.
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4 text-secondary" />
            <span className="text-sm">
              <span className="font-medium text-foreground">{professional._count?.services || 0}</span> serv.
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <span className="font-medium text-foreground">{professional._count?.appointments || 0}</span> agend.
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(professional)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir profissional</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir <strong>{professional.user.name}</strong>? 
                  {(professional._count?.appointments || 0) > 0 && (
                    <span className="block mt-2 text-destructive">
                      Este profissional possui {professional._count?.appointments} agendamentos vinculados.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(professional.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
