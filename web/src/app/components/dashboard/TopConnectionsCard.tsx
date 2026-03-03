import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

interface TopConnection {
  connectionId: string;
  name: string;
  contacts: number;
}

interface TopConnectionsCardProps {
  data: TopConnection[];
}

export const TopConnectionsCard = ({ data }: TopConnectionsCardProps) => {
  const navigate = useNavigate();
  const maxContacts = Math.max(...data.map((d) => d.contacts), 1);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box className="flex items-center justify-between mb-3">
          <Typography variant="h6">Top conexões</Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/connections")}
            sx={{ textTransform: "none" }}
          >
            Gerenciar
          </Button>
        </Box>

        {data.length === 0 ? (
          <Box className="flex items-center justify-center py-8">
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Nenhuma conexão com contatos
            </Typography>
          </Box>
        ) : (
          <Box className="flex flex-col gap-3">
            {data.map((item) => (
              <Box key={item.connectionId}>
                <Box className="flex items-center justify-between mb-1">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {item.contacts} contato{item.contacts !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.contacts / maxContacts) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "rgba(99, 102, 241, 0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
