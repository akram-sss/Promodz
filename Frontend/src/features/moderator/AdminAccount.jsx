import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  TextField, 
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {Delete as DeleteIcon} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import LockIcon from '@mui/icons-material/Lock';
import { useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '@shared/api';
import { useAuth } from '@context/AuthContext';
import defaultProfile from '@assets/profile.png';

// Constants for theme colors
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#f59e0b',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  error: '#ef4444',
  success: '#10b981'
};

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: `0 4px 6px -1px ${alpha(COLORS.primary, 0.1)}, 0 2px 4px -1px ${alpha(COLORS.primary, 0.06)}`,
  maxWidth: 900,
  margin: '0 auto',
  background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
  border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
  position: 'relative',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: COLORS.primary,
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
    backgroundColor: alpha(COLORS.primary, 0.5),
    borderRadius: 2
  }
}));

const PrimaryButton = styled(Button)(() => ({
  backgroundColor: COLORS.primary,
  color: 'white',
  fontWeight: 600,
  padding: '8px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  boxShadow: `0 1px 2px 0 ${alpha(COLORS.primary, 0.5)}`,
  '&:hover': {
    backgroundColor: '#7c3aed',
    boxShadow: `0 4px 6px -1px ${alpha(COLORS.primary, 0.3)}, 0 2px 4px -1px ${alpha(COLORS.primary, 0.2)}`
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(COLORS.primary, 0.5),
    color: alpha('#fff', 0.7)
  }
}));

const SecondaryButton = styled(Button)(() => ({
  backgroundColor: 'white',
  color: COLORS.primary,
  fontWeight: 600,
  border: `2px solid ${alpha(COLORS.primary, 0.3)}`,
  padding: '8px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: alpha(COLORS.primary, 0.08),
    border: `2px solid ${alpha(COLORS.primary, 0.5)}`
  }
}));

