import './OverviewDachCompany.css';
import OverviewCards from '../Components/cards/OverviewCards';
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { Typography, styled, Box, Chip, LinearProgress, Button, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { subscriptionAPI, analyticsAPI } from '@shared/api';
import dayjs from 'dayjs';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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

/* ── Subscription Plan Card ── */
const SubscriptionPlanCard = ({ subscriptionPlan, subscribeStartedate, subscribeEnddate }) => {
  const startDate = dayjs(subscribeStartedate);
  const endDate = dayjs(subscribeEnddate);
  const today = dayjs();
  const totalDays = endDate.diff(startDate, 'day');
  const daysRemaining = endDate.diff(today, 'day');
  const daysUsed = today.diff(startDate, 'day');
  const progress = totalDays > 0 ? Math.min(Math.max((daysUsed / totalDays) * 100, 0), 100) : 0;
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 7;

  const getPlanGradient = () => {
    switch (subscriptionPlan?.name?.toUpperCase()) {
      case 'ENTERPRISE': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)';
      case 'PREMIUM': return 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #8E8E8E 100%)';
      case 'BASIC': return 'linear-gradient(135deg, #CD7F32 0%, #B87333 50%, #A0522D 100%)';
      case 'FREE': return 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)';
      default: return 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)';
    }
  };

  return (
    <Box sx={{
      background: '#fff', borderRadius: '20px', padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: `2px solid ${subscriptionPlan?.color || '#e5e7eb'}`,
      position: 'relative', overflow: 'hidden', mb: 3,
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: getPlanGradient() }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, mt: 1 }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#6b7280', fontWeight: 600, letterSpacing: 1 }}>Your Current Plan</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, borderRadius: '12px', background: getPlanGradient(),
              boxShadow: `0 4px 12px ${subscriptionPlan?.color}40`,
            }}>
              <Typography sx={{ fontSize: '22px' }}>{subscriptionPlan?.icon || '📦'}</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>{subscriptionPlan?.name || 'Free'} Plan</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Premium Member</Typography>
            </Box>
          </Box>
        </Box>
        <Chip
          icon={isExpired ? null : <WorkspacePremiumIcon sx={{ fontSize: 16 }} />}
          label={isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
          sx={{
            backgroundColor: isExpired ? alpha('#ef4444', 0.1) : isExpiringSoon ? alpha('#f59e0b', 0.1) : alpha('#10b981', 0.1),
            color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981',
            fontWeight: 600, fontSize: '12px', '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Subscription Period</Typography>
          <Typography variant="caption" sx={{ color: subscriptionPlan?.color, fontWeight: 600 }}>
            {isExpired ? 'Plan Expired' : `${Math.max(daysRemaining, 0)} days remaining`}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{
          height: 10, borderRadius: 5,
          backgroundColor: alpha(subscriptionPlan?.color || '#8B5CF6', 0.15),
          '& .MuiLinearProgress-bar': { borderRadius: 5, background: getPlanGradient() },
        }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>{startDate.format('MMM D, YYYY')}</Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>{endDate.format('MMM D, YYYY')}</Typography>
        </Box>
      </Box>
      {(isExpired || isExpiringSoon) && (
        <Button variant="contained" fullWidth sx={{
          background: getPlanGradient(), color: '#fff', fontWeight: 600, py: 1.5,
          borderRadius: '12px', textTransform: 'none',
          boxShadow: `0 4px 14px ${subscriptionPlan?.color}40`,
          '&:hover': { boxShadow: `0 6px 20px ${subscriptionPlan?.color}50` },
        }}>
          {isExpired ? 'Renew Subscription' : 'Extend Plan'}
        </Button>
      )}
    </Box>
  );
};

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
            <linearGradient id="gradAreaCo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip content={<ChartTooltip suffix="clicks" />} />
          <Area type="monotone" dataKey="clicks" stroke="#8B5CF6" strokeWidth={2.5}
            fill="url(#gradAreaCo)" dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
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
            <linearGradient id="barGradCo" x1="0" y1="0" x2="0" y2="1">
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
          <Bar dataKey="clicks" fill="url(#barGradCo)" radius={[8, 8, 0, 0]} />
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
/*  Company Dashboard                                 */
/* ═══════════════════════════════════════════════════ */
export default function OverviewDachAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscribeStartedate, setSubscribeStartedate] = useState(null);
  const [subscribeEnddate, setSubscribeEnddate] = useState(null);
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
        const statsRes = await analyticsAPI.getOverviewStats().then((r) => r.data).catch(() => ({}));
        if (!mounted) return;
        setCards([
          { title: 'Followers', value: (statsRes.followers || 0).toLocaleString(), change: 'Total followers' },
          { title: 'Total Clicks', value: (statsRes.totalClicks || 0).toLocaleString(), change: `${(statsRes.productClicks || 0).toLocaleString()} product · ${(statsRes.companyClicks || 0).toLocaleString()} company` },
          { title: 'Active Products', value: (statsRes.activeProducts || 0).toLocaleString(), change: `of ${(statsRes.totalProducts || 0).toLocaleString()} total` },
          { title: 'Expired Products', value: (statsRes.expiredProducts || 0).toLocaleString(), change: 'Past promotions' },
        ]);
      } catch (e) { /* silent */ }
    };

    /* Slow poll: subscription + charts + browser/OS */
    const fetchCharts = async () => {
      try {
        const [subRes, perfRes, clickedRes, cityRes, deviceRes] = await Promise.allSettled([
          subscriptionAPI.getMySubscription().then((r) => r.data),
          analyticsAPI.getPromotionPerformance(30).then((r) => r.data),
          analyticsAPI.getMostClickedProducts().then((r) => r.data),
          analyticsAPI.getCompanyCityStats().then((r) => r.data),
          analyticsAPI.getCompanyDeviceStats().then((r) => r.data),
        ]);
        if (!mounted) return;

        /* Subscription */
        if (subRes.status === 'fulfilled' && subRes.value?.subscription) {
          const sub = subRes.value.subscription;
          const planName = (sub.plan || sub.name || 'Free').toUpperCase();
          const planConfig = {
            ENTERPRISE: { color: '#FF8C00', bgColor: '#FFFDF0', icon: '👑' },
            PREMIUM:    { color: '#A8A8A8', bgColor: '#F8F8F8', icon: '🥈' },
            BASIC:      { color: '#CD7F32', bgColor: '#FFF8F0', icon: '🥉' },
            FREE:       { color: '#6B7280', bgColor: '#F3F4F6', icon: '📦' },
          };
          const cfg = planConfig[planName] || { color: '#8B5CF6', bgColor: '#F5F0FF', icon: '📦' };
          setSubscriptionPlan({ name: sub.plan || sub.name || 'Free', ...cfg });
          setSubscribeStartedate(sub.startDate || sub.createdAt);
          setSubscribeEnddate(sub.endDate || sub.expiresAt);
        }

        /* Promo performance */
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

        /* Top clicked products */
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

        /* City distribution */
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

        /* Device distribution */
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
      <SectionTitle variant="h4" sx={{ mt: 2 }}>Company Analytics Dashboard</SectionTitle>
      <p className="dashboard-subtitle">Track how your promotions are performing on DZ Promo</p>

      {subscriptionPlan && (
        <SubscriptionPlanCard
          subscriptionPlan={subscriptionPlan}
          subscribeStartedate={subscribeStartedate}
          subscribeEnddate={subscribeEnddate}
        />
      )}

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