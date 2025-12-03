import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AppointmentsChart } from '@/components/dashboard/AppointmentsChart';
import { ServicesChart } from '@/components/dashboard/ServicesChart';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { authService } from '@/lib/api';
import { dashboardApi } from '@/lib/dashboard-api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DashboardData {
  metrics: {
    appointmentsToday: { value: number; variation: number; isPositive: boolean };
    appointmentsWeek: { value: number; variation: number; isPositive: boolean };
    activeClients: number;
    occupancyRate: number;
  };
  appointmentsChart: Array<{ date: string; day: string; count: number }>;
  servicesChart: Array<{ name: string; count: number; percentage: number }>;
  upcoming: Array<{
    id: string;
    time: string;
    date: string;
    client: string;
    service: string;
    professional: string;
    status: string;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = useMemo<User | null>(() => {
    const storedUser = authService.getStoredUser();
    if (!storedUser) {
      navigate('/auth');
      return null;
    }
    return storedUser;
  }, [navigate]);

  // ✅ Usar useCallback para criar função reutilizável
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [metrics, appointmentsChart, servicesChart, upcoming] = await Promise.all([
        dashboardApi.getMetrics(),
        dashboardApi.getAppointmentsChart(),
        dashboardApi.getServicesChart(),
        dashboardApi.getUpcoming(),
      ]);

      setData({
        metrics,
        appointmentsChart,
        servicesChart,
        upcoming,
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ Carregar dados na montagem do componente
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-bg">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-bg">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Title */}
              <div className="mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Bem-vindo de volta, {user.name || 'Admin'}!</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Agendamentos Hoje"
                  value={data?.metrics.appointmentsToday.value || 0}
                  icon={Calendar}
                  trend={{
                    value: Math.abs(data?.metrics.appointmentsToday.variation || 0),
                    isPositive: data?.metrics.appointmentsToday.isPositive ?? true,
                  }}
                  delay={0.1}
                />
                <MetricCard
                  title="Agendamentos Semana"
                  value={data?.metrics.appointmentsWeek.value || 0}
                  icon={TrendingUp}
                  trend={{
                    value: Math.abs(data?.metrics.appointmentsWeek.variation || 0),
                    isPositive: data?.metrics.appointmentsWeek.isPositive ?? true,
                  }}
                  delay={0.15}
                />
                <MetricCard
                  title="Clientes Ativos"
                  value={data?.metrics.activeClients || 0}
                  icon={Users}
                  delay={0.2}
                />
                <MetricCard
                  title="Taxa de Ocupação"
                  value={`${data?.metrics.occupancyRate || 0}%`}
                  icon={Clock}
                  progress={data?.metrics.occupancyRate || 0}
                  delay={0.25}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <AppointmentsChart data={data?.appointmentsChart || []} />
                <ServicesChart data={data?.servicesChart || []} />
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2">
                  <UpcomingAppointments 
                    data={data?.upcoming || []} 
                    onUpdate={loadDashboardData} // ✅ Passar callback
                  />
                </div>
                <MiniCalendar />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
