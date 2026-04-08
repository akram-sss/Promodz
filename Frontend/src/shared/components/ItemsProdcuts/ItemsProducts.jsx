import React, { useState, useMemo } from 'react'
import PurpleLine from '../PurpleLine'

import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import Stack from '@mui/material/Stack'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import ProductCard from '../ProductCard'

import "./ItemsProducts.css"

const ITEMS_PER_PAGE = 12;

export default function ItemsProducts({ title, Products }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((Products?.length || 0) / ITEMS_PER_PAGE));

  // Reset to page 1 when Products array changes
  const productsKey = Products?.length ?? 0;
  const [prevKey, setPrevKey] = useState(productsKey);
  if (productsKey !== prevKey) {
    setPrevKey(productsKey);
    if (page > Math.ceil(productsKey / ITEMS_PER_PAGE)) setPage(1);
  }

  const paginatedProducts = useMemo(() => {
    if (!Products || Products.length === 0) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return Products.slice(start, start + ITEMS_PER_PAGE);
  }, [Products, page]);

  const handlePageChange = (_event, value) => {
    setPage(value);
    // Scroll to top of the product section smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <PurpleLine title={title} />
      <div className="items-Cards">
        {paginatedProducts.map((product, index) => (
          <ProductCard
            key={product?.id ?? index}
            product={product}
            ProdutImg={product?.image}
            ProductName={product?.name}
            mark={product?.mark}
            ProductPrice={product?.price}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              renderItem={(item) => (
                <PaginationItem
                  slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                  {...item}
                />
              )}
            />
          </Stack>
        </div>
      )}
    </div>
  )
}
