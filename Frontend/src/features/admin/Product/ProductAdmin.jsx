import React, { useState, useEffect } from 'react';
import './ProductAdmin.css';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { adminAPI } from '@shared/api';
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

const ProductTabs = ({ companies,userId }) => {
  const location = useLocation();
  const [selectedCompany, setSelectedCompany] = useState('all');

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

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
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
        
        <FormControl sx={{ minWidth: 200, marginRight: 2 }}>
          <InputLabel id="company-select-label">Select Company</InputLabel>
          <Select
            labelId="company-select-label"
            id="company-select"
            value={selectedCompany}
            label="Select Company"
            onChange={handleCompanyChange}
          >
            <MenuItem value="all" >
              <em>All Companies</em>
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
            {console.log("Companies:", selectedCompany)}
          </Select>
        </FormControl>
      </Box>
      
      {/* Render nested routes here */}
      <Outlet context={{ selectedCompany,userId }} />
    </Box>
  );
};

function ProductAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const { userId } = useOutletContext();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const { data: assigned } = await adminAPI.getAssignedCompanies();
        const mapped = (Array.isArray(assigned) ? assigned : []).map(c => ({
          id: c.id,
          name: c.fullName || c.email,
        }));
        setCompanies(mapped);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err.message || 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

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
      <ProductTabs companies={companies} userId={userId} />
    </div>
  );
}

export default ProductAdmin;