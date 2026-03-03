import {
  Drawer,
  Box,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CableIcon from "@mui/icons-material/Cable";
import ContactsIcon from "@mui/icons-material/Contacts";
import MessageIcon from "@mui/icons-material/Message";
import { Link as RouterLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Conexões", path: "/connections", icon: <CableIcon /> },
  { label: "Contatos", path: "/contacts", icon: <ContactsIcon /> },
  { label: "Mensagens", path: "/messages", icon: <MessageIcon /> },
];

interface SideNavProps {
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  drawerWidth: number;
}

export const SideNav = ({ mobileOpen, onClose, isCollapsed, drawerWidth }: SideNavProps) => {
  const location = useLocation();

  const drawerContent = (
    <Box className="h-full flex flex-col" sx={{ overflowX: "hidden" }}>
      <Toolbar sx={{ justifyContent: isCollapsed ? "center" : "flex-start", px: isCollapsed ? 1 : 2 }}>
        <Typography
          variant="h6"
          noWrap
          sx={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            display: isCollapsed ? "none" : "block",
          }}
        >
          📡 Broadcast
        </Typography>
        {isCollapsed && (
          <Typography variant="h6" sx={{ pl: 1 }}>📡</Typography>
        )}
      </Toolbar>
      <Divider />
      <List className="flex-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          
          const listItem = (
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                justifyContent: isCollapsed ? "center" : "flex-start",
                px: isCollapsed ? 0 : 2,
                ...(isActive && {
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: isCollapsed ? "center" : "flex-start", mr: isCollapsed ? 0 : 1 }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding sx={{ px: isCollapsed ? 1 : 2, mb: 0.5 }}>
              {isCollapsed ? (
                <Tooltip title={item.label} placement="right">
                  {listItem}
                </Tooltip>
              ) : (
                listItem
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: "width 0.3s ease" }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 260 },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid",
            borderColor: "divider",
            transition: "width 0.3s ease",
            overflowX: "hidden"
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
