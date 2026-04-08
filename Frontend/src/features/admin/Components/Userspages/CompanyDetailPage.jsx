import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography, Switch, FormControlLabel,
  Snackbar, Alert, CircularProgress, IconButton, InputAdornment,
  MenuItem, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  RemoveCircle as RemoveIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';
import { superAdminAPI, userAPI, subscriptionAPI } from '@shared/api';

const theme = createTheme({
  palette: {
    primary: { main: '#8b5cf6', contrastText: '#ffffff' },
    secondary: { main: '#f43f5e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
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

const PauseButton = styled(Button)(({ theme, ispaused }) => ({
  backgroundColor: ispaused === 'true' ? theme.palette.warning.main : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(2),
  '&:hover': {
    backgroundColor: ispaused === 'true' ? theme.palette.warning.dark : theme.palette.primary.dark,
  },
  minWidth: '120px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
}));

const planPresets = {
  FREE: { name: 'Free', color: '#9CA3AF', bgColor: '#F3F4F6', icon: '\uD83D\uDCE6' },
  BASIC: { name: 'Basic', color: '#CD7F32', bgColor: '#FFF5EE', icon: '\uD83E\uDD49' },
  PREMIUM: { name: 'Premium', color: '#C0C0C0', bgColor: '#F5F5F5', icon: '\uD83E\uDD48' },
  ENTERPRISE: { name: 'Enterprise', color: '#FFD700', bgColor: '#FFF8DC', icon: '\uD83D\uDC51' },
};

const CompanyDetailPage = ({ userId, userData }) => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(userData || null);
  const [originalCompany, setOriginalCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPaused, setIsPaused] = useState(() => {
    if (!userData?.subscription) return false;
    return userData.subscription.status === 'CANCELLED' || dayjs(userData.subscription.endDate).isBefore(dayjs());
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  // Assign moderator dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [allModerators, setAllModerators] = useState([]);
  const [selectedModeratorId, setSelectedModeratorId] = useState('');
  const [loadingModerators, setLoadingModerators] = useState(false);

  // Edited subscription state
  const [editSub, setEditSub] = useState({
    plan: userData?.subscription?.plan || 'FREE',
    startDate: userData?.subscription?.startDate ? dayjs(userData.subscription.startDate) : dayjs(),
    endDate: userData?.subscription?.endDate ? dayjs(userData.subscription.endDate) : dayjs().add(1, 'year'),
  });

  const handleBanToggle = async () => {
    try {
      setSaving(true);
      if (company.isBanned) {
        await superAdminAPI.unbanUser(company.id);
        setCompany(prev => ({ ...prev, isBanned: false }));
        setSuccess('Company unbanned successfully');
      } else {
        await superAdminAPI.banUser(company.id, 'Banned by super admin');
        setCompany(prev => ({ ...prev, isBanned: true }));
        setSuccess('Company banned successfully');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update ban status');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionToggle = async (adminId, permKey, currentVal) => {
    try {
      setSaving(true);
      await superAdminAPI.updatePermissions(adminId, { companyId: company.id, [permKey]: !currentVal });
      setCompany(prev => ({
        ...prev,
        assignedAdmins: prev.assignedAdmins.map(a =>
          a.id === adminId ? { ...a, permissions: { ...a.permissions, [permKey]: !currentVal } } : a
        ),
      }));
      setSuccess('Permission updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update permission');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    setOriginalCompany(JSON.parse(JSON.stringify(company)));
    setEditSub({
      plan: company.subscription?.plan || 'FREE',
      startDate: company.subscription?.startDate ? dayjs(company.subscription.startDate) : dayjs(),
      endDate: company.subscription?.endDate ? dayjs(company.subscription.endDate) : dayjs().add(1, 'year'),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (originalCompany) {
      setCompany(JSON.parse(JSON.stringify(originalCompany)));
      setIsPaused(dayjs(originalCompany.subscription?.endDate).isBefore(dayjs()));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {};
      if (editSub.startDate) updateData.startDate = editSub.startDate.toISOString();
      if (editSub.endDate) updateData.endDate = editSub.endDate.toISOString();
      if (editSub.plan) updateData.plan = editSub.plan;

      const res = await subscriptionAPI.updateDates(company.id, updateData);
      const updated = res.data?.subscription || res.data;

      setCompany(prev => ({
        ...prev,
        subscription: { ...prev.subscription, ...updated },
      }));

      setIsPaused(dayjs(editSub.endDate).isBefore(dayjs()));
      setIsEditing(false);
      setOriginalCompany(null);
      setSuccess('Subscription updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (name, date) => {
    if (!date || !date.isValid()) return;
    setEditSub(prev => ({ ...prev, [name]: date }));
  };

  const togglePause = async () => {
    try {
      setSaving(true);
      const newPauseState = !isPaused;
      if (!newPauseState && dayjs(company.subscription?.endDate).isBefore(dayjs())) {
        throw new Error('Cannot resume with expired subscription. Update end date first.');
      }
      const newStatus = newPauseState ? 'CANCELLED' : 'ACTIVE';
      await subscriptionAPI.updateDates(company.id, { status: newStatus });
      setIsPaused(newPauseState);
      setCompany(prev => ({
        ...prev,
        subscription: { ...prev.subscription, status: newStatus },
      }));
      setSuccess(`Company ${newPauseState ? 'paused' : 'resumed'} successfully.`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssignDialog = async () => {
    setAssignOpen(true);
    setLoadingModerators(true);
    try {
      const res = await userAPI.getAll();
      const users = res.data?.data || res.data || [];
      setAllModerators(users.filter(u => u.role === 'ADMIN'));
    } catch (err) {
      setError('Failed to load moderators');
    } finally {
      setLoadingModerators(false);
    }
  };

  const handleAssignModerator = async () => {
    if (!selectedModeratorId) return;
    try {
      setSaving(true);
      await superAdminAPI.assignAdmin(selectedModeratorId, company.id);
      const mod = allModerators.find(m => m.id === selectedModeratorId);
      setCompany(prev => ({
        ...prev,
        assignedAdmins: [...(prev.assignedAdmins || []), {
          id: mod.id, fullName: mod.fullName, email: mod.email, image: mod.image, role: mod.role,
          permissions: { canViews: true, canEdit: true, canDelete: true, canAdd: true },
        }],
      }));
      setSuccess(`Moderator "${mod.fullName}" assigned`);
      setAssignOpen(false);
      setSelectedModeratorId('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign moderator');
    } finally {
      setSaving(false);
    }
  };

  const handleUnassignModerator = async (adminId) => {
    if (!window.confirm('Unassign this moderator?')) return;
    try {
      setSaving(true);
      await superAdminAPI.unassignAdmin(adminId, company.id);
      setCompany(prev => ({ ...prev, assignedAdmins: prev.assignedAdmins.filter(a => a.id !== adminId) }));
      setSuccess('Moderator unassigned');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unassign');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = () => { setError(null); setSuccess(null); };

  if (!company) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Company not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  const subscription = company.subscription;
  const stats = company.companyStats;
  const admins = company.assignedAdmins || [];
  const subscriptionEnded = subscription?.endDate && dayjs(subscription.endDate).isBefore(dayjs());
  const assignedAdminIds = admins.map(a => a.id);
  const availableModerators = allModerators.filter(m => !assignedAdminIds.includes(m.id));
  const currentPlan = planPresets[subscription?.plan] || planPresets.FREE;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>Company Details</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {subscription && (
                <Tooltip title={subscriptionEnded ? "Cannot resume with expired subscription" : isPaused ? "Resume company" : "Pause company"}>
                  <span>
                    <PauseButton
                      variant="contained"
                      startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
                      onClick={togglePause}
                      ispaused={isPaused.toString()}
                      disabled={subscriptionEnded && !isEditing}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </PauseButton>
                  </span>
                </Tooltip>
              )}
              {!isEditing ? (
                <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditClick}>Edit Company</Button>
              ) : null}
              <Button
                variant="contained"
                color={company.isBanned ? 'success' : 'error'}
                startIcon={company.isBanned ? <CheckCircleIcon /> : <BlockIcon />}
                onClick={handleBanToggle}
                disabled={saving}
                sx={{ ml: 1 }}
              >
                {company.isBanned ? 'Unban' : 'Ban'}
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ width: '100%' }}>
            {/* Left Column */}
            <Grid item xs={12} md={4} sx={{ width: '100%'}}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar src={company.image} alt={company.fullName}
                    sx={{ width: 120, height: 120, margin: '0 auto 16px', border: '3px solid #f5f5f5', fontSize: 40 }}>
                    {company.fullName?.[0]}
                  </Avatar>
                  <Typography variant="h5" gutterBottom>{company.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{company.handle || company.username}</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>ID:</strong> {company.id}</Typography>
                  {company.rc && <Typography variant="body2" color="text.secondary"><strong>RC:</strong> {company.rc}</Typography>}
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip label="ENTREPRISE" color="primary" size="small" />
                    {company.isBanned && <Chip label="BANNED" color="error" size="small" />}
                    {subscriptionEnded && <Chip label="Subscription Ended" color="error" size="small" />}
                    {isPaused && !subscriptionEnded && <Chip label="Paused" color="warning" size="small" />}
                  </Box>
                </CardContent>
              </StyledCard>

              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <BusinessIcon sx={{ mr: 1 }} /> Company Information
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />

                  {isEditing ? (
                    <>
                      <TextField fullWidth select label="Subscription Plan" value={editSub.plan}
                        onChange={(e) => setEditSub(prev => ({ ...prev, plan: e.target.value }))}
                        margin="normal" variant="outlined" InputProps={{ sx: { borderRadius: '8px' } }}>
                        {Object.entries(planPresets).map(([key, p]) => (
                          <MenuItem key={key} value={key}>{p.icon} {p.name}</MenuItem>
                        ))}
                      </TextField>
                      <Box sx={{ mt: 2 }}>
                        <DatePicker label="Subscription Start Date" value={editSub.startDate}
                          onChange={(date) => handleDateChange('startDate', date)}
                          sx={{ width: '100%', mb: 2 }} maxDate={editSub.endDate} />
                        <DatePicker label="Subscription End Date *" value={editSub.endDate}
                          onChange={(date) => handleDateChange('endDate', date)}
                          sx={{ width: '100%' }} minDate={editSub.startDate} />
                      </Box>
                    </>
                  ) : (
                    <>
                      {company.companyName && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography>{company.companyName}</Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          <a href={`mailto:${company.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{company.email}</a>
                        </Typography>
                      </Box>
                      {company.phoneNumber && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography>
                            <a href={`tel:${company.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>{company.phoneNumber}</a>
                          </Typography>
                        </Box>
                      )}
                      {(company.address || company.city || company.country) && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography>{[company.address, company.city, company.postalCode, company.country].filter(Boolean).join(', ')}</Typography>
                        </Box>
                      )}
                      {subscription && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">Subscription:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="body2"><strong>Plan:</strong></Typography>
                            <Chip label={`${currentPlan.icon} ${currentPlan.name}`} size="small"
                              sx={{ backgroundColor: currentPlan.bgColor, color: currentPlan.color, fontWeight: 600 }} />
                            <Chip label={subscription.status} size="small" variant="outlined"
                              color={subscription.status === 'ACTIVE' ? 'success' : 'default'} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Start:</strong> {dayjs(subscription.startDate).format('YYYY-MM-DD')}
                            </Typography>
                            <Typography variant="body2" color={subscriptionEnded ? 'error' : 'inherit'}>
                              <strong>End:</strong> {dayjs(subscription.endDate).format('YYYY-MM-DD')}
                              {subscriptionEnded && ' (Expired)'}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={8}sx={{ width: '100%' }}>
              {/* Statistics */}
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <BusinessIcon sx={{ mr: 1 }} /> Company Statistics
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell align="right">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Followers</TableCell>
                          <TableCell align="right">{stats?.followers ?? company._count?.followers ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Active Promotions</TableCell>
                          <TableCell align="right">{stats?.activeProducts ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Expired Promotions</TableCell>
                          <TableCell align="right">{stats?.expiredProducts ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Deleted Promotions</TableCell>
                          <TableCell align="right">{stats?.deletedProducts ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Clicks</TableCell>
                          <TableCell align="right">{stats?.totalClicks ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Products</TableCell>
                          <TableCell align="right">{company._count?.productsAsCompany ?? 0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </StyledCard>

              {/* Moderators */}
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                      <PersonIcon sx={{ mr: 1 }} /> Assigned Moderators
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={`${admins.length}`} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }} size="small" />
                      <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenAssignDialog}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}>
                        Assign
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />

                  {admins.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <PersonIcon sx={{ fontSize: 48, color: 'rgba(139,92,246,0.2)', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">No moderators assigned</Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                          <TableRow>
                            <TableCell sx={{ color: 'primary.contrastText' }}>Moderator</TableCell>
                            <TableCell align="center" sx={{ color: 'primary.contrastText' }}>View</TableCell>
                            <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Edit</TableCell>
                            <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Add</TableCell>
                            <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Delete</TableCell>
                            <TableCell align="center" sx={{ color: 'primary.contrastText' }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {admins.map((admin) => (
                            <TableRow key={admin.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar src={admin.image} sx={{ width: 32, height: 32, fontSize: 14 }}>{admin.fullName?.[0]}</Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>{admin.fullName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{admin.email}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              {['canViews', 'canEdit', 'canAdd', 'canDelete'].map((perm) => (
                                <TableCell key={perm} align="center">
                                  <Switch size="small"
                                    checked={admin.permissions?.[perm] ?? false}
                                    onChange={() => handlePermissionToggle(admin.id, perm, admin.permissions?.[perm])}
                                    disabled={saving} color="primary" />
                                </TableCell>
                              ))}
                              <TableCell align="center">
                                <Tooltip title="Remove moderator">
                                  <IconButton size="small" color="error" onClick={() => handleUnassignModerator(admin.id)} disabled={saving}>
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

          {/* Save/Cancel bar */}
          {isEditing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}
                sx={{ borderRadius: '8px' }}>Cancel</Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleSave} disabled={saving}
                sx={{ borderRadius: '8px' }}>Save Changes</Button>
            </Box>
          )}

          {/* Assign Moderator Dialog */}
          <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: '12px' } }}>
            <DialogTitle sx={{ color: 'primary.main', fontWeight: 700 }}>Assign Moderator to Company</DialogTitle>
            <DialogContent>
              {loadingModerators ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#8b5cf6' }} />
                </Box>
              ) : availableModerators.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>No available moderators.</Typography>
              ) : (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Select Moderator</InputLabel>
                  <Select value={selectedModeratorId} onChange={(e) => setSelectedModeratorId(e.target.value)} label="Select Moderator">
                    {availableModerators.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={m.image} sx={{ width: 28, height: 28, fontSize: 12 }}>{m.fullName?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{m.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{m.email}</Typography>
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
              <Button variant="contained" onClick={handleAssignModerator} disabled={!selectedModeratorId || saving}
                sx={{ borderRadius: '8px' }}>
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Assign'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default CompanyDetailPage;
