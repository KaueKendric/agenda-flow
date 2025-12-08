import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api';
import { professionalsApi } from '@/lib/professionals-api';
import { ProfessionalsList } from '@/components/professionals/ProfessionalsList';
import { ProfessionalModal } from '@/components/professionals/ProfessionalModal';
import { SPECIALTIES, type Professional } from '@/types/professional';

export default function Professionals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  const loadProfessionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await professionalsApi.list();
      setProfessionals(data);
    } catch (error) {
      console.error('Error loading professionals:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os profissionais',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    setUser(authService.getStoredUser());
    loadProfessionals();
  }, [navigate, loadProfessionals]);

  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await professionalsApi.delete(id);
      toast({
        title: 'Sucesso',
        description: 'Profissional excluído com sucesso',
      });
      loadProfessionals();
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : 'Não foi possível excluir o profissional';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalSuccess = () => {
    loadProfessionals();
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialties([]);
  };

  const filteredProfessionals = useMemo(() => {
    return professionals.filter(professional => {
      const matchesSearch = !searchTerm || 
        professional.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialties = selectedSpecialties.length === 0 ||
        selectedSpecialties.some(s => professional.specialties.includes(s));

      return matchesSearch && matchesSpecialties;
    });
  }, [professionals, searchTerm, selectedSpecialties]);

  const hasActiveFilters = searchTerm || selectedSpecialties.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Profissionais</h1>
                  <p className="text-muted-foreground">
                    Gerencie os profissionais do seu estabelecimento
                  </p>
                </div>
                <Button onClick={() => {
                  setSelectedProfessional(null);
                  setModalOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Profissional
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Especialidades
                      {selectedSpecialties.length > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">
                          {selectedSpecialties.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filtrar por especialidade</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SPECIALTIES.map((specialty) => (
                      <DropdownMenuCheckboxItem
                        key={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {selectedSpecialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSpecialties.map((specialty) => (
                    <Badge 
                      key={specialty}
                      variant="secondary"
                      className="bg-primary/10 text-primary gap-1 pr-1"
                    >
                      {specialty}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-primary/20"
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Results count */}
              {!isLoading && (
                <p className="text-sm text-muted-foreground">
                  {filteredProfessionals.length} profissional{filteredProfessionals.length !== 1 ? 'is' : ''} encontrado{filteredProfessionals.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Professionals Grid */}
              <ProfessionalsList
                professionals={filteredProfessionals}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      <ProfessionalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        professional={selectedProfessional}
        onSuccess={handleModalSuccess}
      />
    </SidebarProvider>
  );
}
