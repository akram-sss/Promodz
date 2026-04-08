import './OverviewProdAdmin.css';
import ProductTable from '../Components/ProductTable';
import OverviewCards from '../Components/cards/OverviewCards';
import { productAPI, adminAPI } from '@shared/api';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export default function OverviewProdAdmin() {
  const { userId, selectedCompany } = useOutletContext();
  const [promotions, setPromotions] = useState([]);
  const [permissions, setPermissions] = useState({ canEdit: false, canDelete: false, canAdd: false });
  const [statistic, setStatistic] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch assigned companies to get actual permissions
        const companiesRes = await adminAPI.getAssignedCompanies();
        const assignedCompanies = companiesRes.data || companiesRes;
        
        const { data } = await productAPI.getAll();
        
        // Filter by selected company if not 'all'
        let filtered = data;
        if (selectedCompany && selectedCompany !== 'all') {
          filtered = data.filter(p => p.companyId === selectedCompany);
          
          // Get permissions for the selected company
          const companyAssignment = (Array.isArray(assignedCompanies) ? assignedCompanies : [])
            .find(c => c.id === selectedCompany);
          if (companyAssignment?.permissions) {
            setPermissions({
              canEdit: companyAssignment.permissions.canEdit || false,
              canDelete: companyAssignment.permissions.canDelete || false,
              canAdd: companyAssignment.permissions.canAdd || false,
            });
          } else {
            setPermissions({ canEdit: false, canDelete: false, canAdd: false });
          }
        } else {
          // When viewing all, check if moderator has any edit/delete/add permissions
          const allPerms = (Array.isArray(assignedCompanies) ? assignedCompanies : []);
          setPermissions({
            canEdit: allPerms.some(c => c.permissions?.canEdit),
            canDelete: allPerms.some(c => c.permissions?.canDelete),
            canAdd: allPerms.some(c => c.permissions?.canAdd),
          });
        }

        // Map to expected shape
        const mapped = filtered.map(p => ({
          id: p.id,
          name: p.name,
          company: p.companyName || p.company,
          category: [p.category, p.subCategory].filter(Boolean),
          categoryId: p.categoryId,
          subCategoryId: p.subCategoryId,
          subCategoryIds: p.subCategoryIds || [],
          price: p.price,
          discount: p.discount,
          Link: p.link,
          images: p.images || [],
          rating: 0,
          Likes: 0,
          Clicks: 0,
          startDate: p.startDate || p.createdAt,
          endDate: p.expiresAt,
          status: p.status,
          description: p.description,
        }));

        setPromotions(mapped);

        // Build stats cards
        const total = mapped.length;
        const active = mapped.filter(p => p.status === 'ACTIVE').length;
        const expired = mapped.filter(p => p.endDate && new Date(p.endDate) < new Date()).length;
        setStatistic([
          { title: 'Total Products', value: total, change: '' },
          { title: 'Active', value: active, change: '' },
          { title: 'Expired', value: expired, change: '' },
        ]);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [userId, selectedCompany]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="overview-container-moderator">
      {statistic?.length > 0 ? (
        <OverviewCards cards={statistic} />
      ) : (
        <div className="no-data">No statistics available</div>
      )}

      <ProductTable
        allProducts={promotions} 
        setAllProducts={setPromotions} 
        permissions={permissions}
      />
    </div>
  );
}