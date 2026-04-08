import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Paper, 
  TablePagination, 
  TextField, 
  Typography,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { purple } from '@mui/material/colors';
import { Link, useOutletContext } from 'react-router-dom';
import { adminAPI, userAPI } from '@shared/api';
import { useAuth } from '@context/AuthContext';

const UserList = ({ companies, onUserCreate }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { setPage(0); }, [searchTerm]);

  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return companies;
    const term = searchTerm.toLowerCase();
    return companies.filter(u =>
      (u.fullName || '').toLowerCase().includes(term) ||
      (u.handle || '').toLowerCase().includes(term) ||
      (u.companyName || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  }, [companies, searchTerm]);

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          variant="outlined"
          placeholder="Search by name, handle or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 350 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {paginatedUsers.length === 0 ? (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            No companies found
          </Typography>
        </Box>
      ) : (
        <>
          {paginatedUsers.map((user) => (
            <Box key={user.id} mb={2}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                p={2}
                sx={{ '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 } }}
              >
                <Box display="flex" alignItems="center">
                  <Avatar src={user.image} sx={{ width: 48, height: 48, mr: 2 }}>
                    {(user.companyName || user.fullName || '?')[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {user.companyName || user.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.handle ? `@${user.handle}` : ''} {user.handle && user.email ? ' \u2022 ' : ''} {user.email}
                    </Typography>
                    <Chip 
                      label="Company" 
                      size="small" 
                      sx={{ mt: 1, backgroundColor: '#8b5cf6', color: '#f5ebff' }} 
                    />
                  </Box>
                </Box>
                <Button 
                  component={Link}
                  to={`${user.id}`}
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  sx={{
                    borderColor: purple[400],
                    color: '#8b5cf6',
                    '&:hover': { borderColor: '#8b5cf6', backgroundColor: purple[50] }
                  }}
                >
                  View Profile
                </Button>
              </Box>
              <Divider />
            </Box>
          ))}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}
    </Paper>
  );
};

const UsersDachAdmin = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAssignedCompanies();
        const assignments = res.data || [];
        // Extract company user objects from assignments
        const companyUsers = assignments.map(a => a.company || a.companyData || a).filter(Boolean);
        setCompanies(companyUsers);
      } catch (err) {
        console.error('Failed to load assigned companies:', err);
        setError(err.message || 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please check your permissions or try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#8b5cf6' }}>
          Company Management
        </Typography>
      </Box>

      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs 
          value="Companies"
          variant="fullWidth"
          sx={{ '& .MuiTabs-indicator': { backgroundColor: '#8b5cf6', height: 3 } }}
        >
          <Tab 
            label="Companies" 
            value="Companies" 
            icon={<BusinessIcon />} 
            iconPosition="start"
            sx={{ '&.Mui-selected': { color: '#8b5cf6' }, py: 2 }}
          />
        </Tabs>
      </Paper>

      <UserList companies={companies} />
    </Box>
  );
};

export default UsersDachAdmin;
