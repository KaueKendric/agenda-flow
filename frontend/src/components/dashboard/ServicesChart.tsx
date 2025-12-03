import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// ✅ Cores sólidas em vez de variáveis CSS
const COLORS = [
  '#7A5FFF', // Roxo (primary)
  '#00D1B2', // Teal
  '#FF6B9D', // Rosa
  '#FFB84D', // Laranja
  '#4ECDC4', // Ciano
];

interface ServicesChartProps {
  data: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export function ServicesChart({ data }: ServicesChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="text-lg font-semibold mb-4">Serviços Mais Agendados</h3>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Nenhum serviço agendado ainda</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h3 className="text-lg font-semibold mb-4">Serviços Mais Agendados</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => {
              const item = data[props.index];
              return `${item.percentage}%`;
            }}
            outerRadius={90}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number, name: string) => [
              `${value} agendamentos`,
              name,
            ]}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
