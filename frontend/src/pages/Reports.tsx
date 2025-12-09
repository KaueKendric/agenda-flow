import { useState, useLayoutEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart3, CalendarDays } from 'lucide-react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PeriodSelector } from '@/components/reports/PeriodSelector'
import { FinancialTab } from '@/components/reports/FinancialTab'
import { OperationalTab } from '@/components/reports/OperationalTab'
import { ClientsTab } from '@/components/reports/ClientsTab'
import { ProfessionalsTab } from '@/components/reports/ProfessionalsTab'
import { reportsApi } from '@/lib/reports-api'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api'
import type {
  PeriodType,
  DateRange,
  FinancialReport,
  OperationalReport,
  ClientsReport,
  ProfessionalsReport,
} from '@/types/reports'

export default function Reports() {
  const { toast } = useToast()
  const user = authService.getStoredUser()

  const [activeTab, setActiveTab] = useState('financial')
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date()
    return {
      startDate: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
      endDate: format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd'),
    }
  })

  const [financialData, setFinancialData] = useState<FinancialReport | null>(null)
  const [operationalData, setOperationalData] = useState<OperationalReport | null>(null)
  const [clientsData, setClientsData] = useState<ClientsReport | null>(null)
  const [professionalsData, setProfessionalsData] = useState<ProfessionalsReport | null>(null)

  const [isLoading, setIsLoading] = useState({
    financial: false,
    operational: false,
    clients: false,
    professionals: false,
  })

  // ✅ Funções de carregamento
  const loadFinancialData = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, financial: true }))
    try {
      const data = await reportsApi.getFinancial(dateRange)
      setFinancialData(data)
    } catch (error) {
      console.error('Error loading financial data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados financeiros.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(prev => ({ ...prev, financial: false }))
    }
  }, [dateRange, toast])

  const loadOperationalData = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, operational: true }))
    try {
      const data = await reportsApi.getOperational(dateRange)
      setOperationalData(data)
    } catch (error) {
      console.error('Error loading operational data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados operacionais.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(prev => ({ ...prev, operational: false }))
    }
  }, [dateRange, toast])

  const loadClientsData = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, clients: true }))
    try {
      const data = await reportsApi.getClients(dateRange)
      setClientsData(data)
    } catch (error) {
      console.error('Error loading clients data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados de clientes.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(prev => ({ ...prev, clients: false }))
    }
  }, [dateRange, toast])

  const loadProfessionalsData = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, professionals: true }))
    try {
      const data = await reportsApi.getProfessionals(dateRange)
      setProfessionalsData(data)
    } catch (error) {
      console.error('Error loading professionals data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados de profissionais.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(prev => ({ ...prev, professionals: false }))
    }
  }, [dateRange, toast])

  const loadDataForTab = useCallback(
    (tab: string) => {
      switch (tab) {
        case 'financial':
          loadFinancialData()
          break
        case 'operational':
          loadOperationalData()
          break
        case 'clients':
          loadClientsData()
          break
        case 'professionals':
          loadProfessionalsData()
          break
      }
    },
    [loadFinancialData, loadOperationalData, loadClientsData, loadProfessionalsData]
  )

  useLayoutEffect(() => {
    loadDataForTab(activeTab)
  }, [activeTab, dateRange, loadDataForTab])

  // ✅ HANDLER ATUALIZADO - RECEBE PERIOD E RANGE
  const handlePeriodChange = (period: PeriodType, range: DateRange) => {
    setSelectedPeriod(period)
    setDateRange(range)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const formatDateRange = () => {
    try {
      const start = parseISO(dateRange.startDate)
      const end = parseISO(dateRange.endDate)
      return `${format(start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`
    } catch {
      return ''
    }
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Relatórios</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDateRange()}</span>
                  </div>
                </div>
              </div>
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                dateRange={dateRange}
                onPeriodChange={handlePeriodChange}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="operational">Operacional</TabsTrigger>
                <TabsTrigger value="clients">Clientes</TabsTrigger>
                <TabsTrigger value="professionals">Profissionais</TabsTrigger>
              </TabsList>

              <TabsContent value="financial" className="mt-6">
                <FinancialTab data={financialData} isLoading={isLoading.financial} />
              </TabsContent>

              <TabsContent value="operational" className="mt-6">
                <OperationalTab data={operationalData} isLoading={isLoading.operational} />
              </TabsContent>

              <TabsContent value="clients" className="mt-6">
                <ClientsTab data={clientsData} isLoading={isLoading.clients} />
              </TabsContent>

              <TabsContent value="professionals" className="mt-6">
                <ProfessionalsTab data={professionalsData} isLoading={isLoading.professionals} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
