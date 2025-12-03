import { useState, useEffect, useCallback } from 'react'; // ✅ Adicionar useCallback
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dashboardApi } from '@/lib/dashboard-api';

interface CalendarDay {
  date: string;
  count: number;
}

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointmentDays, setAppointmentDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ✅ Usar useCallback para evitar warning
  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getCalendar(month + 1, year);
      setAppointmentDays(data);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]); // ✅ Dependências corretas

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]); // ✅ Agora está correto

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const hasAppointments = (day: number | null) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointmentDays.some(apt => apt.date === dateStr);
  };

  const getAppointmentCount = (day: number | null) => {
    if (!day) return 0;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const apt = appointmentDays.find(a => a.date === dateStr);
    return apt?.count || 0;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Calendário</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[280px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const hasApt = hasAppointments(day);
              const aptCount = getAppointmentCount(day);
              const isTodayDay = isToday(day);

              return (
                <div
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm relative
                    transition-all duration-200
                    ${day ? 'hover:bg-accent cursor-pointer' : ''}
                    ${isTodayDay ? 'bg-primary/20 text-primary font-bold ring-2 ring-primary' : ''}
                    ${hasApt && !isTodayDay ? 'bg-primary/10' : ''}
                  `}
                  title={hasApt ? `${aptCount} agendamento(s)` : undefined}
                >
                  {day && (
                    <>
                      <span className={hasApt ? 'font-semibold' : ''}>{day}</span>
                      {hasApt && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border-2 border-primary" />
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Com agendamentos</span>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
