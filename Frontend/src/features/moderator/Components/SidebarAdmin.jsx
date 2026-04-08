
import './SidebarAdmin.css';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';

import React from 'react'
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '@context/AuthContext';
           

const SidebarAdmin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
<aside className="sidebar">
  <nav className="sidebar-nav">
    <div className="nav-item">
      <NavLink to="/" end className="home-link">
        <HomeIcon style={{ fontSize: 20 }} /> Home
      </NavLink>
    </div>
    <div className="sidebar-divider"></div>
    <div className="nav-item">
      <NavLink 
        to="ModeratorDashboard"
        className={({ isActive }) => isActive ? "active" : ""}
      >
        Dashboard
      </NavLink>
    </div>
    <div className="nav-item">
      <NavLink 
        to="ModeratorProduct"
        className={({ isActive }) => isActive ? "active" : ""}
      >
        Products
      </NavLink>
    </div>
        <div className="sidebar-footer-1">
        <NavLink 
          to="ModeratorAccount"
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Account
        </NavLink>
      </div>
      <div className="sidebar-footer-2">
        <button
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          Logout <LogoutIcon style={{ fontSize: 20, marginLeft: '5px' }} />
        </button>
      </div>
  </nav>
</aside>
  );
};
export default SidebarAdmin;