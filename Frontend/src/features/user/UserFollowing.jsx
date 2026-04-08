import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Search, StorefrontOutlined, OpenInNew, PersonRemove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './UserFollowing.css';
import { userAPI } from '@shared/api';
import { useUserInteractions } from '@context/UserInteractionsContext';

const primaryColor = '#8b5cf6';

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: primaryColor,
  fontWeight: 700,
  letterSpacing: '0.5px',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 48,
    height: 4,
    backgroundColor: alpha(primaryColor, 0.5),
    borderRadius: 2
  }
}));

const UserFollowing = () => {
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const { setFollowing: syncFollowing } = useUserInteractions();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const data = (await userAPI.getFollowing()).data;
        setFollowedCompanies(data || []);
        setFilteredCompanies(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load followed companies');
        setSnackbarMessage('Failed to load followed companies');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        setFilteredCompanies(
          followedCompanies.filter(company =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (company.companyName && company.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        );
      } catch (err) {
        setError(err.message);
        setSnackbarMessage('Error filtering companies');
        setSnackbarOpen(true);
      }
    }
  }, [searchTerm, followedCompanies, loading]);

  const handleUnfollow = async (companyId) => {
    try {
      await userAPI.unfollowCompany(companyId);
      setFollowedCompanies(prev => prev.filter(company => company.id !== companyId));
      // Sync with global context so ProductCard and dashboard update too
      syncFollowing(companyId, false);
      setSnackbarMessage('Company unfollowed successfully');
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message);
      setSnackbarMessage('Failed to unfollow company');
      setSnackbarOpen(true);
    }
  };

  const countActivePromotions = (company) => {
    return company.activePromotions || 0;
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ 
            background: primaryColor,
            '&:hover': { background: '#7c3aed' }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  /* ──────── Mobile layout ──────── */
  if (isMobile) {
    return (
      <div className="flw-page">
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
        </Snackbar>

        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f8f6ff',
              fontSize: '0.85rem',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.3)' },
              '&.Mui-focused fieldset': { borderColor: primaryColor, borderWidth: 1.5 },
            },
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: primaryColor, fontSize: 20 }} /></InputAdornment> }}
        />

        {/* Count */}
        <span className="flw-count">{filteredCompanies.length} compan{filteredCompanies.length !== 1 ? 'ies' : 'y'}</span>

        {filteredCompanies.length === 0 ? (
          <div className="flw-empty">
            <StorefrontOutlined sx={{ fontSize: 44, color: '#c4b5fd', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: primaryColor, fontSize: '0.95rem', mb: 0.5 }}>
              {searchTerm ? 'No results' : 'No companies yet'}
            </Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.78rem' }}>
              {searchTerm ? 'Try a different search' : 'Follow companies to see them here'}
            </Typography>
          </div>
        ) : (
          <div className="flw-list">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="flw-card">
                {/* Left: Avatar */}
                <Avatar
                  src={company.image}
                  alt={company.name}
                  sx={{ width: 44, height: 44, border: '2px solid #ede5ff', background: '#faf5ff', flexShrink: 0, fontSize: 18, fontWeight: 700, color: primaryColor }}
                >
                  {(company.name || 'C')[0].toUpperCase()}
                </Avatar>

                {/* Middle: Info */}
                <div className="flw-card__body">
                  <p className="flw-card__name">{company.name || 'Unknown Company'}</p>
                  <span className="flw-card__handle">{company.handle || `@${company.username || ''}`}</span>

                  {/* Inline stat chips */}
                  <div className="flw-card__chips">
                    <span className="flw-chip">{company.followers ?? 0} followers</span>
                    <span className="flw-chip flw-chip--accent">{countActivePromotions(company)} promos</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flw-card__actions">
                  <button
                    className="flw-btn flw-btn--view"
                    onClick={() => navigate(`/products/${encodeURIComponent(company.username || company.name)}`)}
                  >
                    <OpenInNew sx={{ fontSize: 15 }} />
                    View
                  </button>
                  <button
                    className="flw-btn flw-btn--unfollow"
                    onClick={() => handleUnfollow(company.id)}
                  >
                    <PersonRemove sx={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ──────── Desktop / Tablet layout (unchanged) ──────── */
  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      background: '#ffffff',
      minHeight: '100vh',
    }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        marginTop: '20px',
        background: 'white',
        maxWidth: '1400px',
        boxShadow: 'none'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <Typography variant="h4" component="div">
            <SectionTitle variant="h4" sx={{ mt: 2 }}>Following</SectionTitle>
            <p className="dashboard-subtitle">Companies you are following in DZ Promo</p>
          </Typography>
          <Typography variant="subtitle1" sx={{ color: primaryColor, fontWeight: 600 }}>
            {followedCompanies.length} Companies
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '& fieldset': { borderColor: '#ddd' },
              '&:hover fieldset': { borderColor: primaryColor },
              '&.Mui-focused fieldset': { borderColor: primaryColor, borderWidth: '1px' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: primaryColor }} />
              </InputAdornment>
            ),
          }}
        />

        {filteredCompanies.length === 0 ? (
          <Paper sx={{ 
            p: 5, 
            textAlign: 'center',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1px solid #e5e0f5'
          }}>
            <StorefrontOutlined sx={{ fontSize: 56, color: '#c4b5fd', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: primaryColor, fontWeight: 700 }}>
              No companies found
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 14, mb: 3 }}>
              {searchTerm ? 'Try a different search term' : 'You are not following any companies yet'}
            </Typography>
            {!searchTerm && (
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #a78bfa 100%)`,
                  textTransform: 'none',
                  fontWeight: '600',
                  px: 4,
                  py: 1.2,
                  fontSize: 14,
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                  '&:hover': {
                    background: `linear-gradient(135deg, #7c3aed 0%, ${primaryColor} 100%)`,
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)'
                  }
                }}
                onClick={() => navigate('/explore')}
              >
                Explore Companies
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {filteredCompanies.map((company) => (
              <Grid item xs={12} sm={6} lg={4} key={company.id}>
                <Card className="following-card">
                  <Box className="following-card-header">
                    <Avatar 
                      src={company.image} 
                      alt={company.name}
                      sx={{ 
                        width: 52, height: 52,
                        border: '2px solid #e5e0f5',
                        background: '#faf5ff',
                        flexShrink: 0,
                        fontSize: 22,
                        fontWeight: 700,
                        color: primaryColor
                      }}
                    >
                      {(company.name || 'C')[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                        {company.name || 'Unknown Company'}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {company.handle || `@${company.username || ''}`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="following-card-stats">
                    <Box className="following-stat">
                      <span className="following-stat-value">{company.followers ?? 0}</span>
                      <span className="following-stat-label">Followers</span>
                    </Box>
                    <Box className="following-stat-divider" />
                    <Box className="following-stat">
                      <span className="following-stat-value">{countActivePromotions(company)}</span>
                      <span className="following-stat-label">Promotions</span>
                    </Box>
                  </Box>

                  <Box className="following-card-actions">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<OpenInNew sx={{ fontSize: '16px !important' }} />}
                      onClick={() => navigate(`/products/${encodeURIComponent(company.username || company.name)}`)}
                      sx={{
                        flex: 1,
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${primaryColor} 0%, #a78bfa 100%)`,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 13,
                        py: 0.8,
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                        '&:hover': {
                          background: `linear-gradient(135deg, #7c3aed 0%, ${primaryColor} 100%)`,
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }
                      }}
                    >
                      View Page
                    </Button>
                    <Button 
                      size="small"
                      variant="outlined"
                      startIcon={<PersonRemove sx={{ fontSize: '16px !important' }} />}
                      onClick={() => handleUnfollow(company.id)}
                      sx={{ 
                        borderRadius: '10px',
                        borderColor: '#fecaca',
                        color: '#ef4444',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 13,
                        py: 0.8,
                        '&:hover': { background: '#fef2f2', borderColor: '#ef4444' }
                      }}
                    >
                      Unfollow
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default UserFollowing;