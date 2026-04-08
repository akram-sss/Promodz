import React from 'react';
import AddPromotionForm from '../Components/AddPromotionForm';
import { useOutletContext } from 'react-router-dom';
import "./AddPromotionCompany.css";
import { useAuth } from '@context/AuthContext';

export const AddPromotionAdmin = () => {
  const { userId } = useOutletContext();
  const { user } = useAuth();

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