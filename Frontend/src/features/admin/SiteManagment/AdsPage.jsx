import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adAPI } from '@shared/api';

const AD_PLACEMENTS = {
  1: { location: 'Explore Page - Sidebar Top', page: 'Explore', type: 'Horizontal Banner' },
  2: { location: 'Explore Page - Sidebar Square', page: 'Explore', type: 'Square Banner (240x240px)' },
  3: { location: 'Product Pages - Horizontal Banner', page: 'Products', type: 'Horizontal Banner (500x120px)' },
  4: { location: 'Product Pages - Square Banner', page: 'Products', type: 'Square Banner (240x240px)' },
  5: { location: 'Home Page - Featured Ad 1', page: 'Home', type: 'Tall Banner' },
  6: { location: 'Home Page - Featured Ad 2', page: 'Home', type: 'Tall Banner' },
  7: { location: 'Category Page - Horizontal Banner', page: 'Category', type: 'Horizontal Banner' },
  8: { location: 'Category Page - Square Banner', page: 'Category', type: 'Square Banner (240x240px)' },
};

/** Convert a File to a base64 data URL */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingSlot, setSavingSlot] = useState(null);
  const [notification, setNotification] = useState({ open: false, type: '', message: '' });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = (await adAPI.getAllManagement()).data;
      const adsData = res.ads || res || [];
      // Map to 8 slots using position field
      const mapped = Array.from({ length: 8 }, (_, i) => {
        const slot = String(i + 1);
        const existing = adsData.find(a => String(a.position) === slot);
        return existing
          ? {
              slotId: i + 1,
              realId: existing.id,
              image: existing.imageUrl || '',
              link: existing.link || '',
              isActive: existing.isActive,
              clicks: existing.clicks || 0,
              impressions: existing.impressions || 0,
            }
          : { slotId: i + 1, image: '', link: '', realId: null, isActive: true, clicks: 0, impressions: 0 };
      });
      setAds(mapped);
    } catch (error) {
      console.error('Failed to load ads:', error);
      setAds(Array.from({ length: 8 }, (_, i) => ({ slotId: i + 1, image: '', link: '', realId: null, isActive: true, clicks: 0, impressions: 0 })));
      setNotification({ open: true, type: 'error', message: 'Failed to load ads.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleImageChange = async (index, file) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const updatedAds = [...ads];
      updatedAds[index].image = base64;
      updatedAds[index]._dirty = true;
      setAds(updatedAds);
    } catch {
      setNotification({ open: true, type: 'error', message: 'Failed to read image file.' });
    }
  };

  const handleLinkChange = (index, value) => {
    const updatedAds = [...ads];
    updatedAds[index].link = value;
    setAds(updatedAds);
  };

  const handleSave = async (index) => {
    const ad = ads[index];
    if (!ad.image) {
      setNotification({ open: true, type: 'error', message: 'Please upload an image first.' });
      return;
    }
    try {
      setSavingSlot(ad.slotId);

      const payload = {
        position: String(ad.slotId),
        link: ad.link || '',
        imageUrl: ad.image,
        title: `Ad Slot ${ad.slotId}`,
      };

      if (ad.realId) {
        await adAPI.update(ad.realId, payload);
      } else {
        await adAPI.create(payload);
      }

      setNotification({ open: true, type: 'success', message: `Ad slot #${ad.slotId} saved successfully.` });
      await fetchAds();
    } catch (error) {
      console.error(`Failed to save Ad slot #${ad.slotId}:`, error);
      setNotification({ open: true, type: 'error', message: error.response?.data?.error || `Failed to save Ad slot #${ad.slotId}.` });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleDelete = async (index) => {
    const ad = ads[index];
    if (!ad.realId) return;
    if (!window.confirm(`Delete ad in slot #${ad.slotId}?`)) return;
    try {
      setSavingSlot(ad.slotId);
      await adAPI.delete(ad.realId);
      setNotification({ open: true, type: 'success', message: `Ad slot #${ad.slotId} deleted.` });
      await fetchAds();
    } catch (error) {
      setNotification({ open: true, type: 'error', message: `Failed to delete ad slot #${ad.slotId}.` });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleToggle = async (index) => {
    const ad = ads[index];
    if (!ad.realId) return;
    try {
      setSavingSlot(ad.slotId);
      await adAPI.toggleStatus(ad.realId);
      setNotification({ open: true, type: 'success', message: `Ad slot #${ad.slotId} ${ad.isActive ? 'deactivated' : 'activated'}.` });
      await fetchAds();
    } catch (error) {
      setNotification({ open: true, type: 'error', message: `Failed to toggle ad slot #${ad.slotId}.` });
    } finally {
      setSavingSlot(null);
    }
  };

  return (
    <Box p={4} sx={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#7c3aed', fontWeight: 700 }}>
          Manage Advertisement Banners
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
          Upload and manage ads that appear across different pages of your site.
          Each slot maps to a specific location on the frontend.
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress sx={{ color: '#7c3aed' }} />
        </Box>
      )}

      <Grid container spacing={3}>
        {ads.map((ad, index) => {
          const placement = AD_PLACEMENTS[ad.slotId] || { location: `Ad Slot ${ad.slotId}`, page: 'Unknown', type: 'Standard' };
          const isSaving = savingSlot === ad.slotId;

          return (
            <Grid item xs={12} md={6} lg={4} key={ad.slotId}>
              <Card sx={{
                border: ad.realId ? '2px solid #e9d5ff' : '2px dashed #d1d5db',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                opacity: ad.isActive === false ? 0.6 : 1,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(124, 58, 237, 0.15)',
                  borderColor: '#c084fc'
                }
              }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={ad.image || 'https://via.placeholder.com/400x180/f5f3ff/7c3aed?text=Upload+Ad+Image'}
                    alt={`Ad Slot ${ad.slotId}`}
                    sx={{ objectFit: 'cover', backgroundColor: '#f5f3ff' }}
                  />
                  <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                    <Chip
                      label={placement.page}
                      size="small"
                      sx={{ backgroundColor: '#7c3aed', color: 'white', fontWeight: 600 }}
                    />
                    {ad.realId && (
                      <Chip
                        label={ad.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          backgroundColor: ad.isActive ? '#059669' : '#6b7280',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleToggle(index)}
                      />
                    )}
                  </Box>
                </Box>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: '#7c3aed', fontWeight: 600, mb: 0.5 }}>
                        Slot #{ad.slotId}
                      </Typography>
                      {ad.realId && (
                        <Tooltip title="Delete ad">
                          <IconButton size="small" color="error" onClick={() => handleDelete(index)} disabled={isSaving}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500, mb: 0.5 }}>
                      {placement.location}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {placement.type}
                    </Typography>
                    {ad.realId && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', mt: 0.5 }}>
                        {ad.clicks} clicks &middot; {ad.impressions} impressions
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label="Ad Destination URL"
                    placeholder="https://example.com"
                    value={ad.link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    size="small"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#a78bfa' },
                        '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
                      },
                    }}
                  />

                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                      mb: 1.5,
                      borderColor: '#a78bfa',
                      color: '#7c3aed',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' }
                    }}
                  >
                    Upload New Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files[0]) handleImageChange(index, e.target.files[0]);
                      }}
                    />
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      fontWeight: 600,
                      py: 1.2,
                      '&:hover': { backgroundColor: '#6d28d9' },
                      '&:disabled': { backgroundColor: '#c4b5fd' }
                    }}
                    onClick={() => handleSave(index)}
                    disabled={isSaving}
                  >
                    {isSaving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type || 'info'}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdsPage;
