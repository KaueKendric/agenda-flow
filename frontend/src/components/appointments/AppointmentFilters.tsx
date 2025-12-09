import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, X, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types/appointments';
import { STATUS_LABELS } from '@/types/appointments';

interface AppointmentFiltersProps {
  filters: {
    status: string[];
    professionalId: string;
    serviceId: string;
    date: Date | undefined;
    search: string;
  };
  onFiltersChange: (filters: AppointmentFiltersProps['filters']) => void;
  professionals: { id: string; name: string }[];
  services: { id: string; name: string }[];
}

const ALL_STATUSES: AppointmentStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export function AppointmentFilters({
  filters,
  onFiltersChange,
  professionals,
  services,
}: AppointmentFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFiltersChange]);

  const toggleStatus = useCallback(
    (status: AppointmentStatus) => {
      const newStatuses = filters.status.includes(status)
        ? filters.status.filter((s) => s !== status)
        : [...filters.status, status];
      onFiltersChange({ ...filters, status: newStatuses });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = () => {
    setSearchInput('');
    onFiltersChange({
      status: [],
      professionalId: '',
      serviceId: '',
      date: undefined,
      search: '',
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.professionalId ||
    filters.serviceId ||
    filters.date ||
    filters.search;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do cliente..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((status) => (
          <Badge
            key={status}
            variant={filters.status.includes(status) ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors',
              filters.status.includes(status) && 'bg-primary hover:bg-primary/90'
            )}
            onClick={() => toggleStatus(status)}
          >
            {STATUS_LABELS[status]}
          </Badge>
        ))}
      </div>

      {/* Selects and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={filters.professionalId}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, professionalId: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os profissionais</SelectItem>
            {professionals.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.serviceId}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, serviceId: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !filters.date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.date ? format(filters.date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.date}
              onSelect={(date) => onFiltersChange({ ...filters, date })}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
