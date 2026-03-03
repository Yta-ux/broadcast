import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  const currentWidth = isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box className="flex min-h-screen" sx={{ bgcolor: "background.default" }}>
      <TopBar 
        onMenuClick={() => setMobileOpen(!mobileOpen)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        drawerWidth={currentWidth}
      />
      <SideNav
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isCollapsed={isCollapsed}
        drawerWidth={currentWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${currentWidth}px)` },
          transition: "width 0.3s ease",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
