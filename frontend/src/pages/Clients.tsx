import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { clientsApi } from '@/lib/clients-api'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search } from 'lucide-react'
import type { Client } from '@/types/clients'
import type { CreateClientInput, UpdateClientInput } from '@/lib/clients-api'

const ITEMS_PER_PAGE = 10

type SortColumn = 'name' | 'email' | 'city' | 'createdAt'
type SortOrder = 'asc' | 'desc'

interface Filters {
  sortBy: SortColumn
  sortOrder: SortOrder
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
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string>()

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
      const data = await clientsApi.list()
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
  }, [toast])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients]

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (client) =>
          client.user.name?.toLowerCase().includes(searchLower) ||
          client.user.email.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aVal: string | Date = ''
        let bVal: string | Date = ''

        switch (filters.sortBy) {
          case 'name':
            aVal = a.user.name || ''
            bVal = b.user.name || ''
            break
          case 'email':
            aVal = a.user.email
            bVal = b.user.email
            break
          case 'city':
            aVal = a.city || ''
            bVal = b.city || ''
            break
          case 'createdAt':
            aVal = new Date(a.createdAt)
            bVal = new Date(b.createdAt)
            break
        }

        if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [clients, search, filters])

  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE)
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

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await clientsApi.delete(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
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
        setClients((prev) => [...prev, created])
        toast({
          title: 'Cliente criado',
          description: 'O novo cliente foi adicionado com sucesso.',
        })
      }
      setEditingClient(null)
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
              <Button onClick={handleNewClient}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>

            {/* Table */}
            <ClientTable
              clients={paginatedClients}
              isLoading={isLoading}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
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

      {/* Modal */}
      <ClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={editingClient}
        onSave={handleSave}
        userId={user?.id || ''}
      />
    </SidebarProvider>
  )
}
