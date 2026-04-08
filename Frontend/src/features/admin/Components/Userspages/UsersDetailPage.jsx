import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Snackbar, Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';
import { superAdminAPI } from '@shared/api';

const theme = createTheme({
  palette: {
    primary: { main: '#8b5cf6', contrastText: '#ffffff' },
    secondary: { main: '#f43f5e' },
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

const UserDetailPage = ({ userId, userData }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(userData);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleBanToggle = async () => {
    try {
      setSaving(true);
      if (user.isBanned) {
        await superAdminAPI.unbanUser(user.id);
        setUser(prev => ({ ...prev, isBanned: false }));
        setSuccess('User unbanned successfully!');
      } else {
        if (window.confirm('Are you sure you want to ban this user?')) {
          await superAdminAPI.banUser(user.id);
          setUser(prev => ({ ...prev, isBanned: true }));
          setSuccess('User banned successfully!');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAlert = () => { setError(null); setSuccess(null); };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>User not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to users
        </Button>
      </Box>
    );
  }

  const daysActive = dayjs().diff(dayjs(user.createdAt), 'days');
  const favorites = user._count?.productFavorites || 0;
  const ratings = user._count?.productRatings || 0;
  const following = user._count?.companiesFollowed || 0;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>{success}</Alert>
        </Snackbar>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: 'primary.main' }}>
              Back
            </Button>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
              User Details
            </Typography>
          </Box>
          <Button
            variant="contained"
            color={user.isBanned ? 'success' : 'error'}
            startIcon={user.isBanned ? <CheckCircleIcon /> : <BlockIcon />}
            onClick={handleBanToggle}
            disabled={saving}
          >
            {user.isBanned ? 'Unban User' : 'Ban User'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* Left Column - Profile */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={user.image}
                  alt={user.fullName}
                  sx={{ width: 120, height: 120, margin: '0 auto 16px', border: '3px solid #f5f5f5' }}
                >
                  {user.fullName?.[0]}
                </Avatar>
                <Typography variant="h5" gutterBottom>{user.fullName}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>@{user.username}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>User ID:</strong> {user.id}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip label={user.role} color="primary" size="small" />
                  {user.isBanned && <Chip label="BANNED" color="error" size="small" />}
                  <Chip label={user.active ? 'Active' : 'Inactive'} size="small" variant="outlined" color={user.active ? 'success' : 'default'} />
                </Box>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                  <PersonIcon sx={{ mr: 1 }} /> User Information
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'primary.light' }} />
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>
                    <a href={`mailto:${user.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{user.email}</a>
                  </Typography>
                </Box>
                {user.phoneNumber && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>
                      <a href={`tel:${user.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>{user.phoneNumber}</a>
                    </Typography>
                  </Box>
                )}
                {(user.city || user.country) && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>{[user.city, user.country].filter(Boolean).join(', ')}</Typography>
                  </Box>
                )}
                {user.postalCode && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Postal Code: {user.postalCode}</Typography>
                  </Box>
                )}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Member Since:</Typography>
                  <Typography variant="body2">{dayjs(user.createdAt).format('YYYY-MM-DD')}</Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Right Column - Statistics */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                  <PersonIcon sx={{ mr: 1 }} /> User Statistics
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
                        <TableCell>Account Created</TableCell>
                        <TableCell align="right">{dayjs(user.createdAt).format('YYYY-MM-DD')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Days Active</TableCell>
                        <TableCell align="right">{daysActive}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Favorites</TableCell>
                        <TableCell align="right">{favorites}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Ratings Given</TableCell>
                        <TableCell align="right">{ratings}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Companies Followed</TableCell>
                        <TableCell align="right">{following}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Last Seen</TableCell>
                        <TableCell align="right">{user.lastSeen ? dayjs(user.lastSeen).format('YYYY-MM-DD HH:mm') : 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Online Status</TableCell>
                        <TableCell align="right">
                          <Chip label={user.online ? 'Online' : 'Offline'} size="small" color={user.online ? 'success' : 'default'} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default UserDetailPage;
