import { Card, CardContent, Box, Typography, Grid } from "@mui/material";
import CableIcon from "@mui/icons-material/Cable";
import ContactsIcon from "@mui/icons-material/Contacts";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { ReactElement } from "react";

interface KpiItem {
  label: string;
  value: number;
  sublabel: string;
  icon: ReactElement;
  color: string;
  bg: string;
}

interface KpiCardsRowProps {
  connections: number;
  contacts: number;
  messagesLast7d: number;
  scheduledNext24h: number;
}

export const KpiCardsRow = ({
  connections,
  contacts,
  messagesLast7d,
  scheduledNext24h,
}: KpiCardsRowProps) => {
  const items: KpiItem[] = [
    {
      label: "Conexões",
      value: connections,
      sublabel: "Total",
      icon: <CableIcon sx={{ fontSize: 28 }} />,
      color: "#6366f1",
      bg: "rgba(99, 102, 241, 0.08)",
    },
    {
      label: "Contatos",
      value: contacts,
      sublabel: "Total",
      icon: <ContactsIcon sx={{ fontSize: 28 }} />,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.08)",
    },
    {
      label: "Mensagens",
      value: messagesLast7d,
      sublabel: "Últimos 7 dias",
      icon: <MessageIcon sx={{ fontSize: 28 }} />,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.08)",
    },
    {
      label: "Agendadas",
      value: scheduledNext24h,
      sublabel: "Próximas 24h",
      icon: <ScheduleIcon sx={{ fontSize: 28 }} />,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
    },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid size={{ xs: 6, md: 3 }} key={item.label}>
          <Card
            sx={{
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              },
            }}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Box
                className="flex items-center justify-center rounded-xl"
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: item.bg,
                  color: item.color,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: item.color, lineHeight: 1.2 }}
                >
                  {item.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.75rem" }} noWrap>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>
                  {item.sublabel}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
