import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, X } from 'lucide-react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api'
import { servicesApi } from '@/lib/services-api'
import { ServicesList } from '@/components/services/ServicesList'
import { ServiceModal } from '@/components/services/ServiceModal'
import type { Service } from '@/types/services'

export default function Services() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [user, setUser] = useState<{ name?: string; email: string; role: string } | null>(null)

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'global' | 'linked'>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  const loadServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await servicesApi.list()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth')
      return
    }
    const currentUser = authService.getStoredUser()
    setUser(currentUser)
    loadServices()
  }, [navigate, loadServices])

  const handleEdit = (service: Service) => {
    if (!isAdmin) {
      toast({
        title: 'Sem permissão',
        description: 'Apenas administradores podem editar serviços',
        variant: 'destructive',
      })
      return
    }
    setSelectedService(service)
    setModalOpen(true)
  }

  const handleDeleteClick = (service: Service) => {
    if (!isAdmin) {
      toast({
        title: 'Sem permissão',
        description: 'Apenas administradores podem excluir serviços',
        variant: 'destructive',
      })
      return
    }
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!serviceToDelete) return

    setDeletingId(serviceToDelete.id)
    try {
      await servicesApi.delete(serviceToDelete.id)
      toast({
        title: 'Sucesso',
        description: 'Serviço excluído com sucesso',
      })
      loadServices()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível excluir o serviço'
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    loadServices()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        !searchTerm ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType =
        filterType === 'all' ||
        (filterType === 'global' && !service.professionalId) ||
        (filterType === 'linked' && !!service.professionalId)

      return matchesSearch && matchesType
    })
  }, [services, searchTerm, filterType])

  const hasActiveFilters = searchTerm || filterType !== 'all'

  const stats = useMemo(
    () => ({
      total: services.length,
      global: services.filter((s) => !s.professionalId).length,
      linked: services.filter((s) => !!s.professionalId).length,
    }),
    [services]
  )

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
                  <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
                  <p className="text-muted-foreground">
                    {isAdmin
                      ? 'Gerencie os serviços oferecidos pelo estabelecimento'
                      : 'Visualize os serviços disponíveis'}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    onClick={() => {
                      setSelectedService(null)
                      setModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Serviço
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">Total de Serviços</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">Serviços Globais</p>
                  <p className="text-2xl font-bold text-primary mt-1">{stats.global}</p>
                </div>
                <div className="rounded-lg border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">Vinculados</p>
                  <p className="text-2xl font-bold text-muted-foreground mt-1">{stats.linked}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Tipo
                      {filterType !== 'all' && (
                        <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">
                          1
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filterType === 'all'}
                      onCheckedChange={() => setFilterType('all')}
                    >
                      Todos
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterType === 'global'}
                      onCheckedChange={() => setFilterType('global')}
                    >
                      Apenas Globais
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterType === 'linked'}
                      onCheckedChange={() => setFilterType('linked')}
                    >
                      Apenas Vinculados
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                )}
              </div>

              {/* Results count */}
              {!isLoading && (
                <p className="text-sm text-muted-foreground">
                  {filteredServices.length} serviço{filteredServices.length !== 1 ? 's' : ''} encontrado
                  {filteredServices.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Services Grid */}
              <ServicesList
                services={filteredServices}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                deletingId={deletingId}
                canEdit={isAdmin}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <ServiceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        service={selectedService}
        onSuccess={handleModalSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e pode afetar agendamentos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
