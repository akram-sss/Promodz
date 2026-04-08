import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Switch, Snackbar, Alert, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  RemoveCircle as RemoveIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';
import { superAdminAPI, userAPI } from '@shared/api';

const theme = createTheme({
  palette: {
    primary: { main: '#8b5cf6', contrastText: '#ffffff' },
    secondary: { main: '#f43f5e' },
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: '1px solid #8b5cf6',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(139, 92, 246, 0.15)',
  },
}));

const PermissionBadge = styled(Chip)(({ active }) => ({
  backgroundColor: active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(244, 63, 94, 0.1)',
  color: active ? '#8b5cf6' : '#f43f5e',
  fontWeight: 500,
}));

const ModeratorDetailPage = ({ userId, userData }) => {
  const navigate = useNavigate();
  const [moderator, setModerator] = useState(userData || null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  // Assign company dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const handleBanToggle = async () => {
    try {
      setSaving(true);
      if (moderator.isBanned) {
        await superAdminAPI.unbanUser(moderator.id);
        setModerator(prev => ({ ...prev, isBanned: false }));
        setSuccess('Moderator unbanned successfully');
      } else {
        await superAdminAPI.banUser(moderator.id, 'Banned by super admin');
        setModerator(prev => ({ ...prev, isBanned: true }));
        setSuccess('Moderator banned successfully');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update ban status');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionToggle = async (companyId, permKey, currentVal) => {
    try {
      setSaving(true);
      await superAdminAPI.updatePermissions(moderator.id, { companyId, [permKey]: !currentVal });
      setModerator(prev => ({
        ...prev,
        assignedCompanies: prev.assignedCompanies.map(c =>
          c.id === companyId ? { ...c, permissions: { ...c.permissions, [permKey]: !currentVal } } : c
        ),
      }));
      setSuccess('Permission updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update permission');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssignDialog = async () => {
    setAssignOpen(true);
    setLoadingCompanies(true);
    try {
      const res = await userAPI.getAll();
      const users = res.data?.data || res.data || [];
      setAllCompanies(users.filter(u => u.role === 'ENTREPRISE'));
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleAssignCompany = async () => {
    if (!selectedCompanyId) return;
    try {
      setSaving(true);
      await superAdminAPI.assignAdmin(moderator.id, selectedCompanyId);
      const assigned = allCompanies.find(c => c.id === selectedCompanyId);
      setModerator(prev => ({
        ...prev,
        assignedCompanies: [...(prev.assignedCompanies || []), {
          id: assigned.id, fullName: assigned.fullName, companyName: assigned.companyName,
          email: assigned.email, image: assigned.image,
          permissions: { canViews: true, canEdit: true, canDelete: true, canAdd: true },
        }],
      }));
      setSuccess(`Company "${assigned.companyName || assigned.fullName}" assigned`);
      setAssignOpen(false);
      setSelectedCompanyId('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign company');
    } finally {
      setSaving(false);
    }
  };

  const handleUnassignCompany = async (companyId) => {
    if (!window.confirm('Unassign this company?')) return;
    try {
      setSaving(true);
      await superAdminAPI.unassignAdmin(moderator.id, companyId);
      setModerator(prev => ({ ...prev, assignedCompanies: prev.assignedCompanies.filter(c => c.id !== companyId) }));
      setSuccess('Company unassigned');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unassign');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = () => { setError(null); setSuccess(null); };

  if (!moderator) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Moderator not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  const companies = moderator.assignedCompanies || [];
  const assignedIds = companies.map(c => c.id);
  const availableCompanies = allCompanies.filter(c => !assignedIds.includes(c.id));

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>{success}</Alert>
        </Snackbar>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'primary.main' }}>Back</Button>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>Moderator Details</Typography>
          </Box>
          <Button
            variant="contained"
            color={moderator.isBanned ? 'success' : 'error'}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : (moderator.isBanned ? <CheckCircleIcon /> : <BlockIcon />)}
            onClick={handleBanToggle}
            disabled={saving}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {moderator.isBanned ? 'Unban Moderator' : 'Ban Moderator'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* Left Column - Profile */}
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            <StyledCard>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar src={moderator.image} alt={moderator.fullName}
                  sx={{ width: 120, height: 120, margin: '0 auto 16px', border: '3px solid #f5f5f5', fontSize: 40 }}>
                  {moderator.fullName?.[0]}
                </Avatar>
                <Typography variant="h5" gutterBottom>{moderator.fullName}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{moderator.handle || moderator.username}</Typography>
                <Typography variant="body2" color="text.secondary"><strong>ID:</strong> {moderator.id}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip icon={<ShieldIcon />} label="MODERATOR" color="primary" size="small"
                    sx={{ '& .MuiChip-icon': { color: 'white' } }} />
                  {moderator.isBanned && <Chip label="BANNED" color="error" size="small" />}
                </Box>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                  <PersonIcon sx={{ mr: 1 }} /> Basic Information
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>
                    <a href={`mailto:${moderator.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{moderator.email}</a>
                  </Typography>
                </Box>
                {moderator.phoneNumber && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>
                      <a href={`tel:${moderator.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>{moderator.phoneNumber}</a>
                    </Typography>
                  </Box>
                )}
                {(moderator.address || moderator.city || moderator.country) && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>{[moderator.address, moderator.city, moderator.postalCode, moderator.country].filter(Boolean).join(', ')}</Typography>
                  </Box>
                )}
                {moderator.createdAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">Joined: {dayjs(moderator.createdAt).format('MMM D, YYYY')}</Typography>
                  </Box>
                )}
              </CardContent>
            </StyledCard>

            {/* Summary */}
            <StyledCard>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>Summary</Typography>
                <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 1,
                  background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#8b5cf6' }}>{companies.length}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Companies Assigned</Typography>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Right Column - Assigned Companies */}
          <Grid item xs={12} md={8} sx={{ width: '100%' }}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <BusinessIcon sx={{ mr: 1 }} /> Assigned Companies
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={`${companies.length} companies`} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }} size="small" />
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenAssignDialog}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}>
                      Assign Company
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />

                {companies.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <BusinessIcon sx={{ fontSize: 56, color: 'rgba(139,92,246,0.15)', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>No companies assigned</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Click "Assign Company" to add companies</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: 'primary.light' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'primary.contrastText' }}>Company</TableCell>
                          <TableCell align="center" sx={{ color: 'primary.contrastText' }}>View</TableCell>
                          <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Edit</TableCell>
                          <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Add</TableCell>
                          <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Delete</TableCell>
                          <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companies.map((company) => (
                          <TableRow key={company.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={company.image} sx={{ width: 32, height: 32, fontSize: 14 }}>
                                  {company.fullName?.[0] || company.companyName?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>{company.companyName || company.fullName}</Typography>
                                  <Typography variant="caption" color="text.secondary">{company.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            {['canViews', 'canEdit', 'canAdd', 'canDelete'].map((perm) => (
                              <TableCell key={perm} align="center">
                                <Switch size="small"
                                  checked={company.permissions?.[perm] ?? false}
                                  onChange={() => handlePermissionToggle(company.id, perm, company.permissions?.[perm])}
                                  disabled={saving} color="primary" />
                              </TableCell>
                            ))}
                            <TableCell align="center">
                              <Tooltip title="Remove company">
                                <IconButton size="small" color="error" onClick={() => handleUnassignCompany(company.id)} disabled={saving}>
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Assign Company Dialog */}
        <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: '12px' } }}>
          <DialogTitle sx={{ color: 'primary.main', fontWeight: 700 }}>Assign Company to Moderator</DialogTitle>
          <DialogContent>
            {loadingCompanies ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#8b5cf6' }} />
              </Box>
            ) : availableCompanies.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>No available companies to assign.</Typography>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Company</InputLabel>
                <Select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} label="Select Company">
                  {availableCompanies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={c.image} sx={{ width: 28, height: 28, fontSize: 12 }}>{c.fullName?.[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{c.companyName || c.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAssignOpen(false)} sx={{ borderRadius: '8px' }}>Cancel</Button>
            <Button variant="contained" onClick={handleAssignCompany} disabled={!selectedCompanyId || saving}
              sx={{ borderRadius: '8px' }}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Assign'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ModeratorDetailPage;
