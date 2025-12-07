import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { appointmentsApi } from '@/lib/appointments-api';
import type {
  CalendarAppointment,
  AppointmentStatus,
} from '@/types/appointment';

interface AppointmentCalendarProps {
  onAppointmentClick: (appointmentId: string) => void;
  onDayClick: (date: Date) => void;
  initialDate?: Date;
}

export function AppointmentCalendar({
  onAppointmentClick,
  onDayClick,
  initialDate,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await appointmentsApi.getCalendar(year, month);
        setAppointments(response.appointments);
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.dateTime), day));
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      SCHEDULED: 'bg-blue-500/80',
      CONFIRMED: 'bg-green-500/80',
      IN_PROGRESS: 'bg-yellow-500/80',
      COMPLETED: 'bg-emerald-700/80',
      CANCELLED: 'bg-red-500/20 text-red-500 line-through',
      NO_SHOW: 'bg-gray-500/80',
    };
    return colors[status];
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-lg capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[100px] p-1 rounded-lg border transition-colors cursor-pointer',
                    isCurrentMonth ? 'bg-background' : 'bg-muted/30',
                    isToday && 'ring-2 ring-primary',
                    'hover:bg-muted/50'
                  )}
                  onClick={() => onDayClick(day)}
                >
                  <div
                    className={cn(
                      'text-sm font-medium mb-1',
                      !isCurrentMonth && 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          'text-xs px-1 py-0.5 rounded truncate cursor-pointer text-white',
                          getStatusColor(apt.status)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt.id);
                        }}
                        title={`${apt.startTime} - ${
                          apt.client.name || 'Cliente'
                        } - ${apt.service.name}`}
                      >
                        {apt.startTime}{' '}
                        {apt.client.name?.split(' ')[0] || 'Cliente'}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Agendado</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Confirmado</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Em andamento</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-emerald-700" />
          <span>Concluído</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded bg-red-500/50" />
          <span>Cancelado</span>
        </div>
      </div>
    </div>
  );
}
