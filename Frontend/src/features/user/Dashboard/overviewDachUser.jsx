import React, { useState, useEffect, useMemo } from 'react';
import './OverviewDachUser.css';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Typography, CircularProgress } from '@mui/material';
import { userAPI } from '@shared/api';
import { useUserInteractions } from '@context/UserInteractionsContext';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';

const CATEGORY_COLORS = ['#8B5CF6', '#6C28D9', '#4F46E5', '#7C3AED', '#9333EA', '#A855F7'];
const STORE_COLORS = ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, subtitle, accent }) => (
  <div className="udash-stat-card" style={{ '--accent': accent }}>
    <div className="udash-stat-icon">{icon}</div>
    <div className="udash-stat-body">
      <span className="udash-stat-label">{label}</span>
      <span className="udash-stat-value">{value}</span>
      <span className="udash-stat-sub">{subtitle}</span>
    </div>
  </div>
);

/* ── Reusable Donut Chart ── */
const DonutChart = ({ title, subtitle, data, colors, valueLabel = '' }) => {
  const hasData = data && data.length > 0;
  const total = hasData ? data.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <div className="udash-chart-card">
      <div className="udash-chart-header">
        <h3 className="udash-chart-title">{title}</h3>
        <span className="udash-chart-subtitle">{subtitle}</span>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              label={({ percent, cx, x }) => (
                <text
                  x={x}
                  textAnchor={x > cx ? 'start' : 'end'}
                  fill="#374151"
                  fontSize={11}
                  fontWeight={600}
                  dominantBaseline="central"
                >
                  {(percent * 100).toFixed(0)}%
                </text>
              )}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                return (
                  <div className="udash-tooltip">
                    <span className="udash-tooltip-name">{d.name}</span>
                    <span className="udash-tooltip-val">
                      {d.value} {valueLabel} · {pct}%
                    </span>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value, entry) => (
                <span style={{ color: '#374151', fontSize: 12, fontWeight: 500 }}>
                  {entry.payload.name} ({entry.payload.value})
                </span>
              )}
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="udash-chart-empty">
          <Typography variant="body2" color="textSecondary">
            No data available yet
          </Typography>
        </div>
      )}
    </div>
  );
};

