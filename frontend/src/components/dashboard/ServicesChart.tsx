import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

const data = [
  { name: 'Corte', value: 35, color: 'hsl(263, 70%, 68%)' },
  { name: 'Barba', value: 25, color: 'hsl(174, 100%, 41%)' },
  { name: 'Corte + Barba', value: 20, color: 'hsl(263, 70%, 58%)' },
  { name: 'Sobrancelha', value: 12, color: 'hsl(174, 100%, 31%)' },
  { name: 'Outros', value: 8, color: 'hsl(var(--muted))' },
];

export function ServicesChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Serviços mais agendados</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              />
              <Legend 
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
