import React from 'react'
import './Products.css'

import PurpleLine from '@components/PurpleLine'
import ProExplo from '@components/ProdAndExplo/ProExplo'
import ItemsProducts from '@components/ItemsProdcuts/ItemsProducts'
import { useActiveProducts, usePopularProducts } from '@shared/hooks/useProducts'


export default function Products() {
  const { products: activeProducts, loading: loadingActive } = useActiveProducts();
  const { products: popularProducts, loading: loadingPopular } = usePopularProducts();

  const trendyProducts = popularProducts.length > 0 ? popularProducts : activeProducts;
  return (
    <div className='ProductsPage'>
      <ProExplo 
        text={"Discover amazing deals and exclusive promotions from top brands across Algeria. Browse our curated collection of products and save big on your favorite items."} 
        title={"All Products"}
        horizontalAdId={3}
        squareAdId={4}
      />


      <ItemsProducts title={"LAST MINUTE - DERNIERE MINUTE"} Products={activeProducts} />
      <ItemsProducts title={"TRENDY PRODUCTS - PRODUITS TENDANCE"} Products={trendyProducts} />

      <div className='ClientsFeedback'>
        <h1>What our Clients Say</h1>
        <h4>Real stories from real savers</h4>

        <div className='feedback-Text'>
          <p>PromoDZ has completely changed how I shop! I've saved thousands of dinars on electronics, clothing, and everyday items. The platform is easy to use and the deals are always genuine and verified.</p>
          <h4>Ali Brahim</h4>
          <h4>Satisfied Customer Since 2024</h4>
        </div>

        
      </div>
    </div>
  )
}
