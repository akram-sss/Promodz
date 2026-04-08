import './OverviewProdAdmin.css';
import ProductTable from '../Components/ProductTable';
import OverviewCards from '../Components/cards/OverviewCards';
import { companyAPI, productAPI } from '@shared/api';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';

export default function OverviewProdAdmin() {
  const { userId, selectedCompany } = useOutletContext();
  const [promotions, setPromotions] = useState([]);
  const [permissions] = useState({ canEdit: true, canDelete: true, canAdd: true });
  const [statistic, setStatistic] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products (admin has access)
        const products = (await productAPI.getAll()).data;
        let prods = Array.isArray(products) ? products : [];

        // Filter by selected company if not 'all'
        if (selectedCompany && selectedCompany !== 'all') {
          prods = prods.filter(p => p.companyId === selectedCompany);
        }

        const mapped = prods.map(p => ({
          id: p.id,
          name: p.name,
          company: (typeof p.company === 'string' ? p.company : p.company?.fullName) || p.companyName || p.createdBy?.fullName || '',
          category: Array.isArray(p.category) ? p.category : [p.category, p.subCategory].filter(Boolean),
          categoryId: p.categoryId,
          subCategoryId: p.subCategoryId,
          subCategoryIds: p.subCategoryIds || [],
          price: p.price,
          discount: p.discount,
          Link: p.link,
          images: p.images || [],
          rating: p.rating || 0,
          Likes: p.favorites || p.likes || 0,
          Clicks: p.clicks || 0,
          startDate: p.startDate || p.createdAt,
          endDate: p.expiresAt,
          status: p.status,
          description: p.description,
          createdBy: p.createdBy,
        }));
        setPromotions(mapped);

        const active = prods.filter(p => p.status === 'ACTIVE' || !p.status).length;
        const expired = prods.filter(p => p.status === 'EXPIRED').length;
        setStatistic([
          { title: 'Total Products', value: prods.length, change: 'All promotions' },
          { title: 'Active', value: active, change: 'Currently live' },
          { title: 'Expired', value: expired, change: 'Past promotions' },
        ]);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCompany]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="overview-container">
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