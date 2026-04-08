import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HeaderUser.css';
import { 
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Select, { selectClasses } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import defaultProfile from '@assets/profile.png';
import { styled } from '@mui/joy/styles';
import { useAuth } from '@context/AuthContext';

const HeaderContainer = styled('header')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  minHeight: '56px',
  gap: '8px',
}));

const SelectWrapper = styled('div')({
  position: 'relative',
  zIndex: 1201,
});

const UserSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const UserInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '6px 12px',
  borderRadius: '12px',
  transition: 'background-color 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const UserDetails = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const UserName = styled('span')({
  fontSize: '14px',
  fontWeight: 600,
  color: '#1a1a2e',
  lineHeight: 1.3,
});

const UserRole = styled('span')({
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: 1.3,
});

const ROUTE_MAP = {
  '/user/UserDashboard': 'dashboard',
  '/user/UserFavorit': 'favorites',
  '/user/UserAccount': 'Account',
  '/user/UserFollowing': 'following',
};

const REVERSE_MAP = {
  dashboard: '/user/UserDashboard',
  favorites: '/user/UserFavorit',
  Account: '/user/UserAccount',
  following: '/user/UserFollowing',
};



const SelectIndicator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState("");

  useEffect(() => {
    const currentPath = location.pathname;
    const currentPage = ROUTE_MAP[currentPath];
    if (currentPage) {
      setPage(currentPage);
    }
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setPage(newValue);
    const newPath = REVERSE_MAP[newValue];
    if (newPath) {
      navigate(newPath);
    }
  };

  return (
    <SelectWrapper>
      <Select
        value={page}
        onChange={handleChange}
        indicator={<KeyboardArrowDownRoundedIcon />}
        sx={{
          border: "none",
          minWidth: { xs: 130, sm: 180 },
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: '#f8f9fa',
          },
          [`& .${selectClasses.indicator}`]: {
            transition: '0.2s',
            color: '#6366f1',
            [`&.${selectClasses.expanded}`]: {
              transform: 'rotate(-180deg)',
            },
          },
          [`& .${selectClasses.button}`]: {
            fontSize: { xs: "0.95rem", sm: "1.1rem" },
            fontWeight: 700,
            color: '#1a1a2e',
          },
        }}
        slotProps={{
          listbox: {
            sx: {
              zIndex: 1201,
              mt: 1,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '8px',
            },
          },
        }}
      >
        <Option value="dashboard" sx={{ 
          fontWeight: 600, 
          fontSize: "0.9rem", 
          borderRadius: '8px',
          mb: 0.5,
          '&:hover': { backgroundColor: '#f0f0ff' },
          '&.Mui-selected': { backgroundColor: '#ede9fe', color: '#6366f1' }
        }}>
          📊 Dashboard
        </Option>
        <Option value="favorites" sx={{ 
          fontWeight: 600, 
          fontSize: "0.9rem", 
          borderRadius: '8px',
          mb: 0.5,
          '&:hover': { backgroundColor: '#f0f0ff' },
          '&.Mui-selected': { backgroundColor: '#ede9fe', color: '#6366f1' }
        }}>
          ❤️ Favorites
        </Option>
        <Option value="following" sx={{ 
          fontWeight: 600, 
          fontSize: "0.9rem", 
          borderRadius: '8px',
          mb: 0.5,
          '&:hover': { backgroundColor: '#f0f0ff' },
          '&.Mui-selected': { backgroundColor: '#ede9fe', color: '#6366f1' }
        }}>
          👥 Following
        </Option>
        <Option value="Account" sx={{ 
          fontWeight: 600, 
          fontSize: "0.9rem", 
          borderRadius: '8px',
          '&:hover': { backgroundColor: '#f0f0ff' },
          '&.Mui-selected': { backgroundColor: '#ede9fe', color: '#6366f1' }
        }}>
          👤 Account
        </Option>
      </Select>
    </SelectWrapper>
  );
};
const HeaderUser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isSmallMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const userData = user ? {
    username: user.username || user.fullName || 'User',
    avatar: user.image || defaultProfile,
  } : null;

  if (!userData) {
    return (
      <HeaderContainer>
        <Typography>Loading...</Typography>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Tooltip title="Go to Home Page">
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              color: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '10px',
              width: 38,
              height: 38,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <HomeRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>
        <SelectIndicator />
      </div>
      
      <UserSection>
        <UserInfo onClick={() => navigate('/user/UserAccount')}>
          {!isSmallMobile && (
            <UserDetails>
              <UserName>{userData.username}</UserName>
              <UserRole>User</UserRole>
            </UserDetails>
          )}
          <Avatar 
            src={userData.avatar} 
            alt={userData.username}
            sx={{ 
              width: 36, 
              height: 36,
              border: '2px solid #e5e7eb',
              '& img': {
                objectFit: 'cover',
              }
            }}
          />
        </UserInfo>
      </UserSection>
    </HeaderContainer>
  );
};

export default HeaderUser;

