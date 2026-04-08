import React, { useState, useEffect } from 'react';
import './DachboardAdmin.css'; 
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function DashboardTabPanel(props) {
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

DashboardTabPanel.propTypes = {
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

function DashboardTabs({ userId }) {
  const location = useLocation();
  const getTabValueFromPathname = (pathname) => {
    if (pathname.includes('/Users')) return 1;
    return 0;
  };

  const [value, setValue] = useState(() => getTabValueFromPathname(location.pathname));

  useEffect(() => {
    setValue(getTabValueFromPathname(location.pathname));
  }, [location.pathname]);

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
          aria-label="dashboard tabs"
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': { color: '#000000' },
            '& .Mui-selected': { color: '#9766ff' },
            '& .MuiTabs-indicator': { backgroundColor: '#9766ff' },
          }}
        >
          <Tab 
            label="Overview" 
            {...a11yProps(0)} 
            component={NavLink}
            to=""
            replace
          />
          <Tab 
            label="Users" 
            {...a11yProps(1)} 
            component={NavLink}
            to="Users"
            replace
          />
        </Tabs>
      </Box>

      <Outlet context={{ userId }} />
    </Box>
  );
}

function DashboardAdmin() {
  const { userId } = useOutletContext();

  return (
    <div className="content">
      {userId && <DashboardTabs userId={userId} />}
    </div>
  );
}

export default DashboardAdmin;
