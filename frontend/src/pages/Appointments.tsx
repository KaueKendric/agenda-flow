import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, List, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/api';
import { appointmentsApi } from '@/lib/appointments-api';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { AppointmentDetailsModal } from '@/components/appointments/AppointmentDetailsModal';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import type { Appointment, AppointmentStatus, Pagination } from '@/types/appointment';

// Temporary placeholder data - SUBSTITUIR com IDs reais do banco de dados
// Para obter IDs reais: npx prisma studio (no backend) e copiar os UUIDs
const PLACEHOLDER_PROFESSIONALS = [
  { id: '1', name: 'Dr. João Silva' },
  { id: '2', name: 'Dra. Maria Santos' },
  { id: '3', name: 'Dr. Pedro Costa' },
];

const PLACEHOLDER_SERVICES = [
  { id: '1', name: 'Consulta Geral', duration: 30, price: '150.00' },
  { id: '2', name: 'Avaliação', duration: 60, price: '250.00' },
  { id: '3', name: 'Retorno', duration: 20, price: '80.00' },
];

const PLACEHOLDER_CLIENTS = [
  { id: '1', name: 'Ana Costa' },
  { id: '2', name: 'Carlos Oliveira' },
  { id: '3', name: 'Beatriz Lima' },
];

export default function Appointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user] = useState(() => authService.getStoredUser());

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    status: [] as string[],
    professionalId: '',
    serviceId: '',
    date: undefined as Date | undefined,
    search: '',
  });

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth');
    }
  }, [navigate]);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    console.log('🔍 Fetching appointments...');
    try {
      const params: Record<string, string | number | string[] | undefined> = {
        page: pagination.page,
        limit: pagination.limit,
        professionalId: filters.professionalId || undefined,
        serviceId: filters.serviceId || undefined,
        date: filters.date ? format(filters.date, 'yyyy-MM-dd') : undefined,
        search: filters.search || undefined,
      };

      // Add status as array
      if (filters.status.length > 0) {
        params.status = filters.status;
      }

      console.log('📤 Request params:', params);
      const response = await appointmentsApi.list(params);
      console.log('📥 API Response:', response);
      
      setAppointments(response.appointments || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      console.log('✅ Appointments loaded:', response.appointments?.length || 0);
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handlePageChange = (page: number) => {
    setPagination((prev: Pagination) => ({ ...prev, page }));
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination((prev: Pagination) => ({ ...prev, page: 1 }));
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsCreateModalOpen(true);
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await appointmentsApi.updateStatus(appointment.id, 'CANCELLED');
      toast({
        title: 'Sucesso',
        description: 'Agendamento cancelado com sucesso.',
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o agendamento.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      
      // Update local state
      setAppointments((prev: Appointment[]) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
      );
      
      if (selectedAppointment?.id === id) {
        setSelectedAppointment((prev: Appointment | null) => (prev ? { ...prev, status } : null));
      }
      
      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso.',
      });
      
      // Refresh list
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      toast({
        title: 'Sucesso',
        description: editingAppointment
          ? 'Agendamento atualizado com sucesso.'
          : 'Agendamento criado com sucesso.',
      });
      
      setEditingAppointment(null);
      setIsCreateModalOpen(false);
      
      // Refresh appointments list
      await fetchAppointments();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCalendarAppointmentClick = async (appointmentId: string) => {
    try {
      const appointment = await appointmentsApi.getById(appointmentId);
      setSelectedAppointment(appointment);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do agendamento.',
        variant: 'destructive',
      });
    }
  };

  const handleCalendarDayClick = (date: Date) => {
    setFilters((prev: typeof filters) => ({ ...prev, date }));
    setEditingAppointment(null);
    setIsCreateModalOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Agendamentos</h1>
                <Button onClick={() => {
                  setEditingAppointment(null);
                  setIsCreateModalOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Calendário
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                  {/* Filters */}
                  <div className="bg-card rounded-lg border p-4">
                    <AppointmentFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      professionals={PLACEHOLDER_PROFESSIONALS}
                      services={PLACEHOLDER_SERVICES}
                    />
                  </div>

                  {/* List */}
                  <AppointmentsList
                    appointments={appointments}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onView={handleView}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                  />
                </TabsContent>

                <TabsContent value="calendar">
                  <AppointmentCalendar
                    onAppointmentClick={handleCalendarAppointmentClick}
                    onDayClick={handleCalendarDayClick}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <AppointmentModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditingAppointment(null);
        }}
        appointment={editingAppointment}
        onSave={handleSave}
        professionals={PLACEHOLDER_PROFESSIONALS}
        services={PLACEHOLDER_SERVICES}
        clients={PLACEHOLDER_CLIENTS}
      />

      <AppointmentDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
      />
    </SidebarProvider>
  );
}