const OutlinedButton = styled(Button)(() => ({
  color: COLORS.textPrimary,
  fontWeight: 600,
  border: `2px solid ${alpha(COLORS.textSecondary, 0.2)}`,
  padding: '8px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: alpha(COLORS.textSecondary, 0.05),
    border: `2px solid ${alpha(COLORS.textSecondary, 0.3)}`
  }
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: alpha(COLORS.textSecondary, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(COLORS.primary, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.primary,
      boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.2)}`
    },
  },
  '& .MuiInputLabel-root': {
    color: COLORS.textSecondary,
    '&.Mui-focused': {
      color: COLORS.primary,
    }
  }
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius * 3,
  zIndex: 1
}));

const AdminAccount = () => {
  const { userId } = useOutletContext();
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [emailPasswordDialog, setEmailPasswordDialog] = useState(false);
  const [emailPassword, setEmailPassword] = useState('');
  const [emailPasswordError, setEmailPasswordError] = useState('');
  const [pendingUpdateData, setPendingUpdateData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    role: ''
  });

  // Fetch user data from server
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const { data } = await userAPI.getProfile();
      const user = data.user || data;
      setOriginalData(user);
      const nameParts = (user.fullName || '').split(' ');
      setFormData({
        username: user.username || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        role: user.role || 'ADMIN'
      });
      setPreviewImage(user.image || null);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form data
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file
      if (!file.type.match('image.*')) {
        setPasswordError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setPasswordError('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    const updateData = {
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
    };
    if (previewImage && previewImage !== originalData?.image) {
      updateData.image = previewImage;
    }

    if (formData.email !== originalData?.email) {
      setPendingUpdateData(updateData);
      setEmailPassword('');
      setEmailPasswordError('');
      setEmailPasswordDialog(true);
      return;
    }

    await performSave(updateData);
  };

  const performSave = async (updateData) => {
    setIsLoading(true);
    try {
      await userAPI.updateProfile(updateData);
      updateUser(updateData);
      setEditMode(false);
      setProfileImage(null);
      setSuccess('Profile updated successfully!');
      await fetchUserData();
    } catch (error) {
      console.error('Failed to save data:', error);
      const msg = error.response?.data?.error || 'Failed to save changes. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordConfirm = async () => {
    if (!emailPassword.trim()) {
      setEmailPasswordError('Password is required');
      return;
    }
    setEmailPasswordDialog(false);
    const dataWithPassword = { ...pendingUpdateData, currentPassword: emailPassword };
    setPendingUpdateData(null);
    setEmailPassword('');
    await performSave(dataWithPassword);
  };

  const handleCancel = () => {
    // Reset to original data
    if (originalData) {
      const nameParts = (originalData.fullName || '').split(' ');
      setFormData({
        username: originalData.username || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: originalData.email || '',
        phone: originalData.phoneNumber || '',
        address: originalData.address || '',
        city: originalData.city || '',
        postalCode: originalData.postalCode || '',
        role: originalData.role || 'ADMIN'
      });
      setPreviewImage(originalData.image || null);
    }
    setProfileImage(null);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
    setFormErrors({});
    setEditMode(false);
  };

  const handleDelete = async () => {
    const password = window.prompt('Please enter your password to confirm account deletion:');
    if (!password) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      await userAPI.deleteAccount(password);
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Delete failed:', error);
      setError(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Password validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    // Check if new password is different from old
    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from old password');
      return;
    }

    setIsLoading(true);
    try {
      await userAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setPasswordSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Password change failed:', error);
      const msg = error.response?.data?.error || 'Failed to change password. Please try again.';
      setPasswordError(msg);
    } finally {
      setIsLoading(false);
    }
  };
const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
};
  // Helper function to get initials for avatar
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '';
    return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  return (
    <Box sx={{ padding: isMobile ? 2 : 4 }}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
          </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {success}
          </Alert>
      </Snackbar>
      <StyledPaper elevation={0}>
        {isLoading && (
          <LoadingOverlay>
            <CircularProgress size={60} sx={{ color: COLORS.primary }} />
          </LoadingOverlay>
        )}
        
        {/* Profile Header Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          mb: 4
        }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar
              src={previewImage || defaultProfile}
              sx={{ 
                width: 120, 
                height: 120,
                fontSize: '3rem',
                backgroundColor: alpha(COLORS.primary, 0.1),
                color: COLORS.primary,
                border: `3px solid ${alpha(COLORS.primary, 0.3)}`
              }}
            >
              {getInitials(formData.firstName, formData.lastName)}
            </Avatar>
            {editMode && (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: `2px solid ${alpha(COLORS.primary, 0.3)}`,
                      '&:hover': {
                        backgroundColor: alpha(COLORS.primary, 0.1)
                      }
                    }}
                  >
                    <AddAPhotoIcon sx={{ color: COLORS.primary }} />
                  </IconButton>
                </label>
              </>
            )}
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
            {formData.firstName} {formData.lastName}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: COLORS.textSecondary, mb: 1 }}>
            @{formData.username}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mt: 1,
            backgroundColor: alpha(COLORS.primary, 0.05),
            padding: '8px 16px',
            borderRadius: '12px',
            border: `1px solid ${alpha(COLORS.primary, 0.1)}`
          }}>
            <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>
              <strong style={{ color: COLORS.primary }}>{formData.role}</strong> 
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: alpha(COLORS.textSecondary, 0.1) }} />
        
        <SectionTitle variant="h5">Account Information</SectionTitle>
        
        <StyledTextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true, // Username shouldn't be editable
          }}
          sx={{ mb: 3 }}
        />
        
        {/* Change Password Section - Only visible in edit mode */}
        {editMode && (
          <Box sx={{ 
            mb: 4,
            backgroundColor: alpha(COLORS.primary, 0.03),
            borderRadius: '16px',
            padding: '16px',
            border: `1px solid ${alpha(COLORS.primary, 0.1)}`
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              padding: '8px 12px',
              backgroundColor: alpha(COLORS.primary, 0.1),
              borderRadius: '12px',
              width: 'fit-content'
            }}>
              <LockIcon sx={{ mr: 1, color: COLORS.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary }}>
                Change Password
              </Typography>
            </Box>
            
            <Box 
              component="form" 
              onSubmit={handlePasswordSubmit} 
              sx={{ 
                mt: 2,
              }}
            >
              {passwordError && (
                <Alert severity="error" sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  backgroundColor: alpha(COLORS.error, 0.1),
                  color: COLORS.error
                }}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  backgroundColor: alpha(COLORS.success, 0.1),
                  color: COLORS.success
                }}>
                  {passwordSuccess}
                </Alert>
              )}
              <StyledTextField
                label="Current Password"
                name="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                required
              />
              <StyledTextField
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                required
              />
              <StyledTextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                required
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <PrimaryButton 
                  onClick={()=> navigate('/moderator/PasswordReset')}
                >
                  Forget Password ?
                </PrimaryButton>
                <PrimaryButton 
                  type="submit"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </PrimaryButton>
              </Box>
            </Box>
          </Box>
        )}
        
        <Divider sx={{ my: 3, borderColor: alpha(COLORS.textSecondary, 0.1) }} />
        
        <SectionTitle variant="h5">Contact Information</SectionTitle>
        
        <Grid container spacing={2}>
          <Grid item sx={{width: '100%'}}>
            <StyledTextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              InputProps={{
                readOnly: !editMode,
              }}
            />
          </Grid>
          <Grid item sx={{width: '100%'}}>
            <StyledTextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              InputProps={{
                readOnly: !editMode,
              }}
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item sx={{width: '100%'}}>
            <StyledTextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                readOnly: !editMode,
              }}
            />
          </Grid>
          <Grid sx={{width: '100%'}}>
            <StyledTextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              InputProps={{
                readOnly: !editMode,
              }}
            />
          </Grid>
        </Grid>
        
        <StyledTextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!formErrors.address}
          helperText={formErrors.address}
          InputProps={{
            readOnly: !editMode,
          }}
          sx={{ mt: 2 }}
        />
        
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item sx={{width: '100%'}}>
            <StyledTextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!formErrors.city}
              helperText={formErrors.city}
              InputProps={{
                readOnly: !editMode,
              }}
            />
          </Grid>
          <Grid item sx={{width: '100%'}}>
            <StyledTextField
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!formErrors.postalCode}
              helperText={formErrors.postalCode}
              InputProps={{
                readOnly: !editMode,
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 2,
          mt: 4,
          gap: 2
        }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
        >
            Delete Acount
        </Button>
          {!editMode ? (
            <SecondaryButton 
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              disabled={isLoading}
            >
              Edit Profile
            </SecondaryButton>
          ) : (
            <>
              <OutlinedButton 
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </OutlinedButton>
              <PrimaryButton 
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </>
          )}
        </Box>
      </StyledPaper>

      <Dialog open={emailPasswordDialog} onClose={() => setEmailPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: COLORS.primary, fontWeight: 'bold' }}>Confirm Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please enter your current password to change your email address.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Current Password"
            value={emailPassword}
            onChange={(e) => { setEmailPassword(e.target.value); setEmailPasswordError(''); }}
            error={!!emailPasswordError}
            helperText={emailPasswordError}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailPasswordConfirm()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailPasswordConfirm}
            sx={{ backgroundColor: COLORS.primary, '&:hover': { opacity: 0.9 } }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAccount;