import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import ModeratorDetailPage from './Components/Userspages/ModeratorDetailPage';
import CompanyDetailPage from './Components/Userspages/CompanyDetailPage';
import UsersDetailPage from './Components/Userspages/UsersDetailPage';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { userAPI } from '@shared/api';

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userAPI.getById(userId);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(err.response?.data?.error || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <div className="user-detail">
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mt: 2,
            color: '#8b5cf6',
            border: '1px solid #8b5cf6',
            '&:hover': {
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: '1px solid #8b5cf6',
            },
          }}
        >
          Back
        </Button>
        <Typography sx={{ mt: 2, color: 'red' }}>
          {error || 'User not found'}
        </Typography>
      </div>
    );
  }

  // Determine which component to render based on user role
  const renderUserDetail = () => {
    switch (user.role) {
      case 'ADMIN':
        return <ModeratorDetailPage userId={userId} userData={user} />;
      case 'ENTREPRISE':
        return <CompanyDetailPage userId={userId} userData={user} />;
      case 'USER':
        return <UsersDetailPage userId={userId} userData={user} />;
      case 'SUPER_ADMIN':
        return <UsersDetailPage userId={userId} userData={user} />;
      default:
        return (
          <Typography sx={{ mt: 2, color: 'red' }}>
            Unsupported user role: {user.role}
          </Typography>
        );
    }
  };

  return (
    <div className="user-detail">
      {renderUserDetail()}
    </div>
  );
}