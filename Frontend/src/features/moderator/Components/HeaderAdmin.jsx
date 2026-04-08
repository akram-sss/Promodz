import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HeaderAdmin.css';
import { 
  Typography,
  Avatar
} from '@mui/material';
import Select, { selectClasses } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import defaultProfile from '@assets/profile.png';
import { styled } from '@mui/joy/styles';
import { useAuth } from '@context/AuthContext';

const HeaderContainer = styled('header')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 28px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  minHeight: '64px',
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
  '/moderator/ModeratorDashboard': 'dashboard',
  '/moderator/ModeratorProduct': 'product',
  '/moderator/ModeratorAccount': 'account',
};

const REVERSE_MAP = {
  dashboard: '/moderator/ModeratorDashboard',
  product: '/moderator/ModeratorProduct',
  account: '/moderator/ModeratorAccount',
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
          minWidth: 200,
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
            fontSize: "1.1rem",
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
        <Option value="product" sx={{ 
          fontWeight: 600, 
          fontSize: "0.9rem", 
          borderRadius: '8px',
          mb: 0.5,
          '&:hover': { backgroundColor: '#f0f0ff' },
          '&.Mui-selected': { backgroundColor: '#ede9fe', color: '#6366f1' }
        }}>
          📦 Products
        </Option>
        <Option value="account" sx={{ 
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
const HeaderModerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userData = user ? {
    username: user.username || user.fullName || 'Moderator',
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
      <SelectIndicator />
      
      <UserSection>
        <UserInfo onClick={() => navigate('/moderator/ModeratorAccount')}>
          <UserDetails>
            <UserName>{userData.username}</UserName>
            <UserRole>Moderator</UserRole>
          </UserDetails>
          <Avatar 
            src={userData.avatar} 
            alt={userData.username}
            sx={{ 
              width: 40, 
              height: 40,
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

export default HeaderModerator;