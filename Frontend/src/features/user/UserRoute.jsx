import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarUser from './Components/SidebarUser';
import Header from './Components/HeaderUser';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@context/AuthContext';
// import CompanyPage from './CompanyPage';
import "./UserRoute.css";
export default function UserRoute() {
    const { user } = useAuth();
    const userId = user?.id;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <div className='UserRoute'>
      <div className="app-site">
        <div className="sidebar-site">{!isMobile && <SidebarUser />}</div>
        <div className="main">
          <Header />
          <Outlet context={{ userId }} />
        </div>
      </div>
    </div>
  );
}