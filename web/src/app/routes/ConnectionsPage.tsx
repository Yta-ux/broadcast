import { useState, type FormEvent } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import {
  createConnection,
  updateConnection,
  deleteConnection,
} from "../services/connections";
import type { Connection, ConnectionFormData } from "../types";

export const ConnectionsPage = () => {
  const { tenantId } = useAuth();
  const { data: connections, loading } = useFilteredCollection<Connection>(
    "connections",
    tenantId
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ConnectionFormData>({ name: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (conn: Connection) => {
    setEditingId(conn.id);
    setForm({ name: conn.name });
    setError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setError("");
    setSaving(true);

    try {
      if (editingId) {
        await updateConnection(editingId, form);
      } else {
        await createConnection(tenantId, form);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this connection?")) return;
    try {
      await deleteConnection(id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center p-12">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold">
          Connections
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
          }}
        >
          Add Connection
        </Button>
      </Box>

      {connections.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
          <CardContent className="text-center py-12">
            <Typography variant="h6" className="text-gray-400 mb-2">
              No connections yet
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              Create your first connection to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {connections.map((conn) => (
                <TableRow key={conn.id} hover>
                  <TableCell>
                    <Chip label={conn.name} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(conn)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(conn.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? "Edit Connection" : "New Connection"}</DialogTitle>
          <DialogContent className="flex flex-col gap-4 pt-4">
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : editingId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
