import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarCompany from './Components/SidebarCompany';
import Header from './Components/HeaderCompany';
import "./CompanyRoute.css";
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@context/AuthContext';
import { subscriptionAPI } from '@shared/api';

export default function CompanyRoute() {

  const { user } = useAuth();
  const userId = user?.id;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isPaused, setIsPaused] = useState(false);

    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
      const checkPause = async () => {
        try {
          const res = (await subscriptionAPI.getMySubscription()).data;
          const status = res?.subscription?.status;
          setIsPaused(status === 'CANCELLED');
          // Use the backend's computed isExpired flag (checks actual endDate)
          setIsExpired(res?.isExpired === true && status !== 'CANCELLED');
        } catch { /* ignore */ }
      };
      checkPause();
    }, []);
  
  return (
    <div className='CompanyRoute'>
      <div className="app-site">
        <div className="sidebar-site">
          {!isMobile && <SidebarCompany />}
        </div>
        <div className="main">
          <Header isPaused={isPaused} />
          {isPaused && (
            <div style={{
              background: 'linear-gradient(90deg, #ff4d4f 0%, #ff7a45 100%)',
              color: '#fff',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '0.3px',
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span>Your company account is currently <strong>paused</strong> by an administrator. You cannot add, edit, or delete promotions until it is reactivated.</span>
            </div>
          )}
          {isExpired && (
            <div style={{
              background: 'linear-gradient(90deg, #6d28d9 0%, #a855f7 100%)',
              color: '#fff',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '0.3px',
            }}>
              <span style={{ fontSize: '20px' }}>🔒</span>
              <span>Your subscription has <strong>expired</strong>. You can view your promotions but cannot add, edit, or delete them. Please contact an administrator to renew.</span>
            </div>
          )}
          <Outlet context={{ userId, isPaused, isExpired }} />
        </div>
      </div>
    </div>
  );
}