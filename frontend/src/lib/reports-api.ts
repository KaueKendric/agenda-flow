import { api } from './api'
import type {
  FinancialReport,
  OperationalReport,
  ClientsReport,
  ProfessionalsReport,
} from '@/types/reports'

interface DateRange {
  startDate: string // 'yyyy-MM-dd'
  endDate: string   // 'yyyy-MM-dd'
}

export const reportsApi = {
  async getFinancial(dateRange: DateRange): Promise<FinancialReport> {
    const response = await api.get('/reports/financial', {
      params: {
        startDate: `${dateRange.startDate}T00:00:00.000Z`,
        endDate: `${dateRange.endDate}T23:59:59.999Z`,
      },
    })
    return response.data
  },

  async getOperational(dateRange: DateRange): Promise<OperationalReport> {
    const response = await api.get('/reports/operational', {
      params: {
        startDate: `${dateRange.startDate}T00:00:00.000Z`,
        endDate: `${dateRange.endDate}T23:59:59.999Z`,
      },
    })
    return response.data
  },

  async getClients(dateRange: DateRange): Promise<ClientsReport> {
    const response = await api.get('/reports/clients', {
      params: {
        startDate: `${dateRange.startDate}T00:00:00.000Z`,
        endDate: `${dateRange.endDate}T23:59:59.999Z`,
      },
    })
    return response.data
  },

  async getProfessionals(dateRange: DateRange): Promise<ProfessionalsReport> {
    const response = await api.get('/reports/professionals', {
      params: {
        startDate: `${dateRange.startDate}T00:00:00.000Z`,
        endDate: `${dateRange.endDate}T23:59:59.999Z`,
      },
    })
    return response.data
  },
}
