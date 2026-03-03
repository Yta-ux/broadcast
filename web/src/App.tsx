import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./app/lib/theme";
import { AuthProvider } from "./app/context/AuthContext";
import { ProtectedRoute } from "./app/routes/ProtectedRoute";
import { AppShell } from "./app/layout/AppShell";
import { AuthPage } from "./app/pages/AuthPage";
import { DashboardPage } from "./app/pages/DashboardPage";
import { ConnectionsPage } from "./app/pages/ConnectionsPage";
import { ContactsPage } from "./app/pages/ContactsPage";
import { MessagesPage } from "./app/pages/MessagesPage";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
