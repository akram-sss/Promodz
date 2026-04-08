import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '@shared/api';

/**
 * Normalize a backend product to the shape frontend components expect.
 * Maps API response fields to the mock-data field names used by
 * ProductCard, ItemsProducts, etc.
 */
function normalizeProduct(p) {
  // Safely extract company name — may be a string or a Prisma relation object
  const rawCompany = p.company;
  const companyStr = (typeof rawCompany === 'object' && rawCompany !== null)
    ? (rawCompany.fullName ?? rawCompany.username ?? rawCompany.name ?? '')
    : (rawCompany ?? '');
  const companyName = p.companyName ?? companyStr;
  const companyID = p.companyID ?? p.companyId ?? (typeof rawCompany === 'object' && rawCompany !== null ? rawCompany.id : '') ?? '';

  return {
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    company: companyName || companyStr,
    companyName: companyName || companyStr,
    companyID: companyID,
    // Category: ensure it's always an array of strings
    category: Array.isArray(p.category) ? p.category.map(c => typeof c === 'object' && c !== null ? c.name ?? '' : c)
      : (typeof p.category === 'object' && p.category !== null) ? [p.category.name ?? 'General']
      : p.category ? [p.category] : ['General'],
    categories: Array.isArray(p.category) ? p.category.map(c => typeof c === 'object' && c !== null ? c.name ?? '' : c)
      : (typeof p.category === 'object' && p.category !== null) ? [p.category.name ?? 'General']
      : p.category ? [p.category] : ['General'],
    price: Number(p.price ?? 0),
    discount: Number(p.discount ?? 0),
    rating: p.rating ?? p.avgRating ?? 0,
    Likes: p.Likes ?? p.likes ?? 0,
    Clicks: p.Clicks ?? p.clicks ?? 0,
    Link: p.Link ?? p.link ?? '',
    link: p.Link ?? p.link ?? '',
    images: Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : ['https://placehold.co/400x400?text=No+Image'],
    image: Array.isArray(p.images) && p.images.length > 0
      ? p.images[0]
      : 'https://placehold.co/400x400?text=No+Image',
    startDate: p.startDate ?? p.createdAt ?? '',
    endDate: p.endDate ?? p.expiresAt ?? '',
    createdAt: p.startDate ?? p.createdAt ?? '',
    // For ProductCard: `mark` = company display name
    mark: companyName || companyStr,
    // For popular products
    popularityScore: p.popularityScore ?? 0,
    avgRating: p.avgRating ?? p.rating ?? 0,
    subCategory: (typeof p.subCategory === 'object' && p.subCategory !== null) ? (p.subCategory.name ?? '') : (p.subCategory ?? ''),
  };
}

/**
 * Hook to fetch active products from the backend.
 * Returns { products, loading, error, refetch }
 */
export function useActiveProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAPI.getActive();
      setProducts((res.data ?? []).map(normalizeProduct));
    } catch (err) {
      console.error('Failed to fetch active products:', err);
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

/**
 * Hook to fetch popular products from the backend.
 */
export function usePopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAPI.getPopular();
      setProducts((res.data ?? []).map(normalizeProduct));
    } catch (err) {
      console.error('Failed to fetch popular products:', err);
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

/**
 * Hook to search products.
 * If query is null/empty but filters are provided, still fetches with filters.
 */
export function useSearchProducts(query, filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasFilters = Object.values(filters).some(v => v);

  useEffect(() => {
    if (!query && !hasFilters) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    productAPI.search(query || '', filters)
      .then((res) => {
        if (!cancelled) setProducts((res.data ?? []).map(normalizeProduct));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Search failed:', err);
          setError(err);
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query, JSON.stringify(filters)]);

  return { products, loading, error };
}

/**
 * Hook to fetch categories with subcategories.
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productAPI.getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setError(err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}

/**
 * Hook to fetch a company's public info + products.
 */
export function useCompanyPublic(companyName) {
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyName) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    productAPI.getCompanyPublic(companyName)
      .then((res) => {
        if (!cancelled) {
          const data = res.data;
          setCompany({
            id: data.id,
            name: data.name,
            username: data.username,
            handle: data.handle,
            email: data.email,
            phone: data.phone,
            city: data.city,
            country: data.country,
            followers: data.followers,
            totalProducts: data.totalProducts,
            createdAt: data.createdAt,
          });
          setProducts((data.products ?? []).map(normalizeProduct));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch company:', err);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [companyName]);

  return { company, products, loading, error };
}

/**
 * Hook to fetch personalized recommended products (authenticated users only).
 * Falls back to empty array if not authenticated or on error.
 */
export function useRecommendedProducts(enabled = true) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await productAPI.getRecommended();
      setProducts((res.data ?? []).map(normalizeProduct));
    } catch (err) {
      // 401/403 means not authenticated – that's fine, just return empty
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setProducts([]);
      } else {
        console.error('Failed to fetch recommended products:', err);
        setError(err);
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

export { normalizeProduct };
