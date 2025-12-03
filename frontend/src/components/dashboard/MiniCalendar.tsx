import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Dias com agendamentos (exemplo com quantidade)
  const appointmentData: Record<number, number> = {
    3: 2,
    5: 4,
    8: 1,
    12: 3,
    15: 5,
    18: 2,
    22: 1,
    25: 3,
    28: 2,
  };

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isWeekend = (dayIndex: number) => {
    return dayIndex === 0 || dayIndex === 6;
  };

  const hasAppointments = (day: number) => {
    return appointmentData[day] !== undefined;
  };

  const getAppointmentCount = (day: number) => {
    return appointmentData[day] || 0;
  };

  const renderDay = (day: number, dayOfWeek: number) => {
    const appointments = hasAppointments(day);
    const todayClass = isToday(day);
    const weekend = isWeekend(dayOfWeek);

    const dayButton = (
      <button
        onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
        className={cn(
          'w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 relative flex items-center justify-center',
          'hover:bg-muted/50 hover:scale-110',
          weekend && !appointments && !todayClass && 'text-muted-foreground/70',
          appointments && 'bg-primary text-primary-foreground hover:bg-primary/90',
          todayClass && !appointments && 'ring-2 ring-secondary ring-offset-2 ring-offset-card',
          todayClass && appointments && 'ring-2 ring-secondary ring-offset-1 ring-offset-primary',
          selectedDate?.getDate() === day && 
          selectedDate?.getMonth() === currentMonth && 
          !appointments && 'bg-muted'
        )}
      >
        {day}
      </button>
    );

    if (appointments) {
      return (
        <TooltipProvider key={day} delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              {dayButton}
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-card border-border/50 text-foreground"
            >
              <p className="text-xs font-medium">
                {getAppointmentCount(day)} agendamento{getAppointmentCount(day) > 1 ? 's' : ''}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={day}>{dayButton}</div>;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDayOfMonth + day - 1) % 7;
      days.push(renderDay(day, dayOfWeek));
    }

    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-4">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8 hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-sm font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 hover:bg-muted/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={cn(
                'w-8 h-6 flex items-center justify-center text-xs font-medium',
                isWeekend(index) ? 'text-muted-foreground/60' : 'text-muted-foreground'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </Card>
    </motion.div>
  );
}
