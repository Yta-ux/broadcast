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
  Checkbox,
  ListItemText,
  OutlinedInput,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { where } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import { scheduleMessage, deleteMessage } from "../services/messages";
import type { Connection, Contact, Message, MessageFormData } from "../types";

const formatDate = (timestamp: { toDate: () => Date } | null) => {
  if (!timestamp) return "—";
  return timestamp.toDate().toLocaleString();
};

export const MessagesPage = () => {
  const { tenantId } = useAuth();
  const { data: connections } = useFilteredCollection<Connection>("connections", tenantId);
  const { data: messages, loading } = useFilteredCollection<Message>("messages", tenantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState<MessageFormData>({
    connectionId: "",
    contactIds: [],
    text: "",
    scheduledAt: new Date(),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: connectionContacts } = useFilteredCollection<Contact>(
    "contacts",
    tenantId,
    selectedConnectionId
      ? [where("connectionId", "==", selectedConnectionId)]
      : []
  );

  const openCreate = () => {
    setSelectedConnectionId("");
    setForm({
      connectionId: "",
      contactIds: [],
      text: "",
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    setError("");
    setDialogOpen(true);
  };

  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setForm({ ...form, connectionId, contactIds: [] });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setError("");
    setSaving(true);

    try {
      await scheduleMessage(tenantId, form);
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule message.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(id);
    } catch (err) {
      console.error(err);
    }
  };

  const getConnectionName = (connectionId: string) =>
    connections.find((c) => c.id === connectionId)?.name ?? "Unknown";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "warning";
      case "sent":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const toDatetimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const filteredMessages = statusFilter === "all"
    ? messages
    : messages.filter((msg) => msg.status === statusFilter);

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
          Messages
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
          Schedule Message
        </Button>
      </Box>

      <Box className="mb-4">
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, value) => { if (value !== null) setStatusFilter(value); }}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="scheduled">Scheduled</ToggleButton>
          <ToggleButton value="sent">Sent</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredMessages.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
          <CardContent className="text-center py-12">
            <Typography variant="h6" className="text-gray-400 mb-2">
              {statusFilter === "all" ? "No messages yet" : `No ${statusFilter} messages`}
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              {statusFilter === "all"
                ? "Schedule your first broadcast message."
                : "Try changing the filter above."}
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
                <TableCell className="font-semibold">Text</TableCell>
                <TableCell className="font-semibold">Connection</TableCell>
                <TableCell className="font-semibold">Recipients</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Scheduled</TableCell>
                <TableCell className="font-semibold">Sent</TableCell>
                <TableCell className="font-semibold" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMessages.map((msg) => (
                <TableRow key={msg.id} hover>
                  <TableCell sx={{ maxWidth: 250 }}>
                    <Typography variant="body2" noWrap>
                      {msg.text}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getConnectionName(msg.connectionId)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{msg.contactIds.length}</TableCell>
                  <TableCell>
                    <Chip
                      label={msg.status}
                      size="small"
                      color={getStatusColor(msg.status) as "warning" | "success" | "error" | "default"}
                    />
                  </TableCell>
                  <TableCell>{formatDate(msg.scheduledAt)}</TableCell>
                  <TableCell>{formatDate(msg.sentAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleDelete(msg.id)} color="error">
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
          <DialogTitle>Schedule Message</DialogTitle>
          <DialogContent className="flex flex-col gap-4 pt-4">
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth required>
              <InputLabel>Connection</InputLabel>
              <Select
                value={form.connectionId}
                onChange={(e) => handleConnectionChange(e.target.value)}
                label="Connection"
              >
                {connections.map((conn) => (
                  <MenuItem key={conn.id} value={conn.id}>
                    {conn.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required disabled={!form.connectionId}>
              <InputLabel>Recipients</InputLabel>
              <Select
                multiple
                value={form.contactIds}
                onChange={(e) =>
                  setForm({ ...form, contactIds: e.target.value as string[] })
                }
                input={<OutlinedInput label="Recipients" />}
                renderValue={(selected) =>
                  `${selected.length} contact${selected.length !== 1 ? "s" : ""} selected`
                }
              >
                {connectionContacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    <Checkbox checked={form.contactIds.includes(contact.id)} />
                    <ListItemText primary={contact.name} secondary={contact.phone} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Message"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              required
              fullWidth
              multiline
              rows={4}
            />

            <TextField
              label="Schedule At"
              type="datetime-local"
              value={toDatetimeLocal(form.scheduledAt)}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: new Date(e.target.value) })
              }
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : "Schedule"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
