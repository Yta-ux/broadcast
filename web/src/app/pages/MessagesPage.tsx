import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageIcon from "@mui/icons-material/Message";
import { where } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import { scheduleMessage, updateMessage, deleteMessage } from "../services/messages";
import { Page } from "../layout/Page";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { StatusChip } from "../components/StatusChip";
import { FormTextField } from "../components/FormTextField";
import { DialogForm } from "../components/DialogForm";
import type { Connection, Contact, Message, MessageFormData } from "../types";

const formatDate = (timestamp: { toDate: () => Date } | null) => {
  if (!timestamp) return "—";
  return timestamp.toDate().toLocaleString("pt-BR");
};

const toDatetimeLocal = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const MessagesPage = () => {
  const { tenantId } = useAuth();
  const { data: connections } = useFilteredCollection<Connection>("connections", tenantId);
  const { data: messages, loading } = useFilteredCollection<Message>("messages", tenantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<MessageFormData>({
    connectionId: "",
    contactIds: [],
    text: "",
    scheduledAt: new Date(),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: connectionContacts } = useFilteredCollection<Contact>(
    "contacts",
    tenantId,
    selectedConnectionId
      ? [where("connectionId", "==", selectedConnectionId)]
      : []
  );

  const openCreate = () => {
    setEditingId(null);
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

  const openEdit = (msg: Message) => {
    setEditingId(msg.id);
    setSelectedConnectionId(msg.connectionId);
    setForm({
      connectionId: msg.connectionId,
      contactIds: msg.contactIds,
      text: msg.text,
      scheduledAt: msg.scheduledAt.toDate(),
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
      if (editingId) {
        await updateMessage(editingId, tenantId, form);
      } else {
        await scheduleMessage(tenantId, form);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessage(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  const getConnectionName = (connectionId: string) =>
    connections.find((c) => c.id === connectionId)?.name ?? "—";

  const filteredMessages =
    statusFilter === "all"
      ? messages
      : messages.filter((msg) => msg.status === statusFilter);

  if (loading) return <LoadingState rows={5} />;

  return (
    <Page
      title="Mensagens"
      rightSlot={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova Mensagem
        </Button>
      }
    >
      <Box className="mb-4">
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, value) => {
            if (value !== null) setStatusFilter(value);
          }}
          size="small"
        >
          <ToggleButton value="all">Todas</ToggleButton>
          <ToggleButton value="scheduled">Agendadas</ToggleButton>
          <ToggleButton value="sent">Enviadas</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={<MessageIcon sx={{ fontSize: 36 }} />}
          title={
            statusFilter === "all"
              ? "Nenhuma mensagem"
              : `Nenhuma mensagem ${statusFilter === "scheduled" ? "agendada" : "enviada"}`
          }
          description={
            statusFilter === "all"
              ? "Agende sua primeira mensagem de broadcast."
              : "Tente alterar o filtro acima."
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mensagem</TableCell>
                <TableCell>Conexão</TableCell>
                <TableCell>Dest.</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Agendada</TableCell>
                <TableCell>Enviada</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMessages.map((msg) => (
                <TableRow key={msg.id} hover>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Tooltip title={msg.text} placement="top-start">
                      <Typography variant="body2" noWrap>
                        {msg.text}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getConnectionName(msg.connectionId)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`${msg.contactIds.length} contato(s)`}>
                      <Chip
                        label={msg.contactIds.length}
                        size="small"
                        sx={{ minWidth: 32 }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={msg.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {formatDate(msg.scheduledAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {formatDate(msg.sentAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(msg)}
                      color="primary"
                      disabled={msg.status !== "scheduled"}
                      aria-label="Editar mensagem"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(msg.id)}
                      color="error"
                      aria-label="Excluir mensagem"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DialogForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        title={editingId ? "Editar Mensagem" : "Agendar Mensagem"}
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? (
                <CircularProgress size={20} />
              ) : editingId ? (
                "Atualizar"
              ) : (
                "Agendar"
              )}
            </Button>
          </>
        }
      >
        {error && <Alert severity="error">{error}</Alert>}

        <FormControl fullWidth required>
          <InputLabel>Conexão</InputLabel>
          <Select
            value={form.connectionId}
            onChange={(e) => handleConnectionChange(e.target.value)}
            label="Conexão"
          >
            {connections.map((conn) => (
              <MenuItem key={conn.id} value={conn.id}>
                {conn.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth required disabled={!form.connectionId}>
          <InputLabel>Destinatários</InputLabel>
          <Select
            multiple
            value={form.contactIds}
            onChange={(e) =>
              setForm({ ...form, contactIds: e.target.value as string[] })
            }
            input={<OutlinedInput label="Destinatários" />}
            renderValue={(selected) =>
              `${selected.length} contato${selected.length !== 1 ? "s" : ""}`
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

        <FormTextField
          label="Mensagem"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          required
          multiline
          rows={4}
        />

        <FormTextField
          label="Agendar para"
          type="datetime-local"
          value={toDatetimeLocal(form.scheduledAt)}
          onChange={(e) =>
            setForm({ ...form, scheduledAt: new Date(e.target.value) })
          }
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </DialogForm>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir mensagem?"
        description="Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Page>
  );
};
