import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel,
  Toolbar, Typography, Paper, Checkbox, IconButton,
  Tooltip, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, Modal, FormControlLabel,
  Switch, Avatar, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductRowPopup from './ProductRowPopup';
import dayjs from 'dayjs';
import defaultProduct from '@assets/Product.png';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeletedProductRowPopup from './DeletedProductRowPopup';
import './DeletedPromotionTable.css';
import { productAPI } from '@shared/api';
import { useOutletContext } from 'react-router-dom';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const DeletedPromotionTable = () => {
  const { userId, selectedCompany } = useOutletContext();
  const [allProducts, setAllProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [permissions, setPermissions] = useState({canDelete: false});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getDeleted();
        const data = res.data;
        let products = Array.isArray(data.products) ? data.products : [];

        if (selectedCompany && selectedCompany !== 'all') {
          products = products.filter(p => p.companyId === selectedCompany || p.company === selectedCompany);
        }

        setAllProducts(products);
        setPermissions({ canDelete: false }); // Moderators typically can't delete
        setError(null);
      } catch (err) {
        console.error('Failed to load deleted promotions:', err);
        setError(err.response?.data?.error || err.message);
        setAllProducts([]);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, selectedCompany]);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortStatus, setSortStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearchTerm);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearchTerm]);

  const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Product' },
    { id: 'company', numeric: false, disablePadding: false, label: 'Company' },
    { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
    { id: 'discount', numeric: true, disablePadding: false, label: 'Discount' },
    { id: 'Likes', numeric: true, disablePadding: false, label: 'Likes' },
    { id: 'Clicks', numeric: true, disablePadding: false, label: 'Clicks' },
    { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  ];

  const getStatus = (end, deleted) => {
    try {
      const endDate = end ? dayjs(end) : null;
      const deletedDate = deleted ? dayjs(deleted) : null;

      if (deletedDate && endDate && deletedDate.isValid() && endDate.isValid() && deletedDate.isBefore(endDate)) {
        return 'Manually Deleted';
      }
      if (!endDate || !endDate.isValid()) {
        return deletedDate ? 'Manually Deleted' : 'Unknown';
      }
      return 'Ended';
    } catch (error) {
      console.error('Error determining status:', error);
      return 'Error';
    }
  };

  const filteredProducts = useMemo(() => {
    try {
      let result = Array.isArray(allProducts) ? [...allProducts] : [];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(product => {
          const name = product.name?.toLowerCase() || '';
          const company = product.company?.toLowerCase() || '';
          return name.includes(term) || company.includes(term);
        });
      }

      if (sortStatus) {
        result = result.filter(product => {
          const productStatus = getStatus(product.endDate, product.deletedAt);
          return productStatus === sortStatus;
        });
      }

      return result;
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }, [allProducts, searchTerm, sortStatus]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredProducts.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (id) => {
    try {
      const clickedProduct = filteredProducts.find(product => product.id === id);
      if (!clickedProduct) {
        throw new Error('Product not found');
      }
      const selected={ ...clickedProduct, status: getStatus(clickedProduct.endDate, clickedProduct.deletedAt) };
      setSelectedProduct(selected);
      console.log('Selected product:', selected);
    } catch (error) {
      console.error('Error handling row click:', error);
      setError('Failed to load product details');
      setSnackbarOpen(true);
    }
  };

  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();
    
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteSelected = () => {
    try {
      if (selected.length === 0) {
        return;
      }
      
      setAllProducts(prevProducts =>
        prevProducts.filter(product => !selected.includes(product.id))
      );
      setSelected([]);
    } catch (error) {
      console.error('Error deleting products:', error);
      setError('Failed to delete selected products');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteProduct = (productId) => {
    try {
      setAllProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
      setSnackbarOpen(true);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredProducts.length) : 0;

  const visibleRows = useMemo(() => {
    try {
      return [...filteredProducts]
        .sort((a, b) => {
          // Handle cases where properties might be undefined
          const aValue = a[orderBy] || '';
          const bValue = b[orderBy] || '';
          
          if (orderBy === 'Likes' || orderBy === 'Clicks' || orderBy === 'discount' || orderBy === 'price') {
            const aNum = Number(aValue) || 0;
            const bNum = Number(bValue) || 0;
            return order === 'asc' ? aNum - bNum : bNum - aNum;
          }
          
          if (orderBy === 'status') {
            const aStatus = getStatus(a.endDate, a.deletedAt);
            const bStatus = getStatus(b.endDate, b.deletedAt);
            return order === 'asc' ? aStatus.localeCompare(bStatus) : bStatus.localeCompare(aStatus);
          }
          
          return order === 'asc' 
            ? String(aValue).localeCompare(String(bValue)) 
            : String(bValue).localeCompare(String(aValue));
        })
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    } catch (error) {
      console.error('Error sorting products:', error);
      return [];
    }
  }, [filteredProducts, order, orderBy, page, rowsPerPage]);


    function EnhancedTableToolbar({ numSelected }) {
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: alpha('#9766ff', 0.1),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ 
              flex: '1 1 100%',
              fontWeight: 'bold',
              color: '#9766ff',
              fontSize: '1.25rem',
            }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ 
              flex: '1 1 100%',
              fontWeight: 'bold',
              color: '#9766ff',
              fontSize: '1.25rem',
            }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Deleted Promotions Table
          </Typography>
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={handleDeleteSelected}>
              <DeleteIcon sx={{ color: 'red' }}/>
            </IconButton>
          </Tooltip>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search product"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { 
                    borderColor: 'primary.main',
                    borderWidth: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {isSearching && <CircularProgress size={20} />}
                    {searchInput && !isSearching && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchInput('')}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={sortStatus}
                label="Status"
                onChange={(e) => setSortStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Ended">Ended</MenuItem>
                <MenuItem value="Manually Deleted">Manually Deleted</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}
      </Toolbar>
    );
  }


  function EnhancedTableHead({
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    canDelete
  }) {
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead sx={{ backgroundColor: '#f3e8ff' }}>
        <TableRow>
          <TableCell padding="checkbox">
            {canDelete && <Checkbox
              sx={{
                color: '#9766ff',
                '&.Mui-checked': { color: '#9766ff' },
                '&.MuiCheckbox-indeterminate': { color: '#9766ff' },
              }}
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all products' }}
            />}
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  const formatPrice = (price) => {
    try {
      const numPrice = Number(price) || 0;
      return new Intl.NumberFormat('en-DZ', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numPrice) + ' DA';
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0.00 DA';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Ended':
        return { color: '#4caf50', fontWeight: 'bold', backgroundColor: '#e8f5e9', padding: '4px 8px', borderRadius: '4px' };
      case 'Manually Deleted':
        return { color: '#ff9800', fontWeight: 'bold', backgroundColor: '#fff3e0', padding: '4px 8px', borderRadius: '4px' };
      case 'Error':
      case 'Unknown':
        return { color: '#f44336', fontWeight: 'bold', backgroundColor: '#ffebee', padding: '4px 8px', borderRadius: '4px' };
      default:
        return { padding: '4px 8px', borderRadius: '4px' };
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredProducts.length}
              canDelete={permissions.canDelete } 
            />
            <TableBody>
              {visibleRows.length > 0 ? (
                visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const status = getStatus(row.endDate, row.deletedAt);
                  const imageUrl = row.image || defaultProduct;

                  return (
                    <TableRow
                      hover
                      onClick={() => handleRowClick(row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={`${row.id}-${index}`} 
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        {permissions.canDelete  && <Checkbox
                          sx={{
                            color: '#9766ff',
                            '&.Mui-checked': { color: '#9766ff' },
                          }}
                          checked={isItemSelected}
                          onClick={(event) => handleCheckboxClick(event, row.id)}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />}
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar 
                            src={imageUrl} 
                            alt={row.name} 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              borderRadius: '4px'
                            }}
                            variant="square"
                          />
                          <div className='truncate-text'>{row.name || 'Unnamed Product'}</div>
                        </div>
                      </TableCell>
                      <TableCell align="left"><div className='truncate-text'>{row.company || '-'}</div></TableCell>
                      <TableCell align="left">{formatPrice(row.price)}</TableCell>
                      <TableCell align="right" sx={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                        {row.discount || 0}%
                      </TableCell>
                      <TableCell align="right">{row.Likes || 0} <FavoriteIcon sx={{ color: '#9766ff', verticalAlign: 'middle' }} /></TableCell>
                      <TableCell align="right">{row.Clicks || 0}</TableCell>
                      <TableCell align="left" sx={{padding: '2px 4px', borderRadius: '4px'}}>
                        <Box align="center" style={getStatusStyle(status)}>{status}</Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    {filteredProducts.length === 0 ? 'No deleted promotions found' : 'No results match your search'}
                  </TableCell>
                </TableRow>
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 0,
          borderRadius: 2,
          outline: 'none'
        }}>
          {selectedProduct && (
            <DeletedProductRowPopup
              selectedProduct={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onDelete={handleDeleteProduct}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};



export default DeletedPromotionTable;