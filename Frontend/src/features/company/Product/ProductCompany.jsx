import React, { useState, useEffect } from 'react';
import './ProductCompany.css';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useOutletContext } from 'react-router-dom';

function ProductTabPanel(props) {
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

ProductTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function ProductProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ProductTabs = ({ userId }) => {
  const location = useLocation();
  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname.includes('AddPromotion')) return 1;
    if (location.pathname.includes('DeletedPromotions')) return 2;
    if (location.pathname.includes('Category')) return 3;
    return 0; // Default to Overview
  };

  const [value, setValue] = React.useState(getActiveTab());

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
          aria-label="basic tabs example"
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': { color: '#000000' },
            '& .Mui-selected': { color: '#9766ff' },
            '& .MuiTabs-indicator': { backgroundColor: '#9766ff' },
          }}
        >
          <Tab 
            label="OverView" 
            {...ProductProps(0)} 
            component={NavLink}
            to=""
            replace
          />
          <Tab 
            label="Add Promotion" 
            {...ProductProps(1)} 
            component={NavLink}
            to="AddPromotion"
            replace
          />
          <Tab 
            label="Deleted Promotion" 
            {...ProductProps(2)} 
            component={NavLink}
            to="DeletedPromotions"
            replace
          />
          <Tab 
            label="Category" 
            {...ProductProps(3)} 
            component={NavLink}
            to="Category"
            replace
          />
        </Tabs>
      </Box>
      
      {/* Render nested routes here */}
      <Outlet context={{ userId }} />
    </Box>
  );
};

function ProductCompany() {
  const { userId } = useOutletContext();

  return (
    <div className="content">
      <ProductTabs userId={userId} />
    </div>
  );
}

export default ProductCompany;