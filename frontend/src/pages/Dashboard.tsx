import { useMemo } from 'react';
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

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ✅ Usar useMemo em vez de useEffect + useState
  const user = useMemo<User | null>(() => {
    const storedUser = authService.getStoredUser();
    if (!storedUser) {
      navigate('/auth');
      return null;
    }
    return storedUser;
  }, [navigate]);

  if (!user) {
    return null;
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
                  value={24}
                  icon={Calendar}
                  trend={{ value: 12, isPositive: true }}
                  delay={0.1}
                />
                <MetricCard
                  title="Agendamentos Semana"
                  value={142}
                  icon={TrendingUp}
                  trend={{ value: 8, isPositive: true }}
                  delay={0.15}
                />
                <MetricCard
                  title="Clientes Ativos"
                  value={1248}
                  icon={Users}
                  delay={0.2}
                />
                <MetricCard
                  title="Taxa de Ocupação"
                  value="78%"
                  icon={Clock}
                  progress={78}
                  delay={0.25}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <AppointmentsChart />
                <ServicesChart />
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2">
                  <UpcomingAppointments />
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
