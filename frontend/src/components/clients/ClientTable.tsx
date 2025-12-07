import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClientActions } from './ClientActions'
import { ArrowUpDown, Users, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Client } from '@/types/clients'

interface ClientTableProps {
  clients: Client[]
  isLoading: boolean
  onSort: (column: 'name' | 'email' | 'city' | 'createdAt' | 'totalAppointments') => void
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
  onViewDetails: (clientId: string) => void
  deletingId?: string
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
}

interface SortButtonProps {
  column: 'name' | 'email' | 'city' | 'createdAt' | 'totalAppointments'
  children: React.ReactNode
  onSort: (column: 'name' | 'email' | 'city' | 'createdAt' | 'totalAppointments') => void
}

function SortButton({ column, children, onSort }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => onSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

export function ClientTable({
  clients,
  isLoading,
  onSort,
  onEdit,
  onDelete,
  onViewDetails,
  deletingId,
  selectedIds,
  onSelectAll,
  onSelectOne,
}: ClientTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Agendamentos</TableHead>
              <TableHead>Último Agendamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comece adicionando seu primeiro cliente.
        </p>
      </div>
    )
  }

  const allSelected = clients.length > 0 && selectedIds.length === clients.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < clients.length

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Selecionar todos"
                className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />
            </TableHead>
            <TableHead>
              <SortButton column="name" onSort={onSort}>
                Nome
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton column="email" onSort={onSort}>
                Email
              </SortButton>
            </TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>
              <SortButton column="totalAppointments" onSort={onSort}>
                Agendamentos
              </SortButton>
            </TableHead>
            <TableHead>Último Agendamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(client.id)}
                  onCheckedChange={(checked) =>
                    onSelectOne(client.id, checked as boolean)
                  }
                  aria-label={`Selecionar ${client.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                {client.name || '-'}
              </TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone || '-'}</TableCell>
              <TableCell>
                {client.tags.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {client.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant={tag === 'VIP' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {client.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {client.totalAppointments || 0}
                </Badge>
              </TableCell>
              <TableCell>
                {client.lastAppointmentDate
                  ? format(new Date(client.lastAppointmentDate), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={client.isActive ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {client.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(client.id)}
                    aria-label={`Ver detalhes de ${client.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <ClientActions
                    client={client}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={deletingId === client.id}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
