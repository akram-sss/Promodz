import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel,
  Toolbar, Typography, Paper, Checkbox, IconButton,
  Tooltip, TextField, InputAdornment,
  useMediaQuery, useTheme, Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ProductRowPopup from './ProductRowPopup';
import { userAPI } from '@shared/api';
import { Link } from 'react-router-dom';
import { useUserInteractions } from '@context/UserInteractionsContext';
import './ProductTable.css';

// Custom debounce hook
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

function EnhancedTableHead({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  headCells
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead className="user-table-header">
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            className="user-checkbox"
            sx={{
              color: '#9766ff',
              '&.Mui-checked': { color: '#9766ff' },
              '&.MuiCheckbox-indeterminate': { color: '#9766ff' },
            }}
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all products' }}
          />
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

function EnhancedTableToolbar({ numSelected, onDeleteSelected, searchTerm, onSearchChange, isMobile, totalCount }) {
  if (isMobile) {
    return (
      <Box className="fav-mobile-toolbar">
        {numSelected > 0 ? (
          <Box className="fav-mobile-toolbar-selected">
            <Typography sx={{ fontWeight: 700, color: '#9766ff', fontSize: '0.9rem' }}>
              {numSelected} selected
            </Typography>
            <Tooltip title="Remove from favorites">
              <IconButton onClick={onDeleteSelected} size="small" sx={{ color: '#ef4444' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={onSearchChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8f6ff',
                fontSize: '0.85rem',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'rgba(151, 102, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#9766ff', borderWidth: 1.5 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9766ff', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <Toolbar
      className={numSelected > 0 ? 'user-table-toolbar user-table-toolbar-selected' : 'user-table-toolbar'}
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%', fontWeight: 'bold', color: '#9766ff', fontSize: '1.25rem' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%', fontWeight: 'bold', color: '#9766ff', fontSize: '1.25rem' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Your Liked Promotions
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Remove from favorites">
          <IconButton onClick={onDeleteSelected}>
            <DeleteIcon sx={{ color: 'red' }}/>
          </IconButton>
        </Tooltip>
      ) : (
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search your liked promotions"
          value={searchTerm}
          onChange={onSearchChange}
          className="user-search-input"
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '& fieldset': { borderColor: 'rgba(151, 102, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(151, 102, 255, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#9766ff', borderWidth: 2 },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#9766ff' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
    </Toolbar>
  );
}

const ProductTable = ({ allProducts: initialProducts = [], setAllProducts: parentSetProducts }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [allProducts, setAllProductsLocal] = useState(initialProducts);
  const setAllProducts = parentSetProducts || setAllProductsLocal;

  useEffect(() => { setAllProductsLocal(initialProducts); }, [initialProducts]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { isFollowingCompany, setFollowing: syncFollowing, setFavorite: syncFavorite } = useUserInteractions();
  const [followLoading, setFollowLoading] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Promotion' },
    { id: 'company', numeric: false, disablePadding: false, label: 'Company' },
    { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
    { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
    { id: 'discount', numeric: true, disablePadding: false, label: 'Discount' },
    { id: 'Likes', numeric: true, disablePadding: false, label: 'Likes' },
  ];

  const tabletHeadCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Promotion' },
    { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
    { id: 'discount', numeric: true, disablePadding: false, label: 'Discount' },
  ];

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(product => product.isLiked);

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (Array.isArray(product.category) 
          ? product.category.some(cat => cat.toLowerCase().includes(term))
          : product.category.toLowerCase().includes(term)) ||
        product.company.toLowerCase().includes(term)
      );
    }

    return result;
  }, [allProducts, debouncedSearchTerm]);

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
    const clickedProduct = filteredProducts.find(product => product.id === id);
    setSelectedProduct(clickedProduct);
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

  const handleDeleteSelected = async () => {
    // Remove from favorites via API
    for (const productId of selected) {
      try {
        await userAPI.toggleFavorite(productId);
      } catch (err) {
        console.error('Error removing favorite:', err);
      }
    }
    setAllProducts(prevProducts =>
      prevProducts.filter(product => !selected.includes(product.id))
    );
    selected.forEach((productId) => syncFavorite(productId, false));
    if (selectedProduct && selected.includes(selectedProduct.id)) {
      setSelectedProduct(null);
    }
    setSelected([]);
  };

  const handleFollowCompany = async (companyId) => {
    if (followLoading) return;
    setFollowLoading(companyId);
    try {
      const currentlyFollowing = isFollowingCompany(companyId);
      if (currentlyFollowing) {
        await userAPI.unfollowCompany(companyId);
      } else {
        await userAPI.followCompany(companyId);
      }
      syncFollowing(companyId, !currentlyFollowing);
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleLikeChange = async (productId, nextLiked, nextLikesCount) => {
    const previousProduct = allProducts.find((product) => product.id === productId);
    const previousLiked = Boolean(previousProduct?.isLiked);
    const previousLikesCount = Number(previousProduct?.Likes ?? 0);

    setAllProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? {
              ...product,
              isLiked: nextLiked,
              Likes: nextLikesCount,
            }
          : product
      )
    );

    setSelectedProduct(prev =>
      prev && prev.id === productId
        ? { ...prev, isLiked: nextLiked, Likes: nextLikesCount }
        : prev
    );

    if (!nextLiked) {
      setSelected((prevSelected) => prevSelected.filter((id) => id !== productId));
      setSelectedProduct((prev) => (prev && prev.id === productId ? null : prev));
    }

    try {
      await userAPI.toggleFavorite(productId);
      syncFavorite(productId, nextLiked);
    } catch (err) {
      console.error('Error toggling favorite:', err);

      setAllProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                isLiked: previousLiked,
                Likes: previousLikesCount,
              }
            : product
        )
      );

      setSelectedProduct((prev) =>
        prev && prev.id === productId
          ? { ...prev, isLiked: previousLiked, Likes: previousLikesCount }
          : prev
      );
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredProducts.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...filteredProducts]
        .sort((a, b) => {
          if (orderBy === 'Likes') {
            return order === 'asc' ? a.Likes - b.Likes : b.Likes - a.Likes;
          }
          if (orderBy === 'discount') {
            return order === 'asc' ? a.discount - b.discount : b.discount - a.discount;
          }
          if (orderBy === 'price') {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
          }
          if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
            return order === 'asc' 
              ? a[orderBy].localeCompare(b[orderBy]) 
              : b[orderBy].localeCompare(a[orderBy]);
          }
          return 0;
        })
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredProducts, order, orderBy, page, rowsPerPage]
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) + ' DA';
  };

  const renderMobileCards = () => {
    if (visibleRows.length === 0) {
      return (
        <Box className="fav-empty-state">
          <FavoriteIcon sx={{ fontSize: 48, color: '#d8b4fe', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: '#6b21a8', fontSize: '1rem', mb: 0.5 }}>
            No favorites yet
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            Products you like will appear here
          </Typography>
        </Box>
      );
    }

    return visibleRows.map((row, index) => {
      const isItemSelected = isSelected(row.id);

      return (
        <div
          key={row.id}
          className={`fav-card${isItemSelected ? ' fav-card--selected' : ''}`}
          onClick={() => handleRowClick(row.id)}
        >
          {/* Discount badge */}
          {row.discount > 0 && (
            <span className="fav-card__discount">-{row.discount}%</span>
          )}

          {/* Select checkbox */}
          <Checkbox
            className="fav-card__checkbox"
            sx={{
              color: 'rgba(151,102,255,0.4)',
              '&.Mui-checked': { color: '#9766ff' },
              p: 0,
            }}
            checked={isItemSelected}
            onClick={(e) => handleCheckboxClick(e, row.id)}
            size="small"
          />

          {/* Product image */}
          <div className="fav-card__img-wrap">
            <img src={row.images?.[0]} alt={row.name} className="fav-card__img" />
          </div>

          {/* Info area */}
          <div className="fav-card__body">
            <p className="fav-card__name">{row.name}</p>
            <span className="fav-card__company">
              <StorefrontIcon sx={{ fontSize: 12 }} />
              {row.company}
            </span>

            {/* Bottom row: price + likes */}
            <div className="fav-card__footer">
              <span className="fav-card__price">{formatPrice(row.price)}</span>
              <span className="fav-card__likes">
                <FavoriteIcon sx={{ fontSize: 13 }} />
                {row.Likes}
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  if (isMobile) {
    return (
      <div className="fav-mobile-root">
        {/* Toolbar */}
        <EnhancedTableToolbar
          numSelected={selected.length}
          onDeleteSelected={handleDeleteSelected}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          isMobile={isMobile}
          totalCount={filteredProducts.length}
        />

        {/* Count + select-all row */}
        <div className="fav-mobile-meta">
          <span className="fav-mobile-count">{filteredProducts.length} promotion{filteredProducts.length !== 1 ? 's' : ''}</span>
          <label className="fav-mobile-select-all">
            <Checkbox
              size="small"
              sx={{ p: 0, mr: 0.5, color: '#9766ff', '&.Mui-checked': { color: '#9766ff' } }}
              indeterminate={selected.length > 0 && selected.length < filteredProducts.length}
              checked={filteredProducts.length > 0 && selected.length === filteredProducts.length}
              onChange={handleSelectAllClick}
            />
            Select all
          </label>
        </div>

        {/* Cards */}
        <div className="fav-mobile-list">
          {renderMobileCards()}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 5 && (
          <TablePagination
            className="fav-mobile-pagination"
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Show:"
          />
        )}

        {selectedProduct && (
          <ProductRowPopup
            selectedProduct={selectedProduct}
            onFollowCompany={handleFollowCompany}
            onLikeChange={handleLikeChange}
            isFollowing={isFollowingCompany(selectedProduct.companyID)}
            followLoading={followLoading === selectedProduct.companyID}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper className="user-product-table-container" sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length}
          onDeleteSelected={handleDeleteSelected}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          isMobile={isMobile}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: isTablet ? 500 : 750 }}
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
              headCells={isTablet ? tabletHeadCells : headCells}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={() => handleRowClick(row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    className={`user-table-row${isItemSelected ? ' selected' : ''}`}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        className="user-checkbox"
                        sx={{
                          color: '#9766ff',
                          '&.Mui-checked': { color: '#9766ff' },
                        }}
                        checked={isItemSelected}
                        onClick={(event) => handleCheckboxClick(event, row.id)}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={row.images[0]} 
                          alt={row.name} 
                          className="product-table-image"
                        />
                        <div className='truncate-text'>{row.name}</div>
                      </div>
                    </TableCell>
                    {!isTablet && (
                      <>
                        <TableCell align="left">
                          <Link 
                            to={`/products/${encodeURIComponent(row.company)}`}
                            tabIndex={-1}
                            onClick={(e) => e.stopPropagation()}
                            className="company-link"
                          >
                            <div className='truncate-text'>{row.company}</div>
                          </Link>
                        </TableCell>
                        <TableCell align="left">
                          <div className="category-cell">
                            {Array.isArray(row.category) 
                              ? row.category.map((cat, idx) => (
                                  <span key={idx} className="category-tag-table">{cat}</span>
                                ))
                              : <span className="category-tag-table">{row.category}</span>
                            }
                          </div>
                        </TableCell>
                      </>
                    )}
                    <TableCell align="right" className="price-cell">{formatPrice(row.price)}</TableCell>
                    <TableCell align="right">
                      <span className="discount-badge">{row.discount}%</span>
                    </TableCell>
                    {!isTablet && (
                      <TableCell align="right">
                        <div className="likes-cell">
                          {row.Likes} <FavoriteIcon sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={isTablet ? 4 : 7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className="user-table-pagination"
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {selectedProduct && (
        <ProductRowPopup
          selectedProduct={selectedProduct}
          onFollowCompany={handleFollowCompany}
          onLikeChange={handleLikeChange}
          isFollowing={isFollowingCompany(selectedProduct.companyID)}
          followLoading={followLoading === selectedProduct.companyID}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Box>
  );
};

export default ProductTable;