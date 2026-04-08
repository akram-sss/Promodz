import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '@shared/api';

const UserInteractionsContext = createContext(null);

/**
 * Provides sets of favorited product IDs and followed company IDs
 * so any ProductCard can check its initial liked/followed state.
 * Also exposes toggle helpers that keep the sets in sync.
 */
export function UserInteractionsProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // Sets of IDs the current user has interacted with
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  // Fetch favorites + following once when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFollowingIds(new Set());
      setLoaded(false);
      return;
    }

    let cancelled = false;

    const fetchInteractions = async () => {
      try {
        const [favRes, followRes] = await Promise.all([
          userAPI.getFavorites(),
          userAPI.getFollowing(),
        ]);

        if (cancelled) return;

        // favRes.data is an array of products — each has .id
        const favIds = new Set(
          (favRes.data ?? favRes ?? []).map((p) => p.id).filter(Boolean)
        );

        // followRes.data is an array of companies — each has .id
        const followIds = new Set(
          (followRes.data ?? followRes ?? []).map((c) => c.id).filter(Boolean)
        );

        setFavoriteIds(favIds);
        setFollowingIds(followIds);
      } catch (err) {
        console.error('Failed to fetch user interactions:', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    fetchInteractions();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  /**
   * Check if a product is in the user's favorites
   */
  const isFavorite = useCallback(
    (productId) => favoriteIds.has(productId),
    [favoriteIds]
  );

  /**
   * Check if a company is followed by the user
   */
  const isFollowingCompany = useCallback(
    (companyId) => followingIds.has(companyId),
    [followingIds]
  );

  /**
   * Toggle favorite locally (after the API call succeeds in ProductCard).
   * This keeps all cards showing the same product in sync.
   */
  const setFavorite = useCallback((productId, liked) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (liked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  /**
   * Toggle follow locally (after the API call succeeds in ProductCard).
   * This keeps all cards showing the same company in sync.
   */
  const setFollowing = useCallback((companyId, following) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (following) next.add(companyId);
      else next.delete(companyId);
      return next;
    });
  }, []);

  /**
   * Force-refresh interactions (e.g. after bulk changes)
   */
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [favRes, followRes] = await Promise.all([
        userAPI.getFavorites(),
        userAPI.getFollowing(),
      ]);
      setFavoriteIds(new Set((favRes.data ?? favRes ?? []).map((p) => p.id).filter(Boolean)));
      setFollowingIds(new Set((followRes.data ?? followRes ?? []).map((c) => c.id).filter(Boolean)));
    } catch (err) {
      console.error('Failed to refresh user interactions:', err);
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      favoriteIds,
      followingIds,
      loaded,
      isFavorite,
      isFollowingCompany,
      setFavorite,
      setFollowing,
      refresh,
    }),
    [favoriteIds, followingIds, loaded, isFavorite, isFollowingCompany, setFavorite, setFollowing, refresh]
  );

  return (
    <UserInteractionsContext.Provider value={value}>
      {children}
    </UserInteractionsContext.Provider>
  );
}

export function useUserInteractions() {
  const context = useContext(UserInteractionsContext);
  if (!context) {
    throw new Error('useUserInteractions must be used within a UserInteractionsProvider');
  }
  return context;
}

export default UserInteractionsContext;
