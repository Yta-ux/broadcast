import { useState, type FormEvent } from "react";
import {
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CableIcon from "@mui/icons-material/Cable";
import { useAuth } from "../hooks/useAuth";
import { useFilteredCollection } from "../hooks/useFirestore";
import {
  createConnection,
  updateConnection,
  deleteConnection,
} from "../services/connections";
import { Page } from "../layout/Page";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormTextField } from "../components/FormTextField";
import { DialogForm } from "../components/DialogForm";
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConnection(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingState rows={4} />;

  return (
    <Page
      title="Conexões"
      rightSlot={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova Conexão
        </Button>
      }
    >
      {connections.length === 0 ? (
        <EmptyState
          icon={<CableIcon sx={{ fontSize: 36 }} />}
          title="Nenhuma conexão"
          description="Crie sua primeira conexão para começar a gerenciar contatos e mensagens."
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {connections.map((conn) => (
                <TableRow key={conn.id} hover>
                  <TableCell>
                    <Chip label={conn.name} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(conn)}
                      color="primary"
                      aria-label="Editar conexão"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(conn.id)}
                      color="error"
                      aria-label="Excluir conexão"
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
        title={editingId ? "Editar Conexão" : "Nova Conexão"}
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
        <FormTextField
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          autoFocus
        />
      </DialogForm>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir conexão?"
        description="Essa ação não pode ser desfeita. Todos os contatos e mensagens associados permanecerão no sistema."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Page>
  );
};
