import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HeaderCompany.css';
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
import { subscriptionAPI } from '@shared/api';

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

const PlanBadge = styled('div')(({ planColor, planBgColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '20px',
  backgroundColor: planBgColor || '#f0f0f0',
  border: `2px solid ${planColor || '#ccc'}`,
  boxShadow: `0 2px 8px ${planColor}30`,
  transition: 'all 0.3s ease',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${planColor}40`,
  },
}));

const PlanIcon = styled('span')({
  fontSize: '16px',
  lineHeight: 1,
});

const PlanText = styled('span')(({ planColor }) => ({
  fontSize: '12px',
  fontWeight: 700,
  color: planColor || '#333',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const PlanLabel = styled('span')({
  fontSize: '10px',
  fontWeight: 500,
  color: '#6b7280',
  marginRight: '4px',
});

const ROUTE_MAP = {
  '/company/CompanyDashboard': 'dashboard',
  '/company/CompanyProduct': 'product',
  '/company/CompanyAccount': 'Account',
};

const REVERSE_MAP = {
  dashboard: '/company/CompanyDashboard',
  product: '/company/CompanyProduct',
  Account: '/company/CompanyAccount',
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
const HeaderCompany = ({ isPaused }) => {
  const { user } = useAuth();
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSub = async () => {
      try {
        const res = (await subscriptionAPI.getMySubscription()).data;
        if (res && res.subscription) {
          const sub = res.subscription;
          const planName = (sub.plan || sub.name || '').toUpperCase();
          const planConfig = {
            ENTERPRISE: { color: '#FF8C00', bgColor: '#FFFDF0', icon: '👑' },
            PREMIUM:    { color: '#A8A8A8', bgColor: '#F8F8F8', icon: '🥈' },
            BASIC:      { color: '#CD7F32', bgColor: '#FFF8F0', icon: '🥉' },
            FREE:       { color: '#6B7280', bgColor: '#F3F4F6', icon: '📦' },
          };
          const cfg = planConfig[planName] || { color: '#8B5CF6', bgColor: '#F5F0FF', icon: '📦' };
          setSubscriptionPlan({ name: sub.plan || sub.name || 'Free', ...cfg });
        }
      } catch (err) {
        // No subscription - that's ok
      }
    };
    loadSub();
  }, []);

  const userData = user ? {
    username: user.companyName || user.username || user.fullName || 'Company',
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
        {/* Paused Status Badge */}
        {isPaused && (
          <PlanBadge planColor="#ef4444" planBgColor="#fef2f2">
            <PlanIcon>🚫</PlanIcon>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <PlanLabel>Status</PlanLabel>
              <PlanText planColor="#ef4444">Paused</PlanText>
            </div>
          </PlanBadge>
        )}
        {/* Subscription Plan Badge */}
        {subscriptionPlan && (
          <PlanBadge 
            planColor={subscriptionPlan.color} 
            planBgColor={subscriptionPlan.bgColor}
          >
            <PlanIcon>{subscriptionPlan.icon}</PlanIcon>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <PlanLabel>Plan</PlanLabel>
              <PlanText planColor={subscriptionPlan.color}>
                {subscriptionPlan.name}
              </PlanText>
            </div>
          </PlanBadge>
        )}
        
        <UserInfo onClick={() => navigate('/company/CompanyAccount')}>
          <UserDetails>
            <UserName>{userData.username}</UserName>
            <UserRole>Company</UserRole>
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

export default HeaderCompany;