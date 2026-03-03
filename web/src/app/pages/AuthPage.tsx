import { useState, type FormEvent } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../services/auth";
import { FormTextField } from "../components/FormTextField";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export const AuthPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setTenantName("");
    setError("");
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup({ email, password, tenantName });
      }
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="flex items-center justify-center min-h-screen p-4"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 4,
          overflow: "visible",
        }}
        elevation={8}
      >
        <CardContent className="p-0">
          <Box className="text-center pt-8 pb-4 px-6">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📡 Broadcast
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Gerencie suas conexões e mensagens
            </Typography>
          </Box>

          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
                }}
              >
                <Tab label="Entrar" value="login" />
                <Tab label="Criar Conta" value="signup" />
              </TabList>
            </Box>

            <form onSubmit={handleSubmit}>
              <TabPanel value="login" sx={{ px: 4, py: 3 }}>
                <Box className="flex flex-col gap-4">
                  {error && <Alert severity="error">{error}</Alert>}
                  <FormTextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                  <FormTextField
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <Box
                    component="button"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold text-white border-none cursor-pointer transition-all"
                    sx={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      fontSize: "1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                      },
                      "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Entrar"
                    )}
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value="signup" sx={{ px: 4, py: 3 }}>
                <Box className="flex flex-col gap-4">
                  {error && <Alert severity="error">{error}</Alert>}
                  <FormTextField
                    label="Nome da Empresa"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                    autoFocus
                  />
                  <FormTextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <Box>
                    <FormTextField
                      label="Senha"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <Box sx={{ mt: 1, pl: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="caption" color={password.length >= 8 ? "success.main" : "text.secondary"}>
                        {password.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
                      </Typography>
                      <Typography variant="caption" color={/[a-zA-Z]/.test(password) ? "success.main" : "text.secondary"}>
                        {/[a-zA-Z]/.test(password) ? "✓" : "○"} Pelo menos 1 letra
                      </Typography>
                      <Typography variant="caption" color={/\d/.test(password) ? "success.main" : "text.secondary"}>
                        {/\d/.test(password) ? "✓" : "○"} Pelo menos 1 número
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    component="button"
                    type="submit"
                    disabled={loading || password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)}
                    className="w-full py-3 rounded-xl font-semibold text-white border-none cursor-pointer transition-all"
                    sx={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      fontSize: "1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                      },
                      "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Criar Conta"
                    )}
                  </Box>
                </Box>
              </TabPanel>
            </form>
          </TabContext>
        </CardContent>
      </Card>
    </Box>
  );
};
