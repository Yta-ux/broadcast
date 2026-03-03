import { useState } from "react";
import {
  Box,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CableIcon from "@mui/icons-material/Cable";
import ContactsIcon from "@mui/icons-material/Contacts";
import MessageIcon from "@mui/icons-material/Message";
import { useAuth } from "../hooks/useAuth";
import { useDashboardData } from "../hooks/useDashboardData";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { KpiCardsRow } from "../components/dashboard/KpiCardsRow";
import { MessagesTrendCard } from "../components/dashboard/MessagesTrendCard";
import { MessagesStatusCard } from "../components/dashboard/MessagesStatusCard";
import { UpcomingScheduledCard } from "../components/dashboard/UpcomingScheduledCard";
import { TopConnectionsCard } from "../components/dashboard/TopConnectionsCard";
import { Page } from "../layout/Page";

const TopActionsBar = () => {
  const navigate = useNavigate();
  const actions = [
    { label: "Nova Conexão", icon: <CableIcon fontSize="small" />, path: "/connections", color: "#6366f1" },
    { label: "Novo Contato", icon: <ContactsIcon fontSize="small" />, path: "/contacts", color: "#8b5cf6" },
    { label: "Nova Mensagem", icon: <MessageIcon fontSize="small" />, path: "/messages", color: "#06b6d4" },
  ];

  return (
    <Box className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outlined"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => navigate(action.path)}
          sx={{
            borderColor: action.color,
            color: action.color,
            "&:hover": {
              borderColor: action.color,
              backgroundColor: `${action.color}0a`,
            },
          }}
        >
          <Box className="flex items-center gap-1">
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">{action.label.split(' ')[1]}</span>
          </Box>
        </Button>
      ))}
    </Box>
  );
};

export const DashboardPage = () => {
  const { tenantId } = useAuth();
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const dashboard = useDashboardData(tenantId, selectedConnectionId);

  if (dashboard.isLoading) return <LoadingState rows={6} variant="cards" />;

  if (dashboard.kpis.connections === 0) {
    return (
      <Page title="Dashboard" subtitle="Visão geral de todos os seus agendamentos e contatos" rightSlot={<TopActionsBar />}>
        <EmptyState
          icon={<CableIcon sx={{ fontSize: 36 }} />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para visualizar métricas e gráficos."
        />
      </Page>
    );
  }

  return (
    <Page title="Dashboard" subtitle="Visão geral de todos os seus agendamentos e contatos" rightSlot={<TopActionsBar />}>
      <Box className="flex flex-col gap-6">
        {/* Filtro */}
        <Box className="flex justify-end">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Conexão</InputLabel>
            <Select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              label="Conexão"
            >
              <MenuItem value="">Todas</MenuItem>
              {dashboard.connectionsOptions.map((conn) => (
                <MenuItem key={conn.id} value={conn.id}>
                  {conn.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* KPIs */}
        <KpiCardsRow {...dashboard.kpis} />

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <MessagesTrendCard data={dashboard.trend7d} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MessagesStatusCard data={dashboard.statusPie} />
          </Grid>
        </Grid>

        {/* Activity */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <UpcomingScheduledCard data={dashboard.upcomingScheduled} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TopConnectionsCard data={dashboard.topConnections} />
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};
