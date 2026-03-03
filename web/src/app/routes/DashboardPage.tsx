import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import { where } from "firebase/firestore";
import CableIcon from "@mui/icons-material/Cable";
import ContactsIcon from "@mui/icons-material/Contacts";
import MessageIcon from "@mui/icons-material/Message";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import type { Connection, Contact, Message } from "../types";

export const DashboardPage = () => {
  const { tenantId } = useAuth();

  const { data: connections } = useFilteredCollection<Connection>("connections", tenantId);
  const { data: contacts } = useFilteredCollection<Contact>("contacts", tenantId);
  const { data: messages } = useFilteredCollection<Message>("messages", tenantId);
  const { data: scheduledMessages } = useFilteredCollection<Message>(
    "messages",
    tenantId,
    [where("status", "==", "scheduled")]
  );

  const stats = [
    {
      label: "Connections",
      value: connections.length,
      icon: <CableIcon sx={{ fontSize: 40 }} />,
      color: "#6366f1",
      bg: "rgba(99, 102, 241, 0.08)",
    },
    {
      label: "Contacts",
      value: contacts.length,
      icon: <ContactsIcon sx={{ fontSize: 40 }} />,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.08)",
    },
    {
      label: "Messages",
      value: messages.length,
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.08)",
    },
    {
      label: "Scheduled",
      value: scheduledMessages.length,
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.06)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                },
              }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <Box
                  className="flex items-center justify-center rounded-2xl"
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: stat.bg,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" className="font-bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
