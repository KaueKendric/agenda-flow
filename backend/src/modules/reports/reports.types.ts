export interface ReportPeriod {
  startDate: Date
  endDate: Date
}

export interface FinancialReport {
  totalRevenue: number
  averageTicket: number
  revenueByPeriod: {
    date: string
    amount: number
  }[]
  revenueByProfessional: {
    professionalId: string
    name: string
    revenue: number
    appointmentCount: number
  }[]
  revenueByService: {
    serviceId: string
    serviceName: string
    revenue: number
    count: number
  }[]
  topServices: {
    name: string
    revenue: number
    percentage: number
  }[]
}

export interface OperationalReport {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  occupancyRate: number
  peakHours: {
    hour: number
    count: number
  }[]
  cancellationRate: number
  averageDuration: number
  appointmentsByStatus: {
    status: string
    count: number
    percentage: number
  }[]
}

export interface ClientsReport {
  totalClients: number
  newClientsThisPeriod: number
  activeClients: number
  clientRetention: number
  frequentClients: {
    id: string
    name: string
    appointmentCount: number
    lastAppointment: Date
  }[]
  clientsByFrequency: {
    frequency: string
    count: number
  }[]
}

export interface ProfessionalsReport {
  totalProfessionals: number
  ranking: {
    id: string
    name: string
    revenue: number
    appointmentCount: number
    rating: number
    occupancyRate: number
  }[]
  performanceByProfessional: {
    id: string
    name: string
    appointments: number
    revenue: number
    completionRate: number
    averageRating: number
  }[]
}

export interface ReportFilters {
  startDate: Date
  endDate: Date
  professionalId?: string
  serviceId?: string
  clientId?: string
}

export interface ExportRequest {
  type: 'PDF' | 'EXCEL'
  reportType: 'financial' | 'operational' | 'clients' | 'professionals'
  filters: ReportFilters
  email?: string
}
