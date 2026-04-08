import React from 'react'
import './Explore.css'
import FilterComp from '@components/Filter/FilterComp'
import ProExplo from '@components/ProdAndExplo/ProExplo'
import ItemsProducts from '@components/ItemsProdcuts/ItemsProducts'
import Marques from '@components/Ads/Marques'
import { useActiveProducts } from '@shared/hooks/useProducts'


export default function Explore() {
  const [categoryFilter, setCategoryFilter] = React.useState({ mainCategory: null, subcategory: null });
  const { products: allProducts, loading } = useActiveProducts();

  const filteredProducts = React.useMemo(() => {
    const selectedSubcategory = categoryFilter?.subcategory;
    if (!selectedSubcategory) return allProducts;

    return allProducts.filter((p) => {
      const categories = p?.categories ?? p?.category ?? [];
      if (Array.isArray(categories)) return categories.includes(selectedSubcategory);
      return String(categories) === selectedSubcategory;
    });
  }, [allProducts, categoryFilter]);

  return (
    <div className='explore-page'>
      <div className='ExploreIntro'>
        <ProExplo 
          text={"Discover exclusive deals and promotions from top brands. Filter by category to find exactly what you're looking for."} 
          title={"Explore Deals"}
          horizontalAdId={1}
          squareAdId={2}
        />
      </div>

      <div className='explore-marquee'>
        <Marques/>
      </div>
    
      <div className='explore-filter-section'>
        <FilterComp value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <div className='explore-products-section'>
        <ItemsProducts title={"PRODUCTS - PRODUITS"} Products={filteredProducts} />
      </div>
    </div>
  )
}
