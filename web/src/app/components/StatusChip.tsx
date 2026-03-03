import { Chip } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

type MessageStatus = "scheduled" | "sent" | "failed";

const STATUS_CONFIG: Record<MessageStatus, {
  label: string;
  color: "warning" | "success" | "error";
  icon: React.ReactElement;
}> = {
  scheduled: {
    label: "Agendada",
    color: "warning",
    icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
  },
  sent: {
    label: "Enviada",
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  },
  failed: {
    label: "Falhou",
    color: "error",
    icon: <ErrorIcon sx={{ fontSize: 16 }} />,
  },
};

interface StatusChipProps {
  status: MessageStatus;
}

export const StatusChip = ({ status }: StatusChipProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      icon={config.icon}
      variant="outlined"
    />
  );
};
