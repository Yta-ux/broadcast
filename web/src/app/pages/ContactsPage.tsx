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
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContactsIcon from "@mui/icons-material/Contacts";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import { createContact, updateContact, deleteContact } from "../services/contacts";
import { Page } from "../layout/Page";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormTextField } from "../components/FormTextField";
import { FormPhoneField } from "../components/FormPhoneField";
import { DialogForm } from "../components/DialogForm";
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterConnectionId, setFilterConnectionId] = useState("");

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
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContact(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  const getConnectionName = (connectionId: string) =>
    connections.find((c) => c.id === connectionId)?.name ?? "—";

  const filteredContacts = filterConnectionId
    ? contacts.filter((c) => c.connectionId === filterConnectionId)
    : contacts;

  if (loading) return <LoadingState rows={5} />;

  return (
    <Page
      title="Contatos"
      rightSlot={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo Contato
        </Button>
      }
    >
      <Box className="mb-4">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Filtrar por Conexão</InputLabel>
          <Select
            value={filterConnectionId}
            onChange={(e) => setFilterConnectionId(e.target.value)}
            label="Filtrar por Conexão"
          >
            <MenuItem value="">Todas</MenuItem>
            {connections.map((conn) => (
              <MenuItem key={conn.id} value={conn.id}>
                {conn.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredContacts.length === 0 ? (
        <EmptyState
          icon={<ContactsIcon sx={{ fontSize: 36 }} />}
          title="Nenhum contato"
          description="Adicione contatos às suas conexões para enviar mensagens."
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Conexão</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={getConnectionName(contact.connectionId)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(contact)}
                      color="primary"
                      aria-label="Editar contato"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(contact.id)}
                      color="error"
                      aria-label="Excluir contato"
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
        title={editingId ? "Editar Contato" : "Novo Contato"}
        actions={
           <>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : editingId ? "Atualizar" : "Criar"}
            </Button>
          </>
        }
      >
        {error && <Alert severity="error">{error}</Alert>}
        {!editingId && (
          <FormControl fullWidth required>
            <InputLabel>Conexão</InputLabel>
            <Select
              value={form.connectionId}
              onChange={(e) => setForm({ ...form, connectionId: e.target.value })}
              label="Conexão"
            >
              {connections.map((conn) => (
                <MenuItem key={conn.id} value={conn.id}>
                  {conn.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormTextField
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <FormPhoneField
          value={form.phone}
          onValueChange={(raw) => setForm({ ...form, phone: raw })}
          required
        />
      </DialogForm>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir contato?"
        description="Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Page>
  );
};
