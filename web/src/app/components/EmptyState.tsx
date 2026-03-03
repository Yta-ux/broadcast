import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
}: EmptyStateProps) => (
  <Box className="flex flex-col items-center justify-center py-16 px-4">
    <Box
      className="flex items-center justify-center rounded-full mb-4"
      sx={{
        width: 72,
        height: 72,
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        color: "primary.main",
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" className="mb-1 text-center" sx={{ color: "text.primary" }}>
      {title}
    </Typography>
    <Typography variant="body2" className="text-center max-w-sm" sx={{ color: "text.secondary" }}>
      {description}
    </Typography>
  </Box>
);
