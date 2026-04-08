import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { purple } from '@mui/material/colors';
import { useAuth } from '@context/AuthContext';
import { authAPI } from '@shared/api';
import './PasswordResetFlow.css';

const theme = createTheme({
  palette: {
    primary: { main: '#8b5cf6' },
    secondary: purple,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

const ACCOUNT_PATH = '/company/CompanyAccount';

const PasswordResetFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.sendResetCode(email);
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    try {
      await authAPI.sendResetCode(email);
      setResendCooldown(60);
      setSuccess('A new code has been sent to your email');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    }
  }, [email, resendCooldown]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(email, otp, password);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Reset Your Password
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Enter your email address to receive a verification code
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              InputProps={{ style: { borderRadius: 12 } }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              fullWidth variant="contained" color="primary" size="large"
              type="submit" disabled={loading}
              sx={{ mt: 3, borderRadius: 12, height: 48 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Code'}
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handlePasswordSubmit}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Reset Your Password
            </Typography>
            <Typography color="text.secondary" mb={2}>
              We've sent a 6-digit code to <strong>{email}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              variant="outlined"
              margin="normal"
              type="text"
              inputProps={{ maxLength: 6 }}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              InputProps={{ style: { borderRadius: 12 } }}
            />
            <Typography variant="body2" color="text.secondary" mt={1} textAlign="right">
              Didn't receive code?{' '}
              <Button
                color="primary" size="small"
                disabled={resendCooldown > 0}
                onClick={handleResend}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
              </Button>
            </Typography>
            <TextField
              fullWidth
              label="New Password"
              variant="outlined"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{ style: { borderRadius: 12 } }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              variant="outlined"
              margin="normal"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{ style: { borderRadius: 12 } }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            <Button
              fullWidth variant="contained" color="primary" size="large"
              type="submit" disabled={loading || otp.length !== 6}
              sx={{ mt: 3, borderRadius: 12, height: 48 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </form>
        );
      case 3:
        return (
          <Box textAlign="center">
            <Box sx={{
              width: 80, height: 80, backgroundColor: 'primary.main',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', mx: 'auto', mb: 3,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Password Changed!
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Your password has been changed successfully
            </Typography>
            <Button
              fullWidth variant="contained" color="primary" size="large"
              onClick={() => navigate(ACCOUNT_PATH)}
              sx={{ mt: 3, borderRadius: 12, height: 48 }}
            >
              Back to Account
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', my: 0, py: 4,
      }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          {renderStep()}
          {step < 3 && (
            <Grid container justifyContent="center" mt={3}>
              <Grid item>
                <Typography color="text.secondary">
                  Back to
                  <Button
                    color="primary" size="small"
                    onClick={() => { step === 1 ? navigate(ACCOUNT_PATH) : setStep(1); }}
                    sx={{ textTransform: 'none' }}
                  >
                    {step === 1 ? 'Account' : 'Email entry'}
                  </Button>
                </Typography>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default PasswordResetFlow;