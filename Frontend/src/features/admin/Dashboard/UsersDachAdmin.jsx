import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  InputAdornment, 
  Paper, 
  TablePagination, 
  TextField, 
  Typography,
  Avatar,
  Chip,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Shield as ShieldIcon,
  Visibility as VisibilityIcon,
  LastPage
} from '@mui/icons-material';
import {Download } from "@mui/icons-material";
import { purple } from '@mui/material/colors';
import { Link } from 'react-router-dom';
import Data from '@data/moc-data/Data';
import { useOutletContext } from 'react-router-dom';
import OverviewCards from '../Components/cards/OverviewCards';
import { userAPI, adminAPI, superAdminAPI } from '@shared/api';
import { useAuth } from '@context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { exportToExcel } from '@shared/utils/exportToExcel';

// Modern card component


const UserList = ({ activeTab, currentUser, allUsers, assignedCompanies, onUserCreate, onUserDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const getDefaultFormData = () => ({
    name: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [newUserData, setNewUserData] = useState(getDefaultFormData());

  // Derive the role from the active tab — no manual selector needed
  const getRoleForTab = () => {
    if (activeTab === 'Companies') return 'Company';
    if (activeTab === 'Moderators') return 'Moderator';
    return 'User';
  };

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchTerm]);

  // Filter users based on role and permissions
  const getFilteredUsers = () => {
    try {
      let filteredUsers = [...allUsers];
      
      // Apply tab filter  
      if (activeTab === 'Companies') {
        filteredUsers = filteredUsers.filter(user => user.role === 'ENTREPRISE');
        
        // If admin (not super), only show assigned companies
        if (currentUser.role === 'ADMIN' && assignedCompanies?.length) {
          const assignedIds = assignedCompanies.map(c => c.id);
          filteredUsers = filteredUsers.filter(user => assignedIds.includes(user.id));
        }
      } 
      else if (activeTab === 'Moderators') {
        filteredUsers = filteredUsers.filter(user => user.role === 'ADMIN');
        
        // Only superadmin can see all moderators
        if (currentUser.role !== 'SUPER_ADMIN') {
          filteredUsers = [];
        }
      }
      else if (activeTab === 'Users') {
        filteredUsers = filteredUsers.filter(user => user.role === 'USER');
      }

      // Apply search filter
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
          (user.fullName || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredUsers;
    } catch (err) {
      console.error('Failed to filter users:', err);
      setError('Failed to filter users');
      return [];
    }
  };

  const filteredUsers = getFilteredUsers();
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCreateUser = async () => {
    try {
      setError(null);
      const currentRole = getRoleForTab();
      const isCompany = currentRole === 'Company';

      // Validate required fields
      if (isCompany) {
        if (!newUserData.name) throw new Error('Company name is required');
      } else {
        if (!newUserData.name) throw new Error('First name is required');
      }
      if (!newUserData.email) throw new Error('Email is required');
      if (!newUserData.password) throw new Error('Password is required');
      if (!newUserData.phoneNumber) throw new Error('Phone number is required');
      
      // Auto-generate username from email if not provided
      const username = newUserData.username || newUserData.email.split('@')[0];
      
      // Build fullName
      const fullName = isCompany
        ? newUserData.name.trim()
        : `${newUserData.name} ${newUserData.lastName || ''}`.trim();

      // Map role names  
      const roleMap = { 'User': 'USER', 'Moderator': 'ADMIN', 'Company': 'ENTREPRISE' };
      
      const payload = {
        username,
        fullName,
        email: newUserData.email,
        phoneNumber: newUserData.phoneNumber,
        password: newUserData.password,
        role: roleMap[currentRole] || 'USER',
      };

      // Include companyName for company accounts
      if (isCompany) {
        payload.companyName = newUserData.name.trim();
      }

      const result = await userAPI.register(payload);
      
      onUserCreate(result);
      setOpenCreateDialog(false);
      setNewUserData(getDefaultFormData());
      
      const entityLabel = isCompany ? 'Company' : currentRole === 'Moderator' ? 'Moderator' : 'User';
      setSuccessMsg(`${entityLabel} "${fullName}" created successfully`);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to create user';
      setError(msg);
    }
  };

  const canCreate = () => {
    return currentUser.role === 'SUPER_ADMIN';
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          variant="outlined"
          placeholder="Search by name, username or email"
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
        
        {canCreate() && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ 
              backgroundColor: '#8b5cf6',
              '&:hover': { backgroundColor: '#8b5cf688' }
            }}
          >
            Create {activeTab.slice(0, -1)}
          </Button>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : paginatedUsers.length === 0 ? (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            No {activeTab.toLowerCase()} found
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
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <Box display="flex" alignItems="center">
                  <Avatar src={user.image} sx={{ width: 48, height: 48, mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {user.fullName || user.username}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      @{user.username} {user.email}
                    </Typography>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ 
                        mt: 1,
                        backgroundColor: 
                          user.role === 'ADMIN' ? '#f5ebff': 
                          user.role === 'ENTREPRISE' ? '#8b5cf6' : 
                          'default',
                        color: 
                          user.role === 'ADMIN' ? '#8b5cf6' : 
                          user.role === 'ENTREPRISE' ? '#f5ebff' : 
                          'default'
                      }} 
                    />
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Button 
                    component={Link}
                    to={`${user.id}`}
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      borderColor: purple[400],
                      color: '#8b5cf6',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        backgroundColor: purple[50]
                      }
                    }}
                  >
                    View Profile
                  </Button>
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => onUserDelete?.(user.id, user.fullName || user.username)}
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        '&:hover': {
                          borderColor: '#dc2626',
                          backgroundColor: '#fef2f2'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
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

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={() => { setOpenCreateDialog(false); setError(null); }}>
        <DialogTitle>
          Create New {getRoleForTab()}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, pt: 1 }}>
            {/* Role indicator chip */}
            <Chip 
              label={`Role: ${getRoleForTab()}`} 
              sx={{ mb: 2, backgroundColor: '#f5ebff', color: '#8b5cf6', fontWeight: 'bold' }} 
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Company Name — only for Companies tab */}
            {activeTab === 'Companies' && (
              <TextField
                fullWidth
                label="Company Name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                margin="normal"
                required
              />
            )}
            {/* First Name / Last Name — for Users and Moderators */}
            {activeTab !== 'Companies' && (
              <>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newUserData.lastName}
                  onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                  margin="normal"
                />
              </>
            )}
            <TextField
              fullWidth
              label="Username"
              value={newUserData.username}
              onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
              margin="normal"
              helperText="Leave empty to auto-generate from email"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={newUserData.phoneNumber}
              onChange={(e) => setNewUserData({...newUserData, phoneNumber: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCreateDialog(false); setError(null); }}>Cancel</Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            sx={{ 
              backgroundColor: '#8b5cf6',
              '&:hover': { backgroundColor: '#7a4ee8' }
            }}
          >
            Create {getRoleForTab()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!successMsg} 
        autoHideDuration={4000} 
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

const UsersDachAdmin = () => {
  const [activeTab, setActiveTab] = useState('Users');
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, companiesRes] = await Promise.all([
          userAPI.getAll(),
          adminAPI.getAssignedCompanies().catch(() => ({ data: [] })),
        ]);
        
        const users = usersRes.data;
        const companies = companiesRes.data || companiesRes;
        
        setAllUsers(Array.isArray(users) ? users : []);
        setAssignedCompanies(Array.isArray(companies) ? companies : []);
        
        setCurrentUser({
          id: authUser.id,
          role: authUser.role,
          username: authUser.username || authUser.fullName,
          usersStats: [
            { title: 'Total Users', value: (users || []).filter(u => u.role === 'USER').length, change: 'Registered users' },
            { title: 'Companies', value: (users || []).filter(u => u.role === 'ENTREPRISE').length, change: 'Active companies' },
            { title: 'Admins', value: (users || []).filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length, change: 'Moderators' },
          ],
        });
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser]);

  const handleUserCreate = (newUser) => {
    // Refresh users list
    userAPI.getAll().then(res => setAllUsers(Array.isArray(res.data) ? res.data : []));
  };

  const handleUserDelete = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? They will appear in Deleted Users.`)) return;
    try {
      await superAdminAPI.deleteUser(userId);
      // Refresh users list
      const res = await userAPI.getAll();
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
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
        User Management
      </Typography>
      <Button
        variant="contained"
        startIcon={exporting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Download />}
        disabled={exporting}
        onClick={async () => {
          setExporting(true);
          try {
            const tabRoleMap = { Users: 'USER', Companies: 'ENTREPRISE', Moderators: 'ADMIN' };
            const exportData = tabRoleMap[activeTab] ? allUsers.filter(u => u.role === tabRoleMap[activeTab]) : allUsers;
            await exportToExcel(exportData, {
              fileName: `users_${activeTab || 'all'}`,
              sheetName: activeTab || 'Users',
              columns: [
                { header: 'Full Name', key: (u) => u.fullName || `${u.name || ''} ${u.lastName || ''}`.trim() || u.username, width: 22 },
                { header: 'Username', key: 'username', width: 18 },
                { header: 'Email', key: 'email', width: 28 },
                { header: 'Phone', key: 'phoneNumber', width: 16 },
                { header: 'Role', key: 'role', width: 14 },
                { header: 'Joined', key: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '', width: 14 },
              ],
            });
          } finally {
            setExporting(false);
          }
        }}
        sx={{
          backgroundColor: "#8b5cf6",
          "&:hover": { backgroundColor: "#7a4ee8" },
        }}
      >
        {exporting ? 'Exporting...' : 'Export to Excel'}
      </Button>

      </Box>
      {/* Stats Cards */}
        <OverviewCards cards={currentUser.usersStats} />

      {/* Tabs */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#8b5cf6',
              height: 3
            }
          }}
        >
          <Tab 
            label="Users" 
            value="Users" 
            icon={<PersonIcon />} 
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { color: '#8b5cf6' },
              py: 2
            }}
          />
          <Tab 
            label="Companies" 
            value="Companies" 
            icon={<BusinessIcon />} 
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { color: '#8b5cf6' },
              py: 2
            }}
          />
          {currentUser?.role === 'SUPER_ADMIN' && (
            <Tab 
              label="Moderators" 
              value="Moderators" 
              icon={<ShieldIcon />} 
              iconPosition="start"
              sx={{ 
                '&.Mui-selected': { color: '#8b5cf6' },
                py: 2
              }}
            />
          )}
        </Tabs>
      </Paper>

      {/* User List */}
      <UserList 
        activeTab={activeTab} 
        currentUser={currentUser}
        allUsers={allUsers}
        assignedCompanies={assignedCompanies}
        onUserCreate={handleUserCreate}
        onUserDelete={handleUserDelete}
      />
    </Box>
  );
};

export default UsersDachAdmin;