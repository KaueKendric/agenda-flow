import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientActions } from './ClientActions'
import { ArrowUpDown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Client } from '@/types/clients'

interface ClientTableProps {
  clients: Client[]
  isLoading: boolean
  onSort: (column: 'name' | 'email' | 'city' | 'createdAt') => void
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
  deletingId?: string
}

interface SortButtonProps {
  column: 'name' | 'email' | 'city' | 'createdAt'
  children: React.ReactNode
  onSort: (column: 'name' | 'email' | 'city' | 'createdAt') => void
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
  deletingId,
}: ClientTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
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
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
            <TableHead>
              <SortButton column="city" onSort={onSort}>
                Cidade
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton column="createdAt" onSort={onSort}>
                Criado em
              </SortButton>
            </TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.name || '-'}
              </TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone || '-'}</TableCell>
              <TableCell>
                {client.city
                  ? `${client.city}${client.state ? `/${client.state}` : ''}`
                  : '-'}
              </TableCell>
              <TableCell>
                {format(new Date(client.createdAt), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <ClientActions
                  client={client}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={deletingId === client.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
