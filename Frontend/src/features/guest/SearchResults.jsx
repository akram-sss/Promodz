import React from 'react';
import { useParams } from 'react-router-dom';
import PurpleLine from '@components/PurpleLine';
import ItemsProducts from '@components/ItemsProdcuts/ItemsProducts';
import { useSearchProducts } from '@shared/hooks/useProducts';

export default function SearchResults() {
  const { query } = useParams();
  const { products: filteredProducts, loading, error } = useSearchProducts(query);

  return (
    <div>
      <br />
      {filteredProducts.length > 0 ? (
        <section className="products-section">
          <ItemsProducts title={`${filteredProducts.length} results for "${query}"`} Products={filteredProducts} />
        </section>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
          {loading ? 'Searching...' : `No products found for "${query}".`}
        </div>
      )}
    </div>
  );
}