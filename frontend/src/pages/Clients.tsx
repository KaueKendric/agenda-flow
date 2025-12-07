import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ClientTable } from '@/components/clients/ClientTable'
import { ClientModal } from '@/components/clients/ClientModal'
import { ClientDetailsModal } from '@/components/clients/ClientDetailsModal'
import { clientsApi } from '@/lib/clients-api'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Download, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Client } from '@/types/clients'
import type { CreateClientInput, UpdateClientInput } from '@/lib/clients-api'

const ITEMS_PER_PAGE = 10

type SortColumn = 'name' | 'email' | 'city' | 'createdAt' | 'totalAppointments'
type SortOrder = 'asc' | 'desc'

interface Filters {
  sortBy: SortColumn
  sortOrder: SortOrder
  statusFilter: 'all' | 'active' | 'inactive'
  tagFilter: string | null
}

export default function Clients() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'name',
    sortOrder: 'asc',
    statusFilter: 'all',
    tagFilter: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string>()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const user = useMemo(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth')
    }
  }, [navigate])

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const filterParams: { search?: string; isActive?: boolean } = {}

      if (search) {
        filterParams.search = search
      }

      if (filters.statusFilter === 'active') {
        filterParams.isActive = true
      } else if (filters.statusFilter === 'inactive') {
        filterParams.isActive = false
      }

      const data = await clientsApi.list(filterParams)
      setClients(data)
    } catch {
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Não foi possível carregar a lista de clientes.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, search, filters.statusFilter])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Pegar todas as tags únicas dos clientes
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    clients.forEach((client) => {
      client.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [clients])

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients]

    // Filter by tag
    if (filters.tagFilter) {
      result = result.filter((client) =>
        client.tags.includes(filters.tagFilter!)
      )
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aVal: string | Date | number = ''
        let bVal: string | Date | number = ''

        switch (filters.sortBy) {
          case 'name':
            aVal = a.name || ''
            bVal = b.name || ''
            break
          case 'email':
            aVal = a.email
            bVal = b.email
            break
          case 'city':
            aVal = a.city || ''
            bVal = b.city || ''
            break
          case 'createdAt':
            aVal = new Date(a.createdAt)
            bVal = new Date(b.createdAt)
            break
          case 'totalAppointments':
            aVal = a.totalAppointments || 0
            bVal = b.totalAppointments || 0
            break
        }

        if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [clients, filters])

  const totalPages = Math.ceil(
    filteredAndSortedClients.length / ITEMS_PER_PAGE
  )
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (column: SortColumn) => {
    setFilters((prev: Filters) => ({
      ...prev,
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setModalOpen(true)
  }

  const handleViewDetails = (clientId: string) => {
    setSelectedClientId(clientId)
    setDetailsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return

    setDeletingId(id)
    try {
      await clientsApi.delete(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi removido com sucesso.',
      })
    } catch {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o cliente.',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(undefined)
    }
  }

  const handleSave = async (data: CreateClientInput | UpdateClientInput) => {
    try {
      if (editingClient) {
        const updated = await clientsApi.update(
          editingClient.id,
          data as UpdateClientInput
        )
        setClients((prev) =>
          prev.map((c) => (c.id === editingClient.id ? updated : c))
        )
        toast({
          title: 'Cliente atualizado',
          description: 'As informações foram salvas com sucesso.',
        })
      } else {
        const created = await clientsApi.create(data as CreateClientInput)
        setClients((prev) => [created, ...prev])
        toast({
          title: 'Cliente criado',
          description: 'O novo cliente foi adicionado com sucesso.',
        })
      }
      setEditingClient(null)
      loadClients()
    } catch {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o cliente.',
        variant: 'destructive',
      })
      throw Error
    }
  }

  const handleNewClient = () => {
    setEditingClient(null)
    setModalOpen(true)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedClients.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    }
  }

  const handleExportAll = async () => {
    try {
      const blob = await clientsApi.exportCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Exportação concluída',
        description: 'Os dados foram exportados com sucesso.',
      })
    } catch {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      })
    }
  }

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'Nenhum cliente selecionado',
        description: 'Selecione pelo menos um cliente para exportar.',
        variant: 'destructive',
      })
      return
    }

    try {
      const blob = await clientsApi.exportCSV(selectedIds)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clientes-selecionados-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Exportação concluída',
        description: `${selectedIds.length} cliente(s) exportado(s) com sucesso.`,
      })
    } catch {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      })
    }
  }

  const clearFilters = () => {
    setFilters({
      sortBy: 'name',
      sortOrder: 'asc',
      statusFilter: 'all',
      tagFilter: null,
    })
    setSearch('')
  }

  const hasActiveFilters =
    search !== '' ||
    filters.statusFilter !== 'all' ||
    filters.tagFilter !== null

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader user={user} />

          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                <p className="text-muted-foreground">
                  Gerencie os clientes do seu negócio
                </p>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportAll}>
                      Exportar todos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportSelected}
                      disabled={selectedIds.length === 0}
                    >
                      Exportar selecionados ({selectedIds.length})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleNewClient}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>

              <Select
                value={filters.statusFilter}
                onValueChange={(value: 'all' | 'active' | 'inactive') => {
                  setFilters((prev) => ({ ...prev, statusFilter: value }))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              {availableTags.length > 0 && (
                <Select
                  value={filters.tagFilter || 'all'}
                  onValueChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      tagFilter: value === 'all' ? null : value,
                    }))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as tags</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar filtros
                </Button>
              )}
            </div>

            {/* Info de seleção */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedIds.length} cliente(s) selecionado(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Limpar seleção
                </Button>
              </div>
            )}

            {/* Table */}
            <ClientTable
              clients={paginatedClients}
              isLoading={isLoading}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              deletingId={deletingId}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={editingClient}
        onSave={handleSave}
      />

      <ClientDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        clientId={selectedClientId}
        onEdit={handleEdit}
      />
    </SidebarProvider>
  )
}
