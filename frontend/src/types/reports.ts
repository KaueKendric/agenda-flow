export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FinancialReport {
  totalRevenue: number;
  averageTicket: number;
  revenueByPeriod: { date: string; amount: number }[];
  revenueByProfessional: { name: string; revenue: number; appointmentCount: number }[];
  revenueByService: { serviceName: string; revenue: number; count: number }[];
  topServices: { name: string; revenue: number; percentage: number }[];
}

export interface OperationalReport {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  occupancyRate: number;
  cancellationRate: number;
  peakHours: { hour: number; count: number }[];
  appointmentsByStatus: { status: string; count: number; percentage: number }[];
}

export interface ClientsReport {
  totalClients: number;
  newClientsThisPeriod: number;
  activeClients: number;
  clientRetention: number;
  frequentClients: { id: string; name: string; appointmentCount: number; lastAppointment: string }[];
  clientsByFrequency: { frequency: string; count: number }[];
}

export interface ProfessionalsReport {
  totalProfessionals: number;
  ranking: { id: string; name: string; revenue: number; appointmentCount: number; rating: number; occupancyRate: number }[];
  performanceByProfessional: { id: string; name: string; appointments: number; revenue: number; completionRate: number; averageRating: number }[];
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  professionalId?: string;
  serviceId?: string;
}
