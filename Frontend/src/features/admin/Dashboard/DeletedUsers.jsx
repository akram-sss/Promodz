import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Paper, 
  Button,
  TablePagination, 
  TextField, 
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Checkbox
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  RestoreFromTrash as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAuth } from '@shared/context/AuthContext';
import { superAdminAPI } from '@shared/api';

const DeletedUsersPage = () => {
  const { role } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState({ open: false, type: '', message: '' });

  const fetchDeletedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      const res = (await superAdminAPI.getDeletedUsers(params)).data;
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch deleted users:', err);
      setNotification({ open: true, type: 'error', message: 'Failed to load deleted users.' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      fetchDeletedUsers();
    }
  }, [fetchDeletedUsers, role]);

  const handleRestore = async (userId, username) => {
    if (!window.confirm(`Restore user "${username}"?`)) return;
    try {
      await superAdminAPI.restoreUser(userId);
      setNotification({ open: true, type: 'success', message: `User "${username}" restored successfully.` });
      setSelected(prev => prev.filter(id => id !== userId));
      fetchDeletedUsers();
    } catch (err) {
      console.error('Failed to restore user:', err);
      setNotification({ open: true, type: 'error', message: err.response?.data?.error || 'Failed to restore user.' });
    }
  };

  const handleToggleSelect = (userId) => {
    setSelected(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleSelectAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map(u => u.id));
    }
  };

  const handlePermanentDelete = async () => {
    if (selected.length === 0) return;
    const first = window.confirm(`You are about to PERMANENTLY delete ${selected.length} user(s). This action is irreversible.\n\nContinue?`);
    if (!first) return;
    const second = window.confirm(`FINAL WARNING: All data for these ${selected.length} user(s) will be destroyed forever. Are you absolutely sure?`);
    if (!second) return;
    try {
      setDeleting(true);
      await superAdminAPI.permanentDeleteUsers(selected);
      setNotification({ open: true, type: 'success', message: `${selected.length} user(s) permanently deleted.` });
      setSelected([]);
      fetchDeletedUsers();
    } catch (err) {
      console.error('Permanent delete failed:', err);
      setNotification({ open: true, type: 'error', message: err.response?.data?.error || 'Failed to permanently delete users.' });
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (userRole) => {
    switch (userRole) {
      case 'ADMIN': return { bg: '#f5ebff', color: '#8b5cf6' };
      case 'ENTREPRISE': return { bg: '#8b5cf6', color: '#fff' };
      case 'USER': return { bg: '#e0f2fe', color: '#0284c7' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getRoleLabel = (userRole) => {
    switch (userRole) {
      case 'ADMIN': return 'Moderator';
      case 'ENTREPRISE': return 'Company';
      case 'USER': return 'User';
      default: return userRole;
    }
  };

  // Only show content to Super Admin
  if (role !== 'SUPER_ADMIN') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          You don't have permission to view this page
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#8b5cf6' }}>
          Deleted Users Management
        </Typography>
      </Box>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            variant="outlined"
            placeholder="Search deleted users"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            size="small"
            sx={{ width: 350 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Chip label={`${total} deleted`} size="small" sx={{ backgroundColor: '#fee2e2', color: '#dc2626' }} />
        </Box>

        {/* Selection toolbar */}
        {selected.length > 0 && (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            mb={2} 
            p={1.5} 
            sx={{ backgroundColor: '#fef2f2', borderRadius: 1, border: '1px solid #fecaca' }}
          >
            <Typography variant="body2" fontWeight="medium" color="error">
              {selected.length} user(s) selected
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
              onClick={handlePermanentDelete}
              disabled={deleting}
              sx={{ textTransform: 'none' }}
            >
              {deleting ? 'Deleting...' : 'Permanently Delete Selected'}
            </Button>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : users.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography variant="body1" color="textSecondary">
              {searchTerm ? 'No matching deleted users found' : 'No deleted users found'}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Select all header */}
            <Box display="flex" alignItems="center" px={2} py={1} sx={{ backgroundColor: '#f9fafb', borderRadius: 1 }}>
              <Checkbox
                size="small"
                checked={users.length > 0 && selected.length === users.length}
                indeterminate={selected.length > 0 && selected.length < users.length}
                onChange={handleSelectAll}
                sx={{ '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#8b5cf6' } }}
              />
              <Typography variant="caption" color="textSecondary" fontWeight="medium">
                Select All
              </Typography>
            </Box>
            {users.map((user) => {
              const roleStyle = getRoleColor(user.role);
              const isSelected = selected.includes(user.id);
              return (
                <Box key={user.id} mb={1}>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    p={2}
                    sx={{
                      backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
                      '&:hover': {
                        backgroundColor: isSelected ? '#ede9fe' : 'action.hover',
                        borderRadius: 1
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" flex={1}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(user.id)}
                        sx={{ mr: 1, '&.Mui-checked': { color: '#8b5cf6' } }}
                      />
                      <Avatar src={user.image} sx={{ width: 48, height: 48, mr: 2 }}>
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {user.fullName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          @{user.username} &bull; {user.email}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5} gap={1} flexWrap="wrap">
                          <Chip 
                            label={getRoleLabel(user.role)} 
                            size="small" 
                            sx={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
                          />
                          {user.companyName && (
                            <Chip label={user.companyName} size="small" variant="outlined" />
                          )}
                          <Typography variant="caption" color="textSecondary">
                            Deleted: {user.deletedAt ? dayjs(user.deletedAt).format('MMM D, YYYY h:mm A') : 'N/A'}
                          </Typography>
                          {user.deletedBy ? (
                            <Typography variant="caption" color="textSecondary">
                              by {user.deletedBy.fullName || user.deletedBy.username}
                            </Typography>
                          ) : (
                            <Chip label="Self-deleted" size="small" sx={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.7rem', height: 20 }} />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Typography variant="caption" color="textSecondary">
                          Joined: {dayjs(user.createdAt).format('MMM D, YYYY')}
                        </Typography>
                        {user.city && (
                          <Typography variant="caption" color="textSecondary">
                            {user.city}{user.country ? `, ${user.country}` : ''}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleRestore(user.id, user.username)}
                        sx={{ 
                          color: '#16a34a', 
                          borderColor: '#16a34a',
                          '&:hover': { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }
                        }}
                      >
                        Restore
                      </Button>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              );
            })}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.type || 'info'} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeletedUsersPage;