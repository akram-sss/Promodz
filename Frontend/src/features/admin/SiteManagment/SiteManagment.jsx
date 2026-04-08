import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Data from '@data/moc-data/Data'; // Adjust path if needed

function ManagmentTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

ManagmentTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function ManagmentTabs({ userId }) {
  const location = useLocation();
  const [value, setValue] = useState(() => {
    if (location.pathname.includes('Messages')) return 1;
    if (location.pathname.includes('Ads')) return 2;
    if (location.pathname.includes('PromotionPacks')) return 3;
    if (location.pathname.includes('TopCompanies')) return 4;
    
    return 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Tabs 
          value={value} 
          onChange={handleChange}
          aria-label="Managment tabs"
          variant="scrollable"
          scrollButtons="auto"
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': { color: '#000000' },
            '& .Mui-selected': { color: '#9766ff' },
            '& .MuiTabs-indicator': { backgroundColor: '#9766ff' },
          }}
        >
          <Tab 
            label="Legal Content" 
            {...a11yProps(0)} 
            component={NavLink}
            to=""
            replace
          />
          <Tab 
            label="Messages" 
            {...a11yProps(1)} 
            component={NavLink}
            to="Messages"
            replace
          />
          <Tab 
            label="Ads" 
            {...a11yProps(2)} 
            component={NavLink}
            to="Ads"
            replace
          />
          <Tab 
            label="Promotion Packs" 
            {...a11yProps(3)} 
            component={NavLink}
            to="PromotionPacks"
            replace
          />
          <Tab 
            label="Top Companies" 
            {...a11yProps(4)} 
            component={NavLink}
            to="TopCompanies"
            replace
          />
        </Tabs>
      </Box>

      <Outlet context={{ userId }} />
    </Box>
  );
}

function SiteMangment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userId } = useOutletContext();

  

  useEffect(() => {
    const mockFetchProtectedData = () => {
      setLoading(true);

      setTimeout(() => {
        try {
          // Simulated success
        } catch (err) {
          console.error('Failed to load mock data:', err);
          setError(err?.message || 'Failed to load mock data');
        } finally {
          setLoading(false);
        }
      }, 600);
    };

    mockFetchProtectedData(); // <- Call added
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <div className="content">
      {userId && <ManagmentTabs userId={userId} />}
    </div>
  );
}

export default SiteMangment;
