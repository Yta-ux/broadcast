import { useState, type FormEvent } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { signup } from "../services/auth";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup({ email, password, tenantName });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Card className="w-full max-w-md shadow-xl" elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent className="p-8">
          <Typography
            variant="h4"
            className="text-center font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            📡 Broadcast
          </Typography>
          <Typography variant="body2" className="text-center text-gray-500 mb-6">
            Create your account
          </Typography>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Organization Name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
              fullWidth
              helperText="This creates your tenant workspace"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>
          </form>

          <Typography variant="body2" className="text-center mt-4 text-gray-500">
            Already have an account?{" "}
            <RouterLink to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium no-underline">
              Sign in
            </RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
