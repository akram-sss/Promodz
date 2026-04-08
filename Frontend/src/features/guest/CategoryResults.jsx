import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

import ProExplo from '@components/ProdAndExplo/ProExplo';
import ItemsProducts from '@components/ItemsProdcuts/ItemsProducts';
import { useSearchProducts, useCategories } from '@shared/hooks/useProducts';

export default function CategoryResults() {
  const params = useParams();
  const location = useLocation();
  const { categories } = useCategories();

  // Detect whether we arrived via /categories/:category (main) or /category/:subcategory (sub)
  const isMainCategory = location.pathname.startsWith('/categories/');

  const categoryName = isMainCategory
    ? decodeURIComponent(params?.category ?? '').trim()
    : '';
  const subcategoryName = !isMainCategory
    ? decodeURIComponent(params?.subcategory ?? '').trim()
    : '';

  // Build the right filter for the API
  const filters = React.useMemo(() => {
    if (isMainCategory && categoryName) return { category: categoryName };
    if (!isMainCategory && subcategoryName) return { subcategory: subcategoryName };
    return {};
  }, [isMainCategory, categoryName, subcategoryName]);

  const hasFilter = categoryName || subcategoryName;
  const { products, loading } = useSearchProducts(null, hasFilter ? filters : {});

  const filteredProducts = React.useMemo(() => {
    if (!hasFilter || products.length > 0) return products;
    return [];
  }, [products, hasFilter]);

  // Resolve the parent main-category when viewing a subcategory
  const parentCategory = React.useMemo(() => {
    if (isMainCategory) return categoryName;
    const match = categories.find(
      (c) => Array.isArray(c?.subcategories) && c.subcategories.includes(subcategoryName)
    );
    return match?.name ?? '';
  }, [categories, subcategoryName, isMainCategory, categoryName]);

  const displayName = isMainCategory ? categoryName : subcategoryName;
  const titleText = isMainCategory
    ? categoryName
    : parentCategory
      ? `${parentCategory} • ${subcategoryName}`
      : subcategoryName;
  const subtitleText = isMainCategory
    ? `Showing all products in: ${categoryName}`
    : parentCategory
      ? `Showing products in: ${parentCategory} → ${subcategoryName}`
      : `Showing products in: ${subcategoryName}`;

  return (
    <div>
      <ProExplo
        title={displayName ? titleText : 'Category'}
        text={displayName ? subtitleText : 'Pick a category to see results.'}
        horizontalAdId={7}
        squareAdId={8}
      />
      <ItemsProducts
        title={displayName ? (isMainCategory ? categoryName.toUpperCase() : (parentCategory ? `${parentCategory.toUpperCase()} - ${subcategoryName.toUpperCase()}` : subcategoryName.toUpperCase())) : 'CATEGORY'}
        Products={filteredProducts}
      />
    </div>
  );
}
