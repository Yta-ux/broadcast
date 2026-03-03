import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation } from "react-router-dom";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/connections": "Conexões",
  "/contacts": "Contatos",
  "/messages": "Mensagens",
};

interface TopBarProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  drawerWidth: number;
}

export const TopBar = ({ onMenuClick, isCollapsed, onToggleCollapse, drawerWidth }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const title = PAGE_TITLES[location.pathname] ?? "Broadcast";

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease, margin 0.3s ease",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: "none" } }}
          aria-label="Abrir menu"
        >
          <MenuIcon />
        </IconButton>
        
        <IconButton
          edge="start"
          onClick={onToggleCollapse}
          sx={{ mr: 2, display: { xs: "none", sm: "flex" } }}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        <Typography variant="h5" noWrap className="flex-1">
          {title}
        </Typography>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="inherit"
            sx={{ borderColor: "divider" }}
          >
            Sair
          </Button>
        </Box>
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <IconButton onClick={handleLogout} aria-label="Sair">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
