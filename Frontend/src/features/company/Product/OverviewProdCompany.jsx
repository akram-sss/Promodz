import './OverviewProdCompany.css';
import ProductTable from '../Components/ProductTable';
import OverviewCards from '../Components/cards/OverviewCards';
import { companyAPI } from '@shared/api';
import { useState, useEffect } from 'react';
import { CircularProgress, Typography } from '@mui/material';

export default function OverviewProdCompany() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const permissions = { canEdit: true, canDelete: true, canAdd: true };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = (await companyAPI.getMyProducts()).data;
        const mapped = (Array.isArray(products) ? products : []).map(p => ({
          id: p.id,
          name: p.name,
          company: p.createdBy?.fullName || '',
          category: [p.category?.name, p.subCategory?.name].filter(Boolean),
          categoryId: p.categoryId,
          subCategoryId: p.subCategoryId,
          subCategoryIds: p.subCategoryIds || [],
          price: p.price,
          discount: p.discount,
          Link: p.link,
          images: p.images || [],
          rating: p.rating || 0,
          Likes: p._count?.favorites || 0,
          Clicks: p._count?.clicks || 0,
          startDate: p.startDate || p.createdAt,
          endDate: p.expiresAt,
          status: p.status,
          description: p.description,
          createdBy: p.createdBy,
        }));
        setPromotions(mapped);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="overview-container">
      <ProductTable
        allProducts={promotions} 
        setAllProducts={setPromotions} 
        permissions={permissions}
      />
    </div>
  );
}