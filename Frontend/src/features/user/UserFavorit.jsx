import React, { useState, useEffect } from 'react';
import { Typography, styled, CircularProgress, Box, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ProductTable from './Components/ProductTable';
import './UserFavorit.css';
import { userAPI } from '@shared/api';

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

export default function UserFavorit() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = (await userAPI.getFavorites()).data;
        const withLiked = (data || []).map(p => ({ ...p, isLiked: true }));
        setFavorites(withLiked);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'fav-page-mobile' : 'overview-container'}>
      {!isMobile && (
        <>
          <SectionTitle variant="h4" sx={{ mt: 2, fontSize: { xs: '1.4rem', md: '2rem' } }}>Favorites</SectionTitle>
          <p className="dashboard-subtitle">your favorite promotions on DZ Promo</p>
        </>
      )}
      <ProductTable
        allProducts={favorites}
        setAllProducts={setFavorites}
      />
    </div>
  );
}