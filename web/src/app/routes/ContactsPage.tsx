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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import { createContact, updateContact, deleteContact } from "../services/contacts";
import type { Connection, Contact, ContactFormData } from "../types";

export const ContactsPage = () => {
  const { tenantId } = useAuth();
  const { data: connections } = useFilteredCollection<Connection>("connections", tenantId);
  const { data: contacts, loading } = useFilteredCollection<Contact>("contacts", tenantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactFormData>({
    connectionId: "",
    name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterConnectionId, setFilterConnectionId] = useState<string>("");

  const openCreate = () => {
    setEditingId(null);
    setForm({ connectionId: "", name: "", phone: "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setForm({
      connectionId: contact.connectionId,
      name: contact.name,
      phone: contact.phone,
    });
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
        await updateContact(editingId, { name: form.name, phone: form.phone });
      } else {
        await createContact(tenantId, form);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    try {
      await deleteContact(id);
    } catch (err) {
      console.error(err);
    }
  };

  const getConnectionName = (connectionId: string) =>
    connections.find((c) => c.id === connectionId)?.name ?? "Unknown";

  const filteredContacts = filterConnectionId
    ? contacts.filter((c) => c.connectionId === filterConnectionId)
    : contacts;

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
          Contacts
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
          Add Contact
        </Button>
      </Box>

      <Box className="mb-4">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Connection</InputLabel>
          <Select
            value={filterConnectionId}
            onChange={(e) => setFilterConnectionId(e.target.value)}
            label="Filter by Connection"
          >
            <MenuItem value="">All Connections</MenuItem>
            {connections.map((conn) => (
              <MenuItem key={conn.id} value={conn.id}>
                {conn.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredContacts.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
          <CardContent className="text-center py-12">
            <Typography variant="h6" className="text-gray-400 mb-2">
              No contacts yet
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              Add contacts to your connections.
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
                <TableCell className="font-semibold">Phone</TableCell>
                <TableCell className="font-semibold">Connection</TableCell>
                <TableCell className="font-semibold" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={getConnectionName(contact.connectionId)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(contact)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(contact.id)} color="error">
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
          <DialogTitle>{editingId ? "Edit Contact" : "New Contact"}</DialogTitle>
          <DialogContent className="flex flex-col gap-4 pt-4">
            {error && <Alert severity="error">{error}</Alert>}
            {!editingId && (
              <FormControl fullWidth required>
                <InputLabel>Connection</InputLabel>
                <Select
                  value={form.connectionId}
                  onChange={(e) => setForm({ ...form, connectionId: e.target.value })}
                  label="Connection"
                >
                  {connections.map((conn) => (
                    <MenuItem key={conn.id} value={conn.id}>
                      {conn.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              fullWidth
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
