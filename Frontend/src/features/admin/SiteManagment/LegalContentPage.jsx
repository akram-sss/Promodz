import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Delete, Add, Save, Edit, Close } from "@mui/icons-material";
import { legalAPI } from "@shared/api";

const LegalContentPage = () => {
  const [legalData, setLegalData] = useState([]);
  const [newItem, setNewItem] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", description: "" });

  const fetchSections = useCallback(async () => {
    try {
      const res = await legalAPI.getAll();
      setLegalData(res.data ?? []);
    } catch (err) {
      console.error("Failed to load legal sections:", err);
      showSnackbar("Failed to load legal sections.", "error");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditDraft({ title: item.title, description: item.description });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft({ title: "", description: "" });
  };

  const handleSave = async (item) => {
    if (!editDraft.title.trim() || !editDraft.description.trim()) {
      showSnackbar("Title and description cannot be empty.", "error");
      return;
    }
    setSavingId(item.id);
    try {
      await legalAPI.update(item.id, {
        title: editDraft.title.trim(),
        description: editDraft.description.trim(),
      });
      setLegalData((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? { ...s, title: editDraft.title.trim(), description: editDraft.description.trim() }
            : s
        )
      );
      setEditingId(null);
      showSnackbar("Section saved successfully.", "success");
    } catch (err) {
      console.error("Failed to save section:", err);
      showSnackbar("Failed to save section.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try {
      await legalAPI.delete(item.id);
      setLegalData((prev) => prev.filter((s) => s.id !== item.id));
      if (editingId === item.id) setEditingId(null);
      showSnackbar("Section deleted successfully.", "info");
    } catch (err) {
      console.error("Failed to delete section:", err);
      showSnackbar("Failed to delete section.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newItem.title.trim() || !newItem.description.trim()) {
      setError("Both title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await legalAPI.create({
        title: newItem.title.trim(),
        description: newItem.description.trim(),
      });
      setLegalData((prev) => [...prev, res.data]);
      setNewItem({ title: "", description: "" });
      setError("");
      showSnackbar("New section added successfully.", "success");
    } catch (err) {
      console.error("Failed to add legal section:", err);
      showSnackbar(err?.response?.data?.error || "Failed to add the section.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isEditing = (id) => editingId === id;

  return (
    <Box sx={{ p: 4, backgroundColor: "white", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ color: "#8b5cf6", mb: 4 }}>
        Manage Legal Content
      </Typography>

      {pageLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: "#8b5cf6" }} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {legalData.map((item) => (
            <Card
              key={item.id}
              variant="outlined"
              sx={{
                borderColor: isEditing(item.id) ? "#8b5cf6" : "#e0e0e0",
                borderWidth: isEditing(item.id) ? 2 : 1,
                transition: "border-color 0.2s",
              }}
            >
              <CardContent>
                {isEditing(item.id) ? (
                  /* ──── EDIT MODE ──── */
                  <>
                    <TextField
                      label="Title"
                      fullWidth
                      variant="outlined"
                      value={editDraft.title}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, title: e.target.value }))
                      }
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      value={editDraft.description}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, description: e.target.value }))
                      }
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                      <Button
                        variant="outlined"
                        startIcon={<Close />}
                        onClick={handleCancelEdit}
                        sx={{
                          borderColor: "#9e9e9e",
                          color: "#666",
                          "&:hover": { borderColor: "#757575", backgroundColor: "#f5f5f5" },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={
                          savingId === item.id ? (
                            <CircularProgress size={18} sx={{ color: "#fff" }} />
                          ) : (
                            <Save />
                          )
                        }
                        onClick={() => handleSave(item)}
                        disabled={savingId === item.id}
                        sx={{
                          backgroundColor: "#8b5cf6",
                          "&:hover": { backgroundColor: "#7a4ee8" },
                        }}
                      >
                        {savingId === item.id ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </>
                ) : (
                  /* ──── VIEW MODE ──── */
                  <>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Typography
                        variant="h6"
                        sx={{ color: "#333", fontWeight: 600, mb: 1 }}
                      >
                        {item.title}
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          onClick={() => handleStartEdit(item)}
                          size="small"
                          sx={{
                            color: "#8b5cf6",
                            "&:hover": { backgroundColor: "#f5f3ff" },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          size="small"
                          sx={{ color: "#ef4444" }}
                        >
                          {deletingId === item.id ? (
                            <CircularProgress size={18} />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography
                      variant="body1"
                      sx={{ color: "#555", lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                    >
                      {item.description}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add New Section */}
          <Card variant="outlined" sx={{ borderColor: "#8b5cf6", borderStyle: "dashed" }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#8b5cf6", mb: 2 }}>
                Add New Section
              </Typography>
              <TextField
                label="Title"
                fullWidth
                variant="outlined"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                sx={{ mb: 2 }}
                error={Boolean(error && !newItem.title.trim())}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                error={Boolean(error && !newItem.description.trim())}
              />
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : <Add />}
                  onClick={handleAdd}
                  sx={{
                    backgroundColor: "#8b5cf6",
                    "&:hover": { backgroundColor: "#7a4ee8" },
                  }}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LegalContentPage;
