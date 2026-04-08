import './OverviewDachAdmin.css';
import OverviewCards from '../Components/cards/OverviewCards';
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { Typography, styled, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AlgerMap from '@components/Map/AlgerMap';
import { useOutletContext } from 'react-router-dom';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { analyticsAPI } from '@shared/api';

const COLORS = ['#8B5CF6', '#6C28D9', '#4F46E5', '#7C3AED', '#9333EA', '#A855F7', '#C084FC'];
const DEVICE_COLORS = ['#8B5CF6', '#6C28D9', '#4F46E5', '#A78BFA'];

const primaryColor = '#8b5cf6';

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: primaryColor,
  fontWeight: 700,
  letterSpacing: '0.5px',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 48,
    height: 4,
    backgroundColor: alpha(primaryColor, 0.5),
    borderRadius: 2,
  },
}));

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: '20px 0',
  display: 'flex',
  boxShadow: 'none',
  gap: '16px',
  border: 'none',
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '8px !important',
    backgroundColor: primaryColor,
    padding: '8px 24px',
    transition: 'all 0.3s ease',
    '&:not(.MuiButton-containedPrimary)': {
      backgroundColor: theme.palette.grey[100],
      color: primaryColor,
      '&:hover': { backgroundColor: theme.palette.grey[200] },
    },
  },
}));

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(139,92,246,0.15)', padding: '10px 16px', border: 'none' }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '4px 0 0', color: p.color || '#8B5CF6', fontWeight: 500, fontSize: 13 }}>
          {p.value?.toLocaleString()} {suffix}
        </p>
      ))}
    </div>
  );
};

/* ── Promotion Performance (Area Chart) ── */
const PromoPerformanceChart = ({ dailyData, weeklyData, monthlyData }) => {
  const [timeRange, setTimeRange] = useState('day');
  const data = timeRange === 'day' ? dailyData : timeRange === 'week' ? weeklyData : monthlyData;
  const totalClicks = (data || []).reduce((s, d) => s + (d.clicks || 0), 0);

  return (
    <div className="chart-box">
      <div className="chart-header">
        <div>
          <SectionTitle variant="h5">Promotion Performance</SectionTitle>
          <span className="chart-count">{totalClicks.toLocaleString()} clicks</span>
        </div>
        <div className="time-range-selector">
          {['day', 'week', 'month'].map((t) => (
            <button key={t} className={timeRange === t ? 'active' : ''} onClick={() => setTimeRange(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data || []} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip content={<ChartTooltip suffix="clicks" />} />
          <Area type="monotone" dataKey="clicks" stroke="#8B5CF6" strokeWidth={2.5}
            fill="url(#gradArea)" dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Top Performing Promotions (Bar Chart) ── */
const TopPromotionsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-box">
        <div className="chart-header"><SectionTitle variant="h5">Top Performing Promotions</SectionTitle></div>
        <div className="chart-placeholder"><Typography variant="body1" color="textSecondary">No promotion data to display</Typography></div>
      </div>
    );
  }

  return (
    <div className="chart-box">
      <div className="chart-header">
        <div>
          <SectionTitle variant="h5">Top Performing Promotions</SectionTitle>
          <span className="chart-count">Top {data.length} products</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={32} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6C28D9" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af' }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(139,92,246,0.15)', padding: '10px 16px', border: 'none' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: 13 }}>{d.fullName || d.name}</p>
                <p style={{ margin: '4px 0 0', color: '#8B5CF6', fontWeight: 500, fontSize: 13 }}>{d.clicks?.toLocaleString()} clicks</p>
              </div>
            );
          }} />
          <Bar dataKey="clicks" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Reusable Pie Chart with Legend ── */
const DistributionChart = ({ title, subtitle, data, colors }) => {
  const hasData = data && data.length > 0;

  return (
    <div className="chart-box">
      <div className="chart-header">
        <div>
          <SectionTitle variant="h5">{title}</SectionTitle>
          <span className="chart-count">{subtitle}</span>
        </div>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
              paddingAngle={4} dataKey="value"
              label={({ percent, cx, x }) => (
                <text x={x} textAnchor={x > cx ? 'start' : 'end'} fill="#374151" fontSize={11} fontWeight={500} dominantBaseline="central">
                  {(percent * 100).toFixed(0)}%
                </text>
              )}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(139,92,246,0.15)', padding: '10px 16px', border: 'none' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: 13 }}>{d.name}</p>
                  <p style={{ margin: '4px 0 0', color: '#8B5CF6', fontWeight: 500, fontSize: 13 }}>{d.value}%</p>
                </div>
              );
            }} />
            <Legend formatter={(value, entry) => (
              <span style={{ color: '#374151', fontSize: 12, fontWeight: 500 }}>{entry.payload.name}</span>
            )} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-placeholder"><Typography variant="body1" color="textSecondary">No data available</Typography></div>
      )}
    </div>
  );
};



