import React from 'react';
import AddPromotionForm from '../Components/AddPromotionForm';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminAPI } from '@shared/api';
import "./AddPromotionAdmin.css";
import CircularProgress from '@mui/material/CircularProgress';

export const AddPromotionAdmin = () => {
  const { userId, selectedCompany } = useOutletContext();
  const [assignedCompany, setAssignedCompany] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const { data } = await adminAPI.getAssignedCompanies();

        if (selectedCompany === 'all') {
          // Show all companies the admin can add to
          const addable = data.filter(c => c.permissions?.canAdd).map(c => ({
            companyName: c.fullName || c.email,
            companyID: c.id,
            canAdd: true,
          }));
          setAssignedCompany(addable);
          setCanSubmit(addable.length > 0);
        } else {
          // Single company
          const company = data.find(c => c.id === selectedCompany);
          if (company && company.permissions?.canAdd) {
            setAssignedCompany({
              companyName: company.fullName || company.email,
              companyID: company.id,
              canAdd: true,
            });
            setCanSubmit(true);
          } else {
            setAssignedCompany(null);
            setCanSubmit(false);
          }
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
        setCanSubmit(false);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [userId, selectedCompany]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <div className="add-promotion-container">
        <div className="no-permission-message">
          You don't have permission to add promotions to any companies.
        </div>
      </div>
    );
  }

  return (
    <div className="add-promotion-container">
      <AddPromotionForm 
        userId={userId} 
        assignedCompany={assignedCompany}
        isAllCompanies={selectedCompany === "all"}
      />
    </div>
  );
}

export default AddPromotionAdmin;