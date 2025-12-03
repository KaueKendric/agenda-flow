import { env } from '@/config/env';

const API_URL = `${env.apiUrl}/dashboard`;

interface Metrics {
  appointmentsToday: {
    value: number;
    variation: number;
    isPositive: boolean;
  };
  appointmentsWeek: {
    value: number;
    variation: number;
    isPositive: boolean;
  };
  activeClients: number;
  occupancyRate: number;
}

interface AppointmentChartData {
  date: string;
  day: string;
  count: number;
}

interface ServiceChartData {
  name: string;
  count: number;
  percentage: number;
}

interface UpcomingAppointment {
  id: string;
  time: string;
  date: string;
  client: string;
  service: string;
  professional: string;
  status: string;
}

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem('token'); 
  
  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.statusText}`);
  }

  return response.json();
}

export const dashboardApi = {
  async getMetrics(): Promise<Metrics> {
    return fetchWithAuth(`${API_URL}/metrics`);
  },

  async getAppointmentsChart(): Promise<AppointmentChartData[]> {
    return fetchWithAuth(`${API_URL}/appointments-chart`);
  },

  async getServicesChart(): Promise<ServiceChartData[]> {
    return fetchWithAuth(`${API_URL}/services-chart`);
  },

  async getUpcoming(): Promise<UpcomingAppointment[]> {
    return fetchWithAuth(`${API_URL}/upcoming`);
  },

  async getCalendar(month: number, year: number) {
    return fetchWithAuth(`${API_URL}/calendar/${month}/${year}`);
  },
};
