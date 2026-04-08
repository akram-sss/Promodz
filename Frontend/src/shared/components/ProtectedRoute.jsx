import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

/**
 * Protects a route by requiring authentication and optionally specific roles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} [props.allowedRoles] - Optional list of roles allowed (e.g. ['ADMIN', 'SUPER_ADMIN'])
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" style={{
          width: 40,
          height: 40,
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, save the attempted URL
    return <Navigate to="/connection" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // User is logged in but doesn't have permission — redirect to their dashboard
    const roleRedirects = {
      SUPER_ADMIN: '/admin',
      ADMIN: '/moderator',
      ENTREPRISE: '/company',
      USER: '/user',
    };
    const redirectTo = roleRedirects[role] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