/* ═══════════════════════════════════════════════════ */
/*  Main Dashboard                                    */
/* ═══════════════════════════════════════════════════ */
export default function OverviewDachAdmin() {
  const outletContext = useOutletContext();
  const [activeMap, setActiveMap] = useState('visitor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adminCards, setAdminCards] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [cityDistribution, setCityDistribution] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [mapData, setMapData] = useState({});

  useEffect(() => {
    let mounted = true;

    /* Fast poll: overview cards + online count */
    const fetchOverview = async () => {
      try {
        const res = await analyticsAPI.getOverviewStats();
        if (!mounted) return;
        const s = res.data;
        setAdminCards([
          { title: 'Total Users', value: (s.totalUsers || 0).toLocaleString(), change: 'Registered users' },
          { title: 'Companies', value: (s.companies || 0).toLocaleString(), change: 'Active companies' },
          { title: 'Moderators', value: (s.admins || 0).toLocaleString(), change: 'Assigned admins' },
          { title: 'Active Products', value: (s.activeProducts || 0).toLocaleString(), change: `of ${(s.totalProducts || 0).toLocaleString()} total` },
          { title: 'Total Visits', value: (s.totalVisits || 0).toLocaleString(), change: `${(s.todayVisits || 0).toLocaleString()} today` },
          { title: 'Total Clicks', value: (s.totalClicks || 0).toLocaleString(), change: `${(s.totalProductClicks || 0).toLocaleString()} product · ${(s.totalCompanyClicks || 0).toLocaleString()} company` },
          { title: 'Monthly Visits', value: (s.monthlyVisits || 0).toLocaleString(), change: 'This month' },
          { title: 'Online Now', value: (s.onlineUsers || 0).toLocaleString(), change: 'Active in last 5 min' },
        ]);
      } catch (e) { /* silent */ }
    };

    /* Slow poll: charts, map, browser/OS */
    const fetchCharts = async () => {
      try {
        const [productsRes, cityRes, deviceRes, perfRes, mapRes] = await Promise.allSettled([
          analyticsAPI.getMostClickedProducts(),
          analyticsAPI.getMonthlyCityStats(),
          analyticsAPI.getMonthlyDeviceStats(),
          analyticsAPI.getPromotionPerformance(30),
          analyticsAPI.getMapData('visitor'),
        ]);
        if (!mounted) return;

        if (productsRes.status === 'fulfilled') {
          const products = productsRes.value.data || [];
          setTopProducts(products.slice(0, 5).map((p) => ({
            name: (p.name || p.productName || 'Unknown').substring(0, 14),
            fullName: p.name || p.productName || 'Unknown',
            clicks: p.clicks || p.totalClicks || 0,
          })));
        }

        if (cityRes.status === 'fulfilled') {
          const cities = cityRes.value.data || [];
          const total = cities.reduce((sum, c) => sum + c.count, 0);
          setCityDistribution(cities.slice(0, 5).map((c) => ({
            name: c.city || 'Unknown',
            value: total > 0 ? Math.round((c.count / total) * 100) : 0,
          })));
        }

        if (deviceRes.status === 'fulfilled') {
          const devices = deviceRes.value.data || [];
          const total = devices.reduce((sum, d) => sum + d.count, 0);
          setDeviceData(devices.map((d) => ({
            name: d.device || 'Unknown',
            value: total > 0 ? Math.round((d.count / total) * 100) : 0,
          })));
        }

        if (perfRes.status === 'fulfilled') {
          const perfArr = perfRes.value.data || [];
          setDailyData(perfArr.slice(-7).map((d) => ({
            name: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
            clicks: d.clicks || 0,
          })));
          const weekly = perfArr.slice(-28).reduce((acc, d, i) => {
            const w = Math.floor(i / 7);
            if (!acc[w]) acc[w] = { name: `Week ${w + 1}`, clicks: 0 };
            acc[w].clicks += d.clicks || 0;
            return acc;
          }, []);
          setWeeklyData(Array.isArray(weekly) ? weekly : []);
          setMonthlyData(perfArr.map((d) => ({
            name: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            clicks: d.clicks || 0,
          })));
        }

        if (mapRes.status === 'fulfilled') setMapData(mapRes.value.data || {});

      } catch (e) { /* silent */ }
    };

    const init = async () => {
      setLoading(true);
      setError(null);
      try { await Promise.all([fetchOverview(), fetchCharts()]); }
      catch (err) { if (mounted) setError('Failed to load dashboard data'); }
      finally { if (mounted) setLoading(false); }
    };
    init();

    const overviewTimer = setInterval(fetchOverview, 1000);
    const chartTimer = setInterval(fetchCharts, 30000);
    return () => { mounted = false; clearInterval(overviewTimer); clearInterval(chartTimer); };
  }, []);

  /* Re-fetch map on toggle */
  useEffect(() => {
    analyticsAPI.getMapData(activeMap === 'visitor' ? 'visitor' : 'click')
      .then((res) => setMapData(res.data || {}))
      .catch(() => {});
  }, [activeMap]);

  if (loading) {
    return (
      <div className="overview-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container"><Typography variant="h6" color="error">{error}</Typography></div>
    );
  }

  /* Dynamic subtitles */
  const topCity = cityDistribution.length > 0 ? `${cityDistribution[0].name} leads with ${cityDistribution[0].value}%` : 'No city data';
  const dominantDevice = deviceData.length > 0 ? `${deviceData[0].name} at ${deviceData[0].value}%` : 'No device data';

  return (
    <div className="overview-container">
      <SectionTitle variant="h4" sx={{ mt: 2 }}>Platform Analytics Dashboard</SectionTitle>
      <p className="dashboard-subtitle">Complete overview of DZ Promo platform performance</p>

      <OverviewCards cards={adminCards} />

      <div className="charts-container">
        <PromoPerformanceChart dailyData={dailyData} weeklyData={weeklyData} monthlyData={monthlyData} />
        <TopPromotionsChart data={topProducts} />
      </div>

      <div className="distribution-container">
        <DistributionChart title="Audience by City" subtitle={topCity} data={cityDistribution} colors={COLORS} />
        <DistributionChart title="Device Distribution" subtitle={dominantDevice} data={deviceData} colors={DEVICE_COLORS} />
      </div>



      {/* Map Toggle */}
      <div style={{ display: 'flex', justifyContent: 'left' }}>
        <StyledButtonGroup variant="contained" aria-label="Map type toggle">
          <Button onClick={() => setActiveMap('visitor')} color={activeMap === 'visitor' ? 'primary' : 'inherit'}>Visitor Map</Button>
          <Button onClick={() => setActiveMap('click')} color={activeMap === 'click' ? 'primary' : 'inherit'}>Click Map</Button>
        </StyledButtonGroup>
      </div>

      <AlgerMap
        data={mapData}
        maptitle={activeMap === 'visitor' ? 'Visitor Distribution' : 'Click Distribution'}
        cardtitle={activeMap === 'visitor' ? 'Visitors' : 'Clicks'}
      />
    </div>
  );
}