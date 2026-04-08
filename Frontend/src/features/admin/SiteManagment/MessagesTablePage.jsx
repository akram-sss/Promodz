import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TableSortLabel,
  Box,
  Button,
  Typography,
  Paper,
  Toolbar,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Delete, Download } from "@mui/icons-material";
import { feedbackAPI } from '@shared/api';
import { exportToExcel } from '@shared/utils/exportToExcel';

const MessagesTablePage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState("dateSent");
  const [order, setOrder] = useState("desc");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = (await feedbackAPI.getAll()).data;
        const feedbacks = res.feedbacks || res || [];
        const mapped = (Array.isArray(feedbacks) ? feedbacks : []).map(f => ({
          id: f.id,
          fullName: f.fullName || f.user?.username || 'Unknown',
          email: f.email || f.user?.email || '',
          role: f.senderRole || f.user?.role || f.role || 'user',
          content: f.message || f.content || '',
          dateSent: f.createdAt || f.dateSent || new Date().toISOString(),
        }));
        setMessages(mapped);
      } catch (err) {
        console.error('Failed to load messages:', err);
        showSnackbar('Failed to load messages', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(messages.map((msg) => msg.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      showSnackbar("No messages selected for deletion.", "warning");
      return;
    }
    try {
      await Promise.all(selected.map(id => feedbackAPI.delete(id)));
      setMessages(messages.filter((msg) => !selected.includes(msg.id)));
      setSelected([]);
      showSnackbar("Selected messages deleted successfully.", "success");
    } catch (err) {
      showSnackbar("Failed to delete some messages.", "error");
    }
  };




const handleExportToExcel = async () => {
    setExporting(true);
    try {
      await exportToExcel(messages, {
        fileName: "messages",
        sheetName: "Messages",
        columns: [
          { header: "Full Name", key: "fullName", width: 20 },
          { header: "Email", key: "email", width: 28 },
          { header: "Role", key: "role", width: 12 },
          { header: "Message", key: "content", width: 50 },
          { header: "Date Sent", key: (row) => new Date(row.dateSent).toLocaleString(), width: 22 },
        ],
      });
    } finally {
      setExporting(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sortedMessages = [...messages].sort((a, b) => {
    const aVal = a[orderBy]?.toLowerCase?.() || a[orderBy];
    const bVal = b[orderBy]?.toLowerCase?.() || b[orderBy];
    return order === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
  });

  return (
    <Box sx={{ p: 4, backgroundColor: "white", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ color: "#8b5cf6", mb: 4 }}>
        Received Messages
      </Typography>

      <Paper elevation={2}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            bgcolor: "#f9f9f9",
            borderBottom: "1px solid #e0e0e0",
            px: 2,
          }}
        >
          <Box>
            <Tooltip title="Delete selected">
              <span>
                <IconButton
                  onClick={handleDeleteSelected}
                  disabled={selected.length === 0}
                  sx={{ color: selected.length > 0 ? "#8b5cf6" : "#ccc" }}
                >
                  <Delete />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Download />}
            disabled={exporting}
            onClick={handleExportToExcel}
            sx={{
              backgroundColor: "#8b5cf6",
              "&:hover": { backgroundColor: "#7a4ee8" },
            }}
          >
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
        </Toolbar>

        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === messages.length && messages.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sortDirection={orderBy === "fullName" ? order : false}>
                <TableSortLabel
                  active={orderBy === "fullName"}
                  direction={orderBy === "fullName" ? order : "asc"}
                  onClick={() => handleSort("fullName")}
                >
                  Full Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "email" ? order : false}>
                <TableSortLabel
                  active={orderBy === "email"}
                  direction={orderBy === "email" ? order : "asc"}
                  onClick={() => handleSort("email")}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "role" ? order : false}>
                <TableSortLabel
                  active={orderBy === "role"}
                  direction={orderBy === "role" ? order : "asc"}
                  onClick={() => handleSort("role")}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell>Message</TableCell>
              <TableCell sortDirection={orderBy === "dateSent" ? order : false}>
                <TableSortLabel
                  active={orderBy === "dateSent"}
                  direction={orderBy === "dateSent" ? order : "asc"}
                  onClick={() => handleSort("dateSent")}
                >
                  Date Sent
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMessages.length > 0 ? (
              sortedMessages.map((msg) => (
                <TableRow key={msg.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(msg.id)}
                      onChange={() => handleSelect(msg.id)}
                    />
                  </TableCell>
                  <TableCell>{msg.fullName}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: msg.role === "company" ? "#e3f2fd" : "#f3e5f5",
                        color: msg.role === "company" ? "#1976d2" : "#8b5cf6",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {msg.role}
                    </Box>
                  </TableCell>
                  <TableCell>{msg.content}</TableCell>
                  <TableCell>{new Date(msg.dateSent).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No messages to display.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagesTablePage;
