import './OverviewDachAdmin.css';
import OverviewCards from '../Components/cards/OverviewCards';
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { Typography, styled, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { analyticsAPI } from '@shared/api';
import dayjs from 'dayjs';

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
            <linearGradient id="barGradMod" x1="0" y1="0" x2="0" y2="1">
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
          <Bar dataKey="clicks" fill="url(#barGradMod)" radius={[8, 8, 0, 0]} />
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
/*  Moderator Dashboard                               */
/* ═══════════════════════════════════════════════════ */
export default function OverviewDachAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyPromoPerformance, setWeeklyPromoPerformance] = useState([]);
  const [cityDistribution, setCityDistribution] = useState([]);
  const [deviceData, setDeviceData] = useState([]);


  useEffect(() => {
    let mounted = true;

    /* Fast poll: overview cards */
    const fetchOverview = async () => {
      try {
        const overviewRes = await analyticsAPI.getOverviewStats().then((r) => r.data).catch(() => ({}));
        if (!mounted) return;
        setCards([
          { title: 'Assigned Companies', value: (overviewRes.assignedCompanies || 0).toLocaleString(), change: 'Companies you manage' },
          { title: 'Total Products', value: (overviewRes.totalProducts || 0).toLocaleString(), change: `${(overviewRes.activeProducts || 0).toLocaleString()} active` },
          { title: 'Active Products', value: (overviewRes.activeProducts || 0).toLocaleString(), change: 'Currently active' },
          { title: 'Total Clicks', value: (overviewRes.totalClicks || 0).toLocaleString(), change: 'Product clicks' },
          { title: 'Expired Products', value: (overviewRes.expiredProducts || 0).toLocaleString(), change: 'Past promotions' },
          { title: 'Deleted Products', value: (overviewRes.deletedProducts || 0).toLocaleString(), change: 'Removed' },
        ]);
      } catch (e) { /* silent */ }
    };

    /* Slow poll: charts + browser/OS */
    const fetchCharts = async () => {
      try {
        const [perfRes, clickedRes, cityRes, deviceRes] = await Promise.allSettled([
          analyticsAPI.getPromotionPerformance(30).then((r) => r.data),
          analyticsAPI.getMostClickedProducts().then((r) => r.data),
          analyticsAPI.getCompanyCityStats().then((r) => r.data),
          analyticsAPI.getCompanyDeviceStats().then((r) => r.data),
        ]);
        if (!mounted) return;

        if (perfRes.status === 'fulfilled') {
          const perfArr = Array.isArray(perfRes.value) ? perfRes.value : [];
          setDailyData(perfArr.slice(-7).map((d) => ({
            name: dayjs(d.date).format('ddd'),
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
            name: dayjs(d.date).format('MMM D'),
            clicks: d.clicks || 0,
          })));
        }

        if (clickedRes.status === 'fulfilled') {
          const clickedArr = Array.isArray(clickedRes.value) ? clickedRes.value : [];
          setWeeklyPromoPerformance(
            clickedArr.slice(0, 5).map((p) => ({
              name: (p.name || p.productName || 'Product').substring(0, 14),
              fullName: p.name || p.productName || 'Product',
              clicks: p.clicks || p.totalClicks || 0,
            }))
          );
        }

        if (cityRes.status === 'fulfilled') {
          const cityArr = Array.isArray(cityRes.value) ? cityRes.value : [];
          const totalCity = cityArr.reduce((s, c) => s + (c.count || 0), 0);
          setCityDistribution(
            cityArr.slice(0, 5).map((c) => ({
              name: c.city || 'Unknown',
              value: totalCity > 0 ? Math.round((c.count / totalCity) * 100) : 0,
            }))
          );
        }

        if (deviceRes.status === 'fulfilled') {
          const devArr = Array.isArray(deviceRes.value) ? deviceRes.value : [];
          const totalDev = devArr.reduce((s, d) => s + (d.count || 0), 0);
          setDeviceData(
            devArr.map((d) => ({
              name: d.device || 'Unknown',
              value: totalDev > 0 ? Math.round((d.count / totalDev) * 100) : 0,
            }))
          );
        }

      } catch (e) { /* silent */ }
    };

    const init = async () => {
      setLoading(true);
      try { await Promise.all([fetchOverview(), fetchCharts()]); }
      catch (err) { if (mounted) setError(err.message || 'Failed to load dashboard'); }
      finally { if (mounted) setLoading(false); }
    };
    init();

    const overviewTimer = setInterval(fetchOverview, 1000);
    const chartTimer = setInterval(fetchCharts, 30000);
    return () => { mounted = false; clearInterval(overviewTimer); clearInterval(chartTimer); };
  }, []);

  if (loading) {
    return (
      <div className="overview-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
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
      <SectionTitle variant="h4" sx={{ mt: 2 }}>Moderator Dashboard</SectionTitle>
      <p className="dashboard-subtitle">Overview of your assigned companies and their performance</p>

      <OverviewCards cards={cards} />

      <div className="charts-container">
        <PromoPerformanceChart dailyData={dailyData} weeklyData={weeklyData} monthlyData={monthlyData} />
        <TopPromotionsChart data={weeklyPromoPerformance} />
      </div>

      <div className="distribution-container">
        <DistributionChart title="Audience by City" subtitle={topCity} data={cityDistribution} colors={COLORS} />
        <DistributionChart title="Device Distribution" subtitle={dominantDevice} data={deviceData} colors={DEVICE_COLORS} />
      </div>


    </div>
  );
}