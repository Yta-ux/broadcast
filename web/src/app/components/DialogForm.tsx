import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { ReactNode, FormEvent } from "react";

interface DialogFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  minHeight?: number | string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const DialogForm = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  actions,
  minHeight,
  maxWidth = "sm",
}: DialogFormProps) => {
  const theme = useTheme();
  // No mobile, ocupamos a tela toda com as margin padrões do fullScreen do MUI, ou usamos fullScreen direto
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={
        fullScreen
          ? { sx: { m: 1, height: "calc(100% - 16px)", maxHeight: "none", borderRadius: 2 } }
          : undefined
      }
    >
      <form
        onSubmit={onSubmit}
        className="flex flex-col h-full"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            pt: "24px !important",
            minHeight: fullScreen ? "auto" : minHeight,
            flex: fullScreen ? 1 : undefined,
          }}
        >
          {children}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>{actions}</DialogActions>
      </form>
    </Dialog>
  );
};
