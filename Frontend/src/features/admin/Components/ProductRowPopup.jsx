import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Divider, IconButton,
  TextField, InputAdornment, Alert, Collapse, Paper, Chip,
  CircularProgress
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { 
  ChevronLeft, ChevronRight, Save, X, Edit, Trash2, 
  Percent, DollarSign, Link as LinkIcon, Upload
} from 'lucide-react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from '@mui/material';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  ListSubheader
} from '@mui/material';
import { productAPI } from '@shared/api';

// Helper function to ensure product has all required fields
const normalizeProduct = (product) => {
  if (!product) return null;
  return {
    id: product.id ?? 0,
    name: product.name ?? '',
    company: product.company ?? '',
    companyID: product.companyID ?? product.companyId ?? null,
    category: Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []),
    price: Number(product.price) || 0,
    discount: Number(product.discount) || 0,
    Likes: Number(product.Likes ?? product.likes) || 0,
    Clicks: Number(product.Clicks ?? product.clicks) || 0,
    Link: product.Link ?? product.link ?? '',
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [],
    startDate: product.startDate ?? new Date().toISOString(),
    endDate: product.endDate ?? dayjs().add(7, 'day').toISOString(),
    description: product.description ?? '',
    rating: Number(product.rating) || 0,
    createdByID: product.createdByID ?? product.createdById ?? null,
    editedByID: product.editedByID ?? product.editedByIds ?? [],
    _categoryId: product._categoryId ?? product.categoryId ?? null,
    _subCategoryId: product._subCategoryId ?? product.subCategoryId ?? null,
    ...product
  };
};

