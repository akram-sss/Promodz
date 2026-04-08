import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from './Components/SidebarAdmin';
import Header from './Components/HeaderAdmin';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@context/AuthContext';

import './ModeratorRoute.css';

export default function ModeratorRoute() {
  const { user } = useAuth();
  const userId = user?.id;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div className="AdminRoute">
      <div className="app-site">
        <div className="sidebar-site">{!isMobile && <SidebarAdmin />}</div>
        <div className="main">
          <Header />
          <Outlet context={{ userId }} />
        </div>
      </div>
    </div>
  );
}