/* ── Expiring Soon List ── */
const ExpiringSoonList = ({ items }) => {
  if (!items.length) {
    return (
      <div className="udash-chart-card">
        <div className="udash-chart-header">
          <h3 className="udash-chart-title">Expiring Soon</h3>
          <span className="udash-chart-subtitle">No deals expiring in the next 3 days</span>
        </div>
        <div className="udash-chart-empty">
          <Typography variant="body2" color="textSecondary">
            All your saved deals have plenty of time left!
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="udash-chart-card">
      <div className="udash-chart-header">
        <h3 className="udash-chart-title">Expiring Soon</h3>
        <span className="udash-chart-subtitle">{items.length} deal{items.length > 1 ? 's' : ''} ending within 3 days</span>
      </div>
      <ul className="udash-expiring-list">
        {items.map((item, i) => (
          <li key={i} className="udash-expiring-item">
            <div className="udash-expiring-info">
              <span className="udash-expiring-name">{item.name}</span>
              <span className="udash-expiring-store">{item.company}</span>
            </div>
            <div className="udash-expiring-meta">
              {item.discount > 0 && <span className="udash-expiring-discount">-{item.discount}%</span>}
              <span className={`udash-expiring-time ${item.hoursLeft <= 24 ? 'urgent' : ''}`}>
                {item.hoursLeft <= 24 ? `${item.hoursLeft}h left` : `${Math.ceil(item.hoursLeft / 24)}d left`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function OverviewDachUser() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profile, setProfile] = useState(null);
  const { favoriteIds, followingIds } = useUserInteractions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, favRes, followRes] = await Promise.all([
          userAPI.getProfile().then((r) => r.data),
          userAPI.getFavorites().then((r) => r.data).catch(() => []),
          userAPI.getFollowing().then((r) => r.data).catch(() => []),
        ]);
        setProfile(profileRes);
        setFavorites(favRes || []);
        setFollowing(followRes || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [favoriteIds, followingIds]);

  // Computed stats
  const stats = useMemo(() => {
    const counts = profile?._count || {};
    const favCount = favoriteIds.size || counts.productFavorites || 0;
    const followCount = followingIds.size || counts.companiesFollowed || 0;

    // Best discount from favorites
    const bestDiscount = favorites.reduce((max, p) => Math.max(max, p.discount || 0), 0);

    // Expiring within 3 days
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const expiringSoon = favorites
      .filter((p) => {
        if (!p.endDate) return false;
        const remaining = new Date(p.endDate).getTime() - now;
        return remaining > 0 && remaining <= threeDaysMs;
      })
      .map((p) => ({
        name: p.name,
        company: p.company || 'Unknown',
        discount: p.discount || 0,
        hoursLeft: Math.max(1, Math.round((new Date(p.endDate).getTime() - now) / (1000 * 60 * 60))),
      }))
      .sort((a, b) => a.hoursLeft - b.hoursLeft)
      .slice(0, 5);

    return { favCount, followCount, bestDiscount, expiringSoon };
  }, [profile, favorites, favoriteIds, followingIds]);

  // Category distribution (from favorites)
  const categoryData = useMemo(() => {
    const catMap = {};
    favorites.forEach((p) => {
      // category is [categoryName, subCategoryName?] — use main category only
      const mainCat = Array.isArray(p.category) ? p.category[0] : p.category || 'Other';
      catMap[mainCat] = (catMap[mainCat] || 0) + 1;
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, value: count }));
  }, [favorites]);

  // Favorites per store (how many of your favorites belong to each company)
  const storeData = useMemo(() => {
    const storeMap = {};
    favorites.forEach((p) => {
      const name = p.company || p.companyName || 'Unknown';
      storeMap[name] = (storeMap[name] || 0) + 1;
    });
    return Object.entries(storeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, value: count }));
  }, [favorites]);

  if (loading) {
    return (
      <div className="udash-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="udash-container">
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }

  const topCategory =
    categoryData.length > 0
      ? `Top: ${categoryData[0].name} (${categoryData[0].value} deal${categoryData[0].value > 1 ? 's' : ''})`
      : 'Like products to see preferences';

  const topStore =
    storeData.length > 0
      ? `Top: ${storeData[0].name} (${storeData[0].value} fav${storeData[0].value > 1 ? 's' : ''})`
      : 'Like products to see store breakdown';

  return (
    <div className="udash-container">
      <div className="udash-header">
        <h1 className="udash-title">Dashboard</h1>
        <p className="udash-subtitle">Your activity overview on DZ Promo</p>
      </div>

      {/* Stat Cards */}
      <div className="udash-stats-grid">
        <StatCard
          icon={<FavoriteRoundedIcon />}
          label="Favorites"
          value={stats.favCount}
          subtitle="Deals you saved"
          accent="#ef4444"
        />
        <StatCard
          icon={<StorefrontRoundedIcon />}
          label="Following"
          value={stats.followCount}
          subtitle="Stores you follow"
          accent="#8b5cf6"
        />
        <StatCard
          icon={<LocalOfferRoundedIcon />}
          label="Best Discount"
          value={stats.bestDiscount > 0 ? `-${stats.bestDiscount}%` : '—'}
          subtitle={stats.bestDiscount > 0 ? 'Highest saved deal' : 'No discounts yet'}
          accent="#f59e0b"
        />
        <StatCard
          icon={<TimerRoundedIcon />}
          label="Expiring Soon"
          value={stats.expiringSoon.length}
          subtitle="Deals ending in 3 days"
          accent="#f97316"
        />
      </div>

      {/* Charts */}
      <div className="udash-charts-grid">
        <DonutChart
          title="Deal Preferences"
          subtitle={topCategory}
          data={categoryData}
          colors={CATEGORY_COLORS}
          valueLabel="deals"
        />
        <DonutChart
          title="Favorites by Store"
          subtitle={topStore}
          data={storeData}
          colors={STORE_COLORS}
          valueLabel="favs"
        />
      </div>

      {/* Expiring Soon */}
      <ExpiringSoonList items={stats.expiringSoon} />
    </div>
  );
}