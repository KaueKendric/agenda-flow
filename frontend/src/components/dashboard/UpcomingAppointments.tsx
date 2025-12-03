import { motion } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const appointments = [
  { id: 1, time: '09:00', client: 'João Silva', service: 'Corte', professional: 'Carlos' },
  { id: 2, time: '09:30', client: 'Maria Santos', service: 'Barba', professional: 'Pedro' },
  { id: 3, time: '10:00', client: 'Lucas Oliveira', service: 'Corte + Barba', professional: 'Carlos' },
  { id: 4, time: '10:30', client: 'Ana Costa', service: 'Sobrancelha', professional: 'Ana' },
  { id: 5, time: '11:00', client: 'Pedro Alves', service: 'Corte', professional: 'Pedro' },
];

export function UpcomingAppointments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Próximos Agendamentos</h3>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            Ver todos
          </Button>
        </div>
        
        <div className="space-y-3">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                    {appointment.client.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{appointment.client}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.service} • {appointment.professional}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-muted-foreground mr-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{appointment.time}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/20"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
