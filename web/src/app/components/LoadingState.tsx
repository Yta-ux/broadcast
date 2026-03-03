import { Box, Skeleton } from "@mui/material";

interface LoadingStateProps {
  rows?: number;
  variant?: "table" | "cards";
}

export const LoadingState = ({ rows = 5, variant = "table" }: LoadingStateProps) => {
  if (variant === "cards") {
    return (
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={120}
            sx={{ borderRadius: 3 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-2">
      <Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={56}
          sx={{ borderRadius: 2 }}
          animation="wave"
        />
      ))}
    </Box>
  );
};
