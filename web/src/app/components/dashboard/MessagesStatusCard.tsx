import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface PieSlice {
  name: string;
  value: number;
}

interface MessagesStatusCardProps {
  data: PieSlice[];
}

const COLORS: Record<string, string> = {
  Enviadas: "#10b981",
  Agendadas: "#f59e0b",
  Falhou: "#ef4444",
};

export const MessagesStatusCard = ({ data }: MessagesStatusCardProps) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Status das mensagens
      </Typography>
      {data.length === 0 ? (
        <Box className="flex items-center justify-center" sx={{ height: 300 }}>
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            Sem mensagens
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] ?? "#94a3b8"}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </CardContent>
  </Card>
);
