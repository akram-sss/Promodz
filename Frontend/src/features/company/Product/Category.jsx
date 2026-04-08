import React, { useState, useEffect } from "react";
import CategoryCards from "../Components/cards/CategoryCards";
import { productAPI, companyAPI } from '@shared/api';
import { CircularProgress } from '@mui/material';


const getPromotionCountByCategory = (products, categories) => {
  const categoryStats = {};
  let totalPromotion = 0;

  categories.forEach(mainCategory => {
    categoryStats[mainCategory.name] = {
      total: 0,
      subcategories: {}
    };
    
    (mainCategory.subcategories || []).forEach(subcat => {
      categoryStats[mainCategory.name].subcategories[subcat] = 0;
    });
  });

  (products || []).forEach((promo) => {
    totalPromotion++;

    // Normalize product shape from API: category/subCategory can be objects or strings.
    const mainCategoryName =
      promo?.category?.name ||
      (Array.isArray(promo?.category) ? promo.category[0] : promo?.category) ||
      null;

    const subCategoryName =
      promo?.subCategory?.name ||
      (Array.isArray(promo?.category) ? promo.category[1] : null) ||
      null;

    // Primary path: count by main category directly.
    if (mainCategoryName && categoryStats[mainCategoryName]) {
      categoryStats[mainCategoryName].total++;
      if (subCategoryName && categoryStats[mainCategoryName].subcategories[subCategoryName] !== undefined) {
        categoryStats[mainCategoryName].subcategories[subCategoryName]++;
      }
      return;
    }

    // Fallback path: infer main category from known subcategory list.
    if (subCategoryName) {
      const mainCategory = categories.find((mainCat) =>
        (mainCat.subcategories || []).includes(subCategoryName)
      );
      if (mainCategory && categoryStats[mainCategory.name]) {
        categoryStats[mainCategory.name].total++;
        if (categoryStats[mainCategory.name].subcategories[subCategoryName] !== undefined) {
          categoryStats[mainCategory.name].subcategories[subCategoryName]++;
        }
      }
    }
  });

  const result = categories.map(mainCategory => {
    const stats = categoryStats[mainCategory.name] || { total: 0, subcategories: {} };
    return {
      category: mainCategory.name,
      total: stats.total,
      subcategories: (mainCategory.subcategories || []).map(subcat => ({
        name: subcat,
        count: stats.subcategories[subcat] || 0
      }))
    };
  });

  return { categoryStats: result, totalPromotion };
};


export default function Category() {
  const [cards, setCards] = useState([]);
  const [totalPromotion, setTotalPromotion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categories, products] = await Promise.all([
          productAPI.getCategories().then(r => r.data),
          companyAPI.getMyProducts().then(r => r.data),
        ]);
        const cats = Array.isArray(categories) ? categories : [];
        const prods = Array.isArray(products) ? products : [];
        const { categoryStats, totalPromotion: total } = getPromotionCountByCategory(prods, cats);
        setCards(categoryStats);
        setTotalPromotion(total);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="category-container">
      <CategoryCards categories={cards} totalPromotions={totalPromotion} />
    </div>
  );
}