const ProductRowPopup = ({ selectedProduct, onSave, onDelete, onClose, permissions = {} }) => {
  // Load categories from API
  const [categoriesList, setCategoriesList] = useState([]);
  useEffect(() => {
    const loadCats = async () => {
      try {
        const cats = (await productAPI.getCategories()).data;
        setCategoriesList(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCats();
  }, []);
  const safePermissions = permissions || {
    canEdit: false,
    canDelete: false,
    canAdd: false
  };
  
  const { canEdit = false, canDelete = false } = safePermissions;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(() => normalizeProduct(selectedProduct));
  const [saveError, setSaveError] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    setErrors({});
    setSaveError(null);
    setCurrentImageIndex(0);
    const normalized = normalizeProduct(selectedProduct);
    setEditedProduct(normalized);
    setEditing(false);
  }, [selectedProduct]);

  // If product is not valid, show error state
  if (!selectedProduct || !editedProduct) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Unable to load product details</Typography>
        {onClose && (
          <Button onClick={onClose} sx={{ mt: 2 }}>Close</Button>
        )}
      </Paper>
    );
  }


  const formatDate = (date) => {
    if (!date) return 'Not set';
    return dayjs(date).format('MMM D, YYYY h:mm A');
  };

  const getStatus = () => {
    const now = dayjs();
    const startDate = dayjs(editedProduct.startDate);
    
    if (now.isBefore(startDate)) return 'Scheduled';
    return 'Active';
  };

  const getStatusColor = () => {
    return getStatus() === 'Active' ? 'success' : 'warning';
  };

  const handleNextImage = () => {
    if (editedProduct.images && editedProduct.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === editedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (editedProduct.images && editedProduct.images.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? editedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const handleEditClick = () => {
    setEditing(true);
    setEditedProduct(normalizeProduct(selectedProduct));
  };

  const handleSaveClick = () => {
    const newErrors = {};
    if (!editedProduct.name || editedProduct.name.trim() === '') newErrors.name = 'Name is required';
    if (!editedProduct.category || editedProduct.category.length === 0) newErrors.category = 'Category is required';
    if (!editedProduct.price || editedProduct.price <= 0) newErrors.price = 'Price must be positive';
    if (editedProduct.discount < 0 || editedProduct.discount > 100) newErrors.discount = 'Discount must be between 0-100';
    if (!editedProduct.Link || editedProduct.Link.trim() === '') newErrors.Link = 'Promotion link is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Images are already base64 or existing URLs — send as-is
    const productToSave = {
      ...editedProduct,
      images: editedProduct.images || []
    };

    onSave(productToSave);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedProduct(normalizeProduct(selectedProduct));
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field, date) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: date.toISOString()
    }));
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    window.open(selectedProduct.Link, '_blank');
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImageUploading(true);
    try {
      const base64Promises = Array.from(files).map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      const newImages = await Promise.all(base64Promises);
      setEditedProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    } catch (err) {
      console.error('Failed to read images:', err);
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    if (!editedProduct.images || !editedProduct.images[index]) return;
    
    setEditedProduct(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
    
    // Adjust current image index if needed
    if (currentImageIndex >= (editedProduct.images?.length || 1) - 1) {
      setCurrentImageIndex(Math.max(0, (editedProduct.images?.length || 1) - 2));
    }
  };

  // Get current image safely
  const currentImage = editedProduct.images && editedProduct.images.length > 0 
    ? editedProduct.images[currentImageIndex] 
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={3} sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '500px',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#9766ff' }}>
            Promotion Details
          </Typography>
          <Chip 
            label={getStatus()}
            color={getStatusColor()}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Collapse in={!!saveError}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {saveError}
          </Alert>
        </Collapse>

        <Box sx={{
          overflowY: 'auto',
          maxHeight: '60vh',
          px: 1,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb': { background: '#9766ff', borderRadius: '10px' },
        }}>
          {/* Image Carousel */}
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            borderRadius: '8px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: 1
          }}>
            {currentImage ? (
              <>
                <img 
                  src={currentImage} 
                  alt={editedProduct.name || 'Product'} 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }} 
                />
                {editing && (
                  <IconButton 
                    onClick={() => handleRemoveImage(currentImageIndex)}
                    sx={{ 
                      position: 'absolute', 
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255,0,0,0.7)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,0,0,0.9)' }
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No images available
              </Typography>
            )}
            
            {editedProduct.images && editedProduct.images.length > 1 && (
              <>
                <IconButton 
                  onClick={handlePrevImage}
                  sx={{ 
                    position: 'absolute', 
                    left: 8,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                  }}
                >
                  <ChevronLeft size={24} />
                </IconButton>
                <IconButton 
                  onClick={handleNextImage}
                  sx={{ 
                    position: 'absolute', 
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                  }}
                >
                  <ChevronRight size={24} />
                </IconButton>
              </>
            )}
          </Box>

          {/* Image Upload */}
          {editing && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload size={18} />}
                disabled={imageUploading}
                fullWidth
              >
                Add Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {imageUploading && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>Uploading...</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Thumbnails */}
          {editedProduct.images && editedProduct.images.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 3
            }}>
              {editedProduct.images.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  sx={{
                    position: 'relative',
                    width: '50px',
                    height: '50px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    border: index === currentImageIndex ? '2px solid' : '1px solid',
                    borderColor: index === currentImageIndex ? '#9766ff' : 'divider',
                    opacity: index === currentImageIndex ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {editing && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '2px',
                        backgroundColor: 'rgba(255,0,0,0.7)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,0,0,0.9)' }
                      }}
                    >
                      <X size={14} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          )}
          
          {/* Product Info */}
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: '8px',
            border: '1px solid #9766ff',
            p: 2,
            mb: 2,
            boxShadow: 1
          }}>
            {editing ? (
              <TextField
                fullWidth
                label="Product Name"
                value={editedProduct.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {editedProduct.name || 'Unnamed Product'}
              </Typography>
            )}

            {/* Company Info */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 500 }}>
              Company: {editedProduct.company || 'Unknown'}
            </Typography>
            
            {editing ? (
                <FormControl fullWidth error={!!errors.category} sx={{ mb: 2 }}>
                  <InputLabel id="edit-category-label">Select Categories</InputLabel>
                  <Select
                    labelId="edit-category-label"
                    id="edit-category"
                    multiple
                    value={editedProduct._subCategoryIds || editedProduct.subCategoryIds || []}
                    onChange={(e) => {
                      const selectedIds = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      const firstId = selectedIds[0] || null;
                      const parentCat = firstId ? categoriesList.find(g =>
                        g.subcategoriesData?.some(s => s.id === firstId)
                      ) : null;
                      const names = selectedIds.map(subId => {
                        const group = categoriesList.find(g => g.subcategoriesData?.some(s => s.id === subId));
                        return group?.subcategoriesData?.find(s => s.id === subId)?.name || '';
                      }).filter(Boolean);
                      setEditedProduct(prev => ({
                        ...prev,
                        _categoryId: parentCat?.id || null,
                        _subCategoryId: firstId,
                        _subCategoryIds: selectedIds,
                        category: names,
                      }));
                    }}
                    input={<OutlinedInput label="Select Categories" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected || []).map((subId) => {
                          const group = categoriesList.find(g => g.subcategoriesData?.some(s => s.id === subId));
                          const subName = group?.subcategoriesData?.find(s => s.id === subId)?.name || subId;
                          return <Chip key={subId} label={subName} size="small" sx={{ color: 'black' }} />;
                        })}
                      </Box>
                    )}
                  >
                    {categoriesList.map((group) => [
                      <ListSubheader key={group.name}>{group.name}</ListSubheader>,
                      ...(group.subcategoriesData || []).map((subcat) => (
                        <MenuItem key={subcat.id} value={subcat.id} style={{ color: 'black' }}>
                          {subcat.name}
                        </MenuItem>
                      ))
                    ])}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {editedProduct.category?.join(', ') || 'No categories'}
              </Typography>
            )}

            {/* Description - Editable */}
            {editing ? (
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editedProduct.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                sx={{ mb: 2 }}
              />
            ) : (
              editedProduct.description && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {editedProduct.description}
                </Typography>
              )
            )}
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <FavoriteIcon sx={{ color: '#9766ff', verticalAlign: 'middle' }} /> {editedProduct.Likes || 0} 
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              Clicks: {editedProduct.Clicks || 0} 
            </Typography>
            
            {/* Promotion Link */}
            {!editing && editedProduct.Link && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }} onClick={handleLinkClick}>
                <LinkIcon size={16} style={{ marginRight: '8px', color: '#9766ff' }} />
                <Typography variant="body2" color="primary">
                  Visit Promotion
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Pricing Section */}
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: '8px',
            border: '1px solid #9766ff',
            p: 2,
            mb: 2,
            boxShadow: 1
          }}>
            {editing ? (
              <>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={editedProduct.price || 0}
                  onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DollarSign size={18} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Discount (%)"
                  type="number"
                  value={editedProduct.discount || 0}
                  onChange={(e) => handleFieldChange('discount', parseInt(e.target.value) || 0)}
                  error={!!errors.discount}
                  helperText={errors.discount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Percent size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="body1">Price:</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    ${(editedProduct.price || 0).toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="body1">Discount:</Typography>
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    {editedProduct.discount || 0}%
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          
          {/* Date Section */}
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: '8px',
            border: '1px solid #9766ff',
            p: 2,
            mb: 2,
            boxShadow: 1
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Promotion Period
            </Typography>
            
            {editing ? (
              <>
                <DateTimePicker
                  label="Start Date"
                  value={editedProduct.startDate ? dayjs(editedProduct.startDate) : dayjs()}
                  onChange={(date) => handleDateChange('startDate', date)}
                  sx={{ width: '100%', mb: 2 }}
                />
                
                <DateTimePicker
                  label="End Date"
                  value={editedProduct.endDate ? dayjs(editedProduct.endDate) : dayjs().add(7, 'day')}
                  onChange={(date) => handleDateChange('endDate', date)}
                  sx={{ width: '100%' }}
                />
              </>
            ) : (
              <>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Starts
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(editedProduct.startDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ends
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(editedProduct.endDate)}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          
          {/* Promotion Link (Editable) */}
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: '8px',
            border: '1px solid #9766ff',
            p: 2,
            mb: 2,
            boxShadow: 1
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Promotion Link
            </Typography>
            
            {editing ? (
              <TextField
                fullWidth
                label="Promotion URL"
                value={editedProduct.Link || ''}
                onChange={(e) => handleFieldChange('Link', e.target.value)}
                placeholder="https://example.com/promotion"
                error={!!errors.Link}
                helperText={errors.Link}
              />
            ) : (
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {editedProduct.Link ? (
                  <Link 
                    href={editedProduct.Link} 
                    target="_blank" 
                    rel="noopener"
                    className='view-product-link'
                    sx={{ display: 'flex', alignItems: 'center', color: '#9766ff' }}
                  >
                    {editedProduct.Link}
                  </Link>
                ) : (
                  <Typography color="text.secondary">No link provided</Typography>
                )}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1, 
          mt: 2,
          pt: 2,
          borderTop: '1px solid #e0e0e0'
        }}>
          {editing ? (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleCancelEdit}
                startIcon={<X size={18} />}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: '#9766ff', '&:hover': { backgroundColor: '#7c4dff' } }}
                onClick={handleSaveClick}
                startIcon={<Save size={18} />}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              {canDelete && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => onDelete(editedProduct.id)}
                  startIcon={<Trash2 size={18} />}
                >
                  Delete
                </Button>
              )}
              {canEdit && (
                <Button 
                  variant="contained" 
                  sx={{ backgroundColor: '#9766ff', '&:hover': { backgroundColor: '#7c4dff' } }}
                  onClick={handleEditClick}
                  startIcon={<Edit size={18} />}
                >
                  Edit
                </Button>
              )}
            </>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProductRowPopup;