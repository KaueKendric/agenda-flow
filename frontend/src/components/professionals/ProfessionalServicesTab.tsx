import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, DollarSign, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { professionalsApi, servicesApi } from '@/lib/professionals-api';
import type { Professional, ProfessionalService } from '@/types/professionals';

interface ProfessionalServicesTabProps {
  professional: Professional | null;
  onUpdate: () => void;
}

export function ProfessionalServicesTab({ 
  professional, 
  onUpdate 
}: ProfessionalServicesTabProps) {
  const { toast } = useToast();
  const [availableServices, setAvailableServices] = useState<ProfessionalService[]>([]);
  const [linkedServices, setLinkedServices] = useState<ProfessionalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ProfessionalService | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [serviceToUnlink, setServiceToUnlink] = useState<ProfessionalService | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');

  const loadServices = useCallback(async () => {
    if (!professional) return;
    
    setIsLoading(true);
    try {
      const [allServices, professionalData] = await Promise.all([
        servicesApi.getAvailable(),
        professionalsApi.getById(professional.id)
      ]);
      
      const linkedIds = new Set(professionalData.services.map(s => s.id));
      setAvailableServices(allServices.filter(s => !linkedIds.has(s.id)));
      setLinkedServices(professionalData.services);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [professional, toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleAddService = (service: ProfessionalService) => {
    setSelectedService(service);
    setCustomPrice(service.price.toString());
    setPriceModalOpen(true);
  };

  const confirmLinkService = async () => {
    if (!professional || !selectedService) return;
    
    setIsLinking(true);
    try {
      await professionalsApi.linkService(
        professional.id, 
        selectedService.id, 
        parseFloat(customPrice)
      );
      toast({
        title: 'Sucesso',
        description: 'Serviço vinculado com sucesso',
      });
      loadServices();
      onUpdate();
      setPriceModalOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : 'Não foi possível vincular o serviço';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleRemoveService = (service: ProfessionalService) => {
    setServiceToUnlink(service);
    setUnlinkModalOpen(true);
  };

  const confirmUnlinkService = async () => {
    if (!professional || !serviceToUnlink) return;
    
    setIsUnlinking(true);
    try {
      await professionalsApi.unlinkService(professional.id, serviceToUnlink.id);
      toast({
        title: 'Sucesso',
        description: 'Serviço removido com sucesso',
      });
      loadServices();
      onUpdate();
      setUnlinkModalOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : 'Não foi possível remover o serviço';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const handlePriceEdit = (service: ProfessionalService) => {
    setEditingPriceId(service.id);
    setEditingPriceValue(service.price.toString());
  };

  const savePriceEdit = async (serviceId: string) => {
    if (!professional) return;
    
    try {
      await professionalsApi.updateServicePrice(
        professional.id, 
        serviceId, 
        parseFloat(editingPriceValue)
      );
      toast({
        title: 'Sucesso',
        description: 'Preço atualizado',
      });
      loadServices();
      setEditingPriceId(null);
    } catch (error: unknown) {
      const message = error instanceof Error 
        ? error.message 
        : 'Não foi possível atualizar o preço';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const filteredAvailable = availableServices.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!professional) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Salve os dados do profissional primeiro para gerenciar serviços.
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="py-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Available Services */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Serviços Disponíveis
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchTerm 
                    ? 'Nenhum serviço encontrado'
                    : 'Nenhum serviço disponível para vincular'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailable.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{service.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration}min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleAddService(service)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Linked Services */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Serviços Vinculados
              {linkedServices.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                  {linkedServices.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : linkedServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum serviço vinculado. Adicione serviços na coluna ao lado.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{service.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration}min
                          </span>
                          {editingPriceId === service.id ? (
                            <Input
                              type="number"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              onBlur={() => savePriceEdit(service.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') savePriceEdit(service.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              className="h-6 w-24 text-xs"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handlePriceEdit(service)}
                              title="Clique para editar"
                            >
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(service.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveService(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Modal */}
      <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Serviço</DialogTitle>
            <DialogDescription>
              Defina o preço para {selectedService?.name} neste profissional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customPrice">Preço personalizado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="customPrice"
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="pl-10"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Preço padrão: {selectedService && formatCurrency(selectedService.price)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmLinkService} disabled={isLinking}>
              {isLinking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Service Confirmation */}
      <AlertDialog open={unlinkModalOpen} onOpenChange={setUnlinkModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{serviceToUnlink?.name}</strong>?
              Isso pode afetar agendamentos futuros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnlinkService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isUnlinking}
            >
              {isUnlinking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
