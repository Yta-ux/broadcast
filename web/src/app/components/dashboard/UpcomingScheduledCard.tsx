import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Tooltip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { StatusChip } from "../StatusChip";
import { truncate, formatDateTime } from "../../lib/format";

interface UpcomingMessage {
  id: string;
  text: string;
  scheduledAt: Date | null;
  contactCount: number;
  status: string;
}

interface UpcomingScheduledCardProps {
  data: UpcomingMessage[];
}

export const UpcomingScheduledCard = ({ data }: UpcomingScheduledCardProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box className="flex items-center justify-between mb-3">
          <Typography variant="h6">Próximas agendadas</Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/messages")}
            sx={{ textTransform: "none" }}
          >
            Ver todas
          </Button>
        </Box>

        {data.length === 0 ? (
          <Box className="flex items-center justify-center py-8">
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Nenhuma mensagem agendada
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableBody>
              {data.map((msg) => (
                <TableRow key={msg.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ maxWidth: 160, pl: 0 }}>
                    <Tooltip title={msg.text}>
                      <Typography variant="body2" noWrap>
                        {truncate(msg.text, 40)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {msg.scheduledAt ? formatDateTime(msg.scheduledAt) : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {msg.contactCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 0 }}>
                    <StatusChip status={msg.status as "scheduled" | "sent" | "failed"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
