import React from 'react';
import AddPromotionForm from '../Components/AddPromotionForm';
import { useOutletContext } from 'react-router-dom';
import "./AddPromotionCompany.css";
import { useAuth } from '@context/AuthContext';

export const AddPromotionAdmin = () => {
  const { userId, isExpired } = useOutletContext() || {};
  const { user } = useAuth();

  if (isExpired) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6d28d9',
        background: '#f5f3ff',
        borderRadius: '12px',
        margin: '2rem',
        border: '1px solid #ddd6fe',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
        <h3 style={{ margin: '0 0 8px' }}>Subscription Expired</h3>
        <p style={{ margin: 0, color: '#555' }}>
          Your subscription has expired. You cannot add new promotions.<br />
          Please contact an administrator to renew your subscription.
        </p>
      </div>
    );
  }

  // Companies always have permission to add their own promotions
  const assignedCompany = {
    name: user?.companyName || user?.fullName || user?.username || '',
    permissions: { canEdit: true, canDelete: true, canAdd: true },
  };

  return (
    <div className="add-promotion-container">
      <AddPromotionForm 
        userId={userId} 
        assignedCompany={assignedCompany}
      />
    </div>
  );
}

export default AddPromotionAdmin;