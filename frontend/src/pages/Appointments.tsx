import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus, List, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api'
import { appointmentsApi } from '@/lib/appointments-api'
import { professionalsApi, type Professional } from '@/lib/professionals-api'
import { servicesApi, type Service } from '@/lib/services-api'
import { clientsApi } from '@/lib/clients-api'
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters'
import { AppointmentsList } from '@/components/appointments/AppointmentsList'
import { AppointmentModal } from '@/components/appointments/AppointmentModal'
import { AppointmentDetailsModal } from '@/components/appointments/AppointmentDetailsModal'
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar'
import { DayAppointmentsModal } from '@/components/appointments/DayAppointmentsModal'
import type { Appointment, AppointmentStatus, Pagination } from '@/types/appointments'

interface Client {
  id: string
  name: string
}

export default function Appointments() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [user] = useState(() => authService.getStoredUser())

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [filters, setFilters] = useState({
    status: [] as string[],
    professionalId: '',
    serviceId: '',
    date: undefined as Date | undefined,
    search: '',
  })

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('list')

  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null)

  // ✅ LER URL PARAMS E ABRIR MODAL AUTOMATICAMENTE
  useEffect(() => {
    const dateParam = searchParams.get('date')
    const viewParam = searchParams.get('view')
    const dayModalParam = searchParams.get('dayModal')

    if (dateParam && dayModalParam === '1') {
      try {
        const parsedDate = parseISO(dateParam)
        setDayModalDate(parsedDate)
        setDayModalOpen(true)

        if (viewParam) {
          setActiveTab(viewParam)
        }

        // Limpar params depois de processar
        searchParams.delete('dayModal')
        setSearchParams(searchParams)
      } catch (error) {
        console.error('❌ Erro ao parsear data da URL:', error)
      }
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth')
    }
  }, [navigate])

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingData(true)
      try {
        const [profsData, servicesData, clientsData] = await Promise.all([
          professionalsApi.list(),
          servicesApi.list(),
          clientsApi.listSimple(),
        ])

        setProfessionals(profsData)
        setServices(servicesData)
        setClients(
          clientsData.map((c: Client) => ({
            id: c.id,
            name: c.name || 'Sem nome',
          }))
        )
      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error)
        toast({
          title: 'Aviso',
          description: 'Alguns dados podem não estar disponíveis.',
          variant: 'default',
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchMetadata()
  }, [toast])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | string[] | undefined> = {
        page: pagination.page,
        limit: pagination.limit,
      }

      if (filters.status.length > 0) {
        params.status = filters.status
      }
      if (filters.professionalId) {
        params.professionalId = filters.professionalId
      }
      if (filters.serviceId) {
        params.serviceId = filters.serviceId
      }
      if (filters.date) {
        params.date = format(filters.date, 'yyyy-MM-dd')
      }
      if (filters.search) {
        params.search = filters.search
      }

      console.log('📡 Chamando API com params:', params)

      const response = await appointmentsApi.list(params)
      setAppointments(response.appointments || [])
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit, toast])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handlePageChange = (page: number) => {
    setPagination((prev: Pagination) => ({ ...prev, page }))
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setPagination((prev: Pagination) => ({ ...prev, page: 1 }))
  }

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsCreateModalOpen(true)
  }

  const handleCancel = async (appointment: Appointment) => {
    try {
      await appointmentsApi.updateStatus(appointment.id, 'CANCELLED')
      toast({ title: 'Sucesso', description: 'Agendamento cancelado com sucesso.' })
      fetchAppointments()
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o agendamento.',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentsApi.updateStatus(id, status)
      setAppointments((prev: Appointment[]) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
      )
      if (selectedAppointment?.id === id) {
        setSelectedAppointment((prev: Appointment | null) =>
          prev ? { ...prev, status } : null
        )
      }
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
      fetchAppointments()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    try {
      toast({
        title: 'Sucesso',
        description: editingAppointment
          ? 'Agendamento atualizado com sucesso.'
          : 'Agendamento criado com sucesso.',
      })
      setEditingAppointment(null)
      setIsCreateModalOpen(false)
      await fetchAppointments()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const handleCalendarAppointmentClick = async (appointmentId: string) => {
    try {
      const appointment = await appointmentsApi.getById(appointmentId)
      setSelectedAppointment(appointment)
      setIsDetailsModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch appointment details:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do agendamento.',
        variant: 'destructive',
      })
    }
  }

  const handleCalendarDayClick = (date: Date) => {
    setFilters((prev: typeof filters) => ({ ...prev, date }))
    setDayModalDate(date)
    setDayModalOpen(true)
  }

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Agendamentos</h1>
                <Button
                  onClick={() => {
                    setEditingAppointment(null)
                    setIsCreateModalOpen(true)
                  }}
                  disabled={loadingData}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                  <div className="bg-card rounded-lg border p-4">
                    <AppointmentFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      professionals={professionals.map((p) => ({
                        id: p.id,
                        name: p.user?.name || 'Sem nome',
                      }))}
                      services={services.map((s) => ({
                        id: s.id,
                        name: s.name,
                        duration: s.duration,
                        price: s.price.toString(),
                      }))}
                    />
                  </div>

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
                    initialDate={filters.date}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </main>
        </div>
      </div>

      <AppointmentModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) setEditingAppointment(null)
        }}
        appointment={editingAppointment}
        onSave={handleSave}
        professionals={professionals.map((p) => ({
          id: p.id,
          name: p.user?.name || 'Sem nome',
        }))}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: s.price.toString(),
        }))}
        clients={clients}
      />

      <AppointmentDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
      />

      <DayAppointmentsModal
        open={dayModalOpen}
        onOpenChange={setDayModalOpen}
        date={dayModalDate}
        onAppointmentClick={handleCalendarAppointmentClick}
      />
    </SidebarProvider>
  )
}
