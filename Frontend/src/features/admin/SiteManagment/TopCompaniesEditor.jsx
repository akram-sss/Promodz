import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Pencil, Plus, Trash, Link as LinkIcon } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import { topCompanyAPI, userAPI } from '@shared/api';

export default function TopCompaniesEditor() {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]); // ENTREPRISE users for dropdown
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ id: null, companyId: null, name: '', CompanyLink: '', logo: '', image: '', text: '' });

  // Fetch top companies and all ENTREPRISE users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topRes, usersRes] = await Promise.all([
          topCompanyAPI.getAll(),
          userAPI.getAll(),
        ]);
        setCompanies(topRes.data || []);
        // Filter only ENTREPRISE role users
        const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);
        setAllCompanies(users.filter(u => u.role === 'ENTREPRISE'));
      } catch (err) {
        console.error('Failed to load top companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (file, fieldName) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm(prev => ({ ...prev, [fieldName]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.CompanyLink || !form.logo || !form.image || !form.text) {
      alert('Please fill all fields including logo and promotional image');
      return;
    }
    if (!form.id && !form.companyId) {
      alert('Please select a company');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        text: form.text,
        logo: form.logo,
        image: form.image,
        companyLink: form.CompanyLink,
      };

      if (form.id) {
        // Update existing
        const res = await topCompanyAPI.update(form.id, payload);
        setCompanies(prev => prev.map(c => (c.id === form.id ? res.data : c)));
      } else {
        // Create new
        payload.companyId = form.companyId;
        const res = await topCompanyAPI.create(payload);
        setCompanies(prev => [...prev, res.data]);
      }

      setDialogOpen(false);
      setForm({ id: null, companyId: null, name: '', CompanyLink: '', logo: '', image: '', text: '' });
    } catch (err) {
      console.error('Failed to save top company:', err);
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setForm({ id: null, companyId: null, name: '', CompanyLink: '', logo: '', image: '', text: '' });
    setDialogOpen(true);
  };

  const handleEdit = (company) => {
    setForm({
      id: company.id,
      companyId: company.companyId,
      name: company.name || '',
      CompanyLink: company.CompanyLink || '',
      logo: company.logo || '',
      image: company.image || '',
      text: company.text || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this top company?')) return;
    try {
      await topCompanyAPI.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete top company:', err);
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)',
      minHeight: '100vh',
      p: 4
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        mb: 4,
        pb: 3,
        borderBottom: '2px solid #e9d5ff'
      }}>
        <Button 
          variant="contained" 
          onClick={handleAddNew}
          startIcon={<Plus size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Add New Company
        </Button>
      </Box>
      
      {companies.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">No top companies configured yet</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Click "Add New Company" to get started</Typography>
        </Box>
      )}

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }, 
        gap: 3
      }}>
        {companies.map(company => (
          <Card key={company.id} sx={{ 
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 24px rgba(139, 92, 246, 0.2)',
              '& .action-buttons': {
                opacity: 1
              }
            }
          }}>
            <Box sx={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
              {company.image ? (
                <img 
                  src={company.image} 
                  alt={company.name} 
                  style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                />
              ) : (
                <Box sx={{ height: '100%', background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>{company.name?.[0]}</Typography>
                </Box>
              )}
              <Box 
                className="action-buttons"
                sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1, opacity: 0, transition: 'opacity 0.3s ease' }}
              >
                <IconButton 
                  size="small" 
                  onClick={() => handleEdit(company)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    color: '#8b5cf6',
                    width: 36, height: 36,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': { backgroundColor: '#8b5cf6', color: 'white', transform: 'scale(1.1)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Pencil size={18} />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(company.id)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    color: '#ef4444',
                    width: 36, height: 36,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': { backgroundColor: '#ef4444', color: 'white', transform: 'scale(1.1)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Trash size={18} />
                </IconButton>
              </Box>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              {company.logo && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, p: 1, backgroundColor: '#f9fafb', borderRadius: 2, minHeight: 50 }}>
                  <img src={company.logo} alt={`${company.name} logo`} style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }} />
                </Box>
              )}
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1, fontSize: '1.25rem' }}>
                {company.name}
              </Typography>
              {company.text && (
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, lineHeight: 1.5 }}>
                  {company.text}
                </Typography>
              )}
              {company.CompanyLink && (
                <Chip
                  icon={<LinkIcon size={14} />}
                  label={company.CompanyLink.length > 30 ? company.CompanyLink.substring(0, 30) + '...' : company.CompanyLink}
                  component="a"
                  href={company.CompanyLink}
                  target="_blank"
                  clickable
                  sx={{
                    backgroundColor: '#f3e8ff',
                    color: '#8b5cf6',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    height: 32,
                    '&:hover': { backgroundColor: '#e9d5ff' },
                    '& .MuiChip-icon': { color: '#8b5cf6' }
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            minWidth: { xs: '90%', sm: '500px' },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 3
        }}>
          {form.id ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Company selector (only for new) */}
            {!form.id && (
              <Autocomplete
                options={allCompanies}
                getOptionLabel={(opt) => opt.companyName || opt.fullName || opt.email}
                value={allCompanies.find(c => c.id === form.companyId) || null}
                onChange={(_, newVal) => {
                  setForm(prev => ({
                    ...prev,
                    companyId: newVal?.id || null,
                    name: newVal?.companyName || newVal?.fullName || prev.name,
                    CompanyLink: newVal?.website || prev.CompanyLink,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Company"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#8b5cf6' },
                        '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
                    }}
                  />
                )}
              />
            )}

            <TextField
              label="Company Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#8b5cf6' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
              }}
            />
            <TextField
              label="Promotional Text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              placeholder="e.g., Up to 50% off fall deals"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#8b5cf6' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
              }}
            />
            <TextField
              label="Company Link"
              value={form.CompanyLink}
              onChange={(e) => setForm({ ...form, CompanyLink: e.target.value })}
              fullWidth
              variant="outlined"
              placeholder="https://company.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: '#8b5cf6' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
              }}
            />
            
            {/* Logo upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>Company Logo</Typography>
              <Button 
                component="label" variant="outlined" fullWidth
                sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600, borderColor: '#8b5cf6', color: '#8b5cf6', '&:hover': { borderColor: '#7c3aed', backgroundColor: '#f3e8ff' } }}
              >
                Upload Company Logo
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e.target.files?.[0], 'logo')} />
              </Button>
              <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', mt: 1, textAlign: 'center' }}>
                Recommended: 150x60px (transparent background preferred)
              </Typography>
            </Box>

            {form.logo && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '2px solid #e9d5ff', backgroundColor: '#f9fafb', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
                <img src={form.logo} alt="Logo Preview" style={{ maxWidth: '150px', maxHeight: '60px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </Box>
            )}

            {/* Promo image upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>Promotional Image</Typography>
              <Button 
                component="label" variant="outlined" fullWidth
                sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600, borderColor: '#8b5cf6', color: '#8b5cf6', '&:hover': { borderColor: '#7c3aed', backgroundColor: '#f3e8ff' } }}
              >
                Upload Promotional Image
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e.target.files?.[0], 'image')} />
              </Button>
              <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', mt: 1, textAlign: 'center' }}>
                Recommended: 500x300px or similar aspect ratio
              </Typography>
            </Box>

            {form.image && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '2px solid #e9d5ff', mt: 1 }}>
                <img src={form.image} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" fullWidth onClick={() => setDialogOpen(false)}
                sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600, borderColor: '#d1d5db', color: '#6b7280', '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' } }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" fullWidth onClick={handleSave} disabled={saving}
                sx={{
                  py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 6px 16px rgba(139, 92, 246, 0.5)' }
                }}
              >
                {saving ? 'Saving...' : form.id ? 'Save Changes' : 'Add Company'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
