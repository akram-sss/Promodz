import React, { useState, useEffect } from "react";

import CategoryCards from "../Components/cards/CategoryCards";
import { productAPI } from '@shared/api';
import { useOutletContext } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';


export default function Category() {
    const { userId, selectedCompany } = useOutletContext();
    const [cards, setCards] = useState([]);
    const [totalPromotion, setTotalPromotion] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [catRes, prodRes] = await Promise.all([
            productAPI.getCategories(),
            productAPI.getAll(),
          ]);
          const categories = catRes.data;
          let products = prodRes.data;

          // Filter by selected company if not 'all'
          if (selectedCompany && selectedCompany !== 'all') {
            products = products.filter(p => p.companyId === selectedCompany);
          }

          // Count products per category
          const categoryStats = categories.map(cat => {
            const matching = products.filter(p => p.category === cat.name);
            const subcats = (cat.subcategories || []).map(sub => ({
              name: sub.name || sub,
              count: products.filter(p => p.subCategory === (sub.name || sub)).length,
            }));
            return {
              category: cat.name,
              total: matching.length,
              subcategories: subcats,
            };
          });

          setCards(categoryStats);
          setTotalPromotion(products.length);
        } catch (err) {
          console.error('Failed to load categories:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [userId, selectedCompany]);

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      );
    }

    return (
        <div className="category-container">
            <CategoryCards categories={cards} totalPromotions={totalPromotion} />
        </div>
    );
}