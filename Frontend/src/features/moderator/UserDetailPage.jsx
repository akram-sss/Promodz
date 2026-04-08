import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Box, CircularProgress, Typography, Card, CardContent,
  Avatar, Chip, Divider, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CompanyDetailPage from './Components/Userspages/CompanyDetailPage';
import { userAPI } from '@shared/api';
import dayjs from 'dayjs';

const StyledCard = styled(Card)(() => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  marginBottom: '24px',
  border: '1px solid #8b5cf6',
}));

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getById(userId);
        setUserData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  if (error || !userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#8b5cf6', border: '1px solid #8b5cf6', '&:hover': { backgroundColor: '#8b5cf6', color: '#fff' } }}
        >
          Back
        </Button>
        <Typography color="error" sx={{ mt: 2 }}>{error || 'User not found'}</Typography>
      </Box>
    );
  }

  // ENTREPRISE users get the full company detail page
  if (userData.role === 'ENTREPRISE') {
    return <CompanyDetailPage userData={userData} />;
  }

  // Non-company users (USER, ADMIN) get a basic user detail view
  const roleLabel = userData.role === 'ADMIN' ? 'Moderator' : userData.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#8b5cf6' }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ color: '#8b5cf6' }}>User Details</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column — Profile & Contact */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={userData.image}
                sx={{ width: 120, height: 120, margin: '0 auto 16px', border: '3px solid #f5f5f5', fontSize: 40 }}
              >
                {userData.fullName?.[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>{userData.fullName}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>@{userData.username}</Typography>
              <Typography variant="body2" color="text.secondary"><strong>ID:</strong> {userData.id}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip label={roleLabel} color="primary" size="small" />
                {userData.isBanned && <Chip label="BANNED" color="error" size="small" />}
                {!userData.active && <Chip label="Inactive" color="default" size="small" />}
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8b5cf6', display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> Contact Information
              </Typography>
              <Divider sx={{ mb: 2, mt: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                <Typography>
                  <a href={`mailto:${userData.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{userData.email}</a>
                </Typography>
              </Box>
              {userData.phoneNumber && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                  <Typography>
                    <a href={`tel:${userData.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>{userData.phoneNumber}</a>
                  </Typography>
                </Box>
              )}
              {(userData.address || userData.city || userData.country) && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                  <Typography>
                    {[userData.address, userData.city, userData.postalCode, userData.country].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Right Column — Account & Activity */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8b5cf6' }}>Account Details</Typography>
              <Divider sx={{ mb: 2, mt: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={userData.active ? 'Active' : 'Inactive'}
                          color={userData.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Verified</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={userData.verified ? 'Yes' : 'No'}
                          color={userData.verified ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Banned</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={userData.isBanned ? 'Yes' : 'No'}
                          color={userData.isBanned ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Joined</strong></TableCell>
                      <TableCell>{dayjs(userData.createdAt).format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Last Seen</strong></TableCell>
                      <TableCell>{userData.lastSeen ? dayjs(userData.lastSeen).format('YYYY-MM-DD HH:mm') : 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Online</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={userData.online ? 'Online' : 'Offline'}
                          color={userData.online ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8b5cf6' }}>Activity</Typography>
              <Divider sx={{ mb: 2, mt: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Favorites</strong></TableCell>
                      <TableCell>{userData._count?.productFavorites ?? 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Ratings</strong></TableCell>
                      <TableCell>{userData._count?.productRatings ?? 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Companies Followed</strong></TableCell>
                      <TableCell>{userData._count?.companiesFollowed ?? 0}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>

          {/* For ADMIN users, show assigned companies */}
          {userData.role === 'ADMIN' && userData.assignedCompanies?.length > 0 && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#8b5cf6' }}>Assigned Companies</Typography>
                <Divider sx={{ mb: 2, mt: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
                {userData.assignedCompanies.map(company => (
                  <Box
                    key={company.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2, mb: 1,
                      p: 1.5, border: '1px solid #eee', borderRadius: '8px',
                      '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.04)' }
                    }}
                  >
                    <Avatar src={company.image} sx={{ width: 36, height: 36, fontSize: 14 }}>
                      {company.fullName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{company.fullName || company.companyName}</Typography>
                      <Typography variant="caption" color="text.secondary">{company.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {company.permissions?.canViews && <Chip label="View" size="small" variant="outlined" color="primary" />}
                      {company.permissions?.canEdit && <Chip label="Edit" size="small" variant="outlined" color="primary" />}
                      {company.permissions?.canAdd && <Chip label="Add" size="small" variant="outlined" color="primary" />}
                      {company.permissions?.canDelete && <Chip label="Delete" size="small" variant="outlined" color="primary" />}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </StyledCard>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
