import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export const Page = ({ children, title, subtitle, rightSlot }: PageProps) => (
  <Box className="p-4 md:p-6 w-full h-full flex flex-col min-w-0">
    {(title || rightSlot) && (
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 shrink-0">
        <Box>
          {title && <Typography variant="h4">{title}</Typography>}
          {subtitle && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {rightSlot && <Box>{rightSlot}</Box>}
      </Box>
    )}
    <Box className="flex-1 flex flex-col min-w-0">
      {children}
    </Box>
  </Box>
);
