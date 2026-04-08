import React, { useState, useEffect } from "react";
import {
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Box,
  Snackbar,
  TextField,
  FormHelperText,
  ListSubheader
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import "./AddPromotionForm.css";
import { productAPI } from '@shared/api';

const AddPromotionForm = ({ userId, assignedCompany, isAllCompanies }) => {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await productAPI.getCategories();
        setCategoriesList(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);
  const [formData, setFormData] = useState({
    title: "",
    brand: isAllCompanies ? "" : assignedCompany?.companyName || "",
    userId: userId,
    link: "",
    category: [],
    _categoryId: null,
    _subCategoryId: null,
    _categoryLabel: '',
    description: "",
    images: [],
    discount: "",
    price: "",
    startDate: null,
    endDate: null,
  });

  const [errors, setErrors] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    // value is an array of subcategory IDs (multi-select)
    const selectedIds = typeof value === 'string' ? value.split(',') : value;
    const firstId = selectedIds[0] || null;
    const parentCat = firstId ? categoriesList.find(g =>
      g.subcategoriesData?.some(s => s.id === firstId)
    ) : null;
    setFormData((prev) => ({
      ...prev,
      category: selectedIds,
      _categoryId: parentCat?.id || null,
      _subCategoryId: firstId,
      _subCategoryIds: selectedIds,
    }));
  };
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleImageUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const MAX_IMAGES = 5;
    const MAX_SIZE_MB = 2;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const totalFiles = [...formData.images, ...selectedFiles];

    if (totalFiles.length > MAX_IMAGES) {
      setErrors((prev) => ({ ...prev, images: `You can upload up to ${MAX_IMAGES} images.` }));
      return;
    }

    const invalidFile = selectedFiles.find(file => file.size > MAX_SIZE_BYTES);
    if (invalidFile) {
      setErrors((prev) => ({ ...prev, images: `Each image must be smaller than ${MAX_SIZE_MB}MB.` }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: totalFiles,
    }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const discountRegex = /^(\d{1,2}|100)(%)?$/;
    const priceRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.brand.trim()) newErrors.brand = "Company is required.";
    if (!formData.link.trim()) {
      newErrors.link = "Link is required.";
    } else if (!isValidURL(formData.link.trim())) {
      newErrors.link = "Enter a valid URL (e.g., https://example.com)";
    }
    if (formData.category.length === 0) newErrors.category = "Category is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (formData.images.length === 0) newErrors.images = "At least one image is required.";
    if (!formData.discount.trim()) {
      newErrors.discount = "Discount is required.";
    } else if (!discountRegex.test(formData.discount.trim())) {
      newErrors.discount = "Enter a valid percentage (1–100%)";
    }
    const price = formData.price.trim();

    if (!price) {
      newErrors.price = "Price is required.";
    } else if (!priceRegex.test(price)) {
      newErrors.price = "Enter a valid price (e.g., 100 DA or 100.50)";
    }

    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    else if (formData.startDate && formData.endDate && formData.startDate.isAfter(formData.endDate)) {
      newErrors.endDate = "End date must be after start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Determine the company
      const selectedCompany = isAllCompanies 
        ? assignedCompany.find(c => c.companyName === formData.brand)
        : assignedCompany;

      // Convert image files to base64 strings
      const imagePromises = formData.images.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      const base64Images = await Promise.all(imagePromises);

      // Build JSON body with correct field names for the backend
      const body = {
        name: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        link: formData.link,
        categoryId: formData._categoryId,
        subCategoryId: formData._subCategoryId,
        subCategoryIds: formData._subCategoryIds || [],
        companyId: selectedCompany?.companyID || selectedCompany?.id || null,
        images: base64Images,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        expiresAt: formData.endDate ? formData.endDate.toISOString() : null,
      };

      // Make API call with JSON body
      const response = await productAPI.create(body);
      if (!response || response.status >= 400) {
        throw new Error('Submission failed');
      }

      // Show success message
      setShowSnackbar(true);
      
      // Reset form after successful submission
      setFormData({
        title: "",
        brand: isAllCompanies ? "" : assignedCompany?.companyName || "",
        userId: userId,
        link: "",
        category: [],
        _categoryId: null,
        _subCategoryId: null,
        _categoryLabel: '',
        description: "",
        images: [],
        discount: "",
        price: "",
        startDate: null,
        endDate: null,
      });

    } catch (error) {
      console.error('Error submitting promotion:', error);
      setErrors(prev => ({
        ...prev,
        submitError: 'Failed to submit promotion. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="promotion-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Add New Promotion</h2>

      <div className="form-row">
        <TextField
          fullWidth
          name="title"
          label="Promotion Title"
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
        />

        {isAllCompanies ? (
          <FormControl fullWidth error={!!errors.brand}>
            <InputLabel>Select Company</InputLabel>
            <Select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              input={<OutlinedInput label="Select Company" />}
            >
              <MenuItem value=""><em>Select Company</em></MenuItem>
              {assignedCompany.map((company, idx) => (
                <MenuItem key={idx} value={company.companyName}>
                  {company.companyName}
                </MenuItem>
              ))}
            </Select>
            {errors.brand && <FormHelperText>{errors.brand}</FormHelperText>}
          </FormControl>
        ) : (
          <TextField 
            fullWidth 
            value={assignedCompany?.companyName || ""} 
            label="Company" 
            disabled 
          />
        )}

        <TextField
          fullWidth
          name="link"
          label="Promotion Link"
          value={formData.link}
          onChange={handleChange}
          error={!!errors.link}
          helperText={errors.link}
        />


        <FormControl fullWidth error={!!errors.category}>
          <InputLabel id="category-label">Select Categories</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            multiple
            value={formData._subCategoryIds || formData.category || []}
            onChange={handleCategoryChange}
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

        <TextField
          fullWidth
          multiline
          rows={4}
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
        />

        <div className="upload-box">
          <input 
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isSubmitting}
          />
          <span>Upload Promotion Images (Required)</span>
          {errors.images && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errors.images}</p>}
          <div className="preview-images">
            {formData.images.map((file, index) => (
              <div key={index} className="preview-container">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="preview-thumbnail"
                />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <TextField
          name="discount"
          label="Discount (%)"
          value={formData.discount}
          onChange={handleChange}
          error={!!errors.discount}
          helperText={errors.discount}
          fullWidth
          disabled={isSubmitting}
        />

        <TextField
          name="price"
          label="Price (DA)"
          value={formData.price}
          onChange={handleChange}
          error={!!errors.price}
          helperText={errors.price}
          fullWidth
          disabled={isSubmitting}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Start Date"
            value={formData.startDate}
            onChange={(newValue) =>
              setFormData((prev) => ({ ...prev, startDate: newValue }))
            }
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                error={!!errors.startDate} 
                helperText={errors.startDate} 
                disabled={isSubmitting}
              />
            )}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
              seconds: renderTimeViewClock,
            }}
            disabled={isSubmitting}
          />

          <DateTimePicker
            label="End Date"
            value={formData.endDate}
            onChange={(newValue) =>
              setFormData((prev) => ({ ...prev, endDate: newValue }))
            }
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                error={!!errors.endDate} 
                helperText={errors.endDate} 
                disabled={isSubmitting}
              />
            )}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
              seconds: renderTimeViewClock,
            }}
            disabled={isSubmitting}
          />
        </LocalizationProvider>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>

      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setShowSnackbar(false)} severity="success">
          Promotion submitted successfully!
        </MuiAlert>
      </Snackbar>

      {errors.submitError && (
        <Snackbar open={!!errors.submitError} autoHideDuration={3000} onClose={() => setErrors(prev => ({ ...prev, submitError: '' }))}>
          <MuiAlert elevation={6} variant="filled" severity="error">
            {errors.submitError}
          </MuiAlert>
        </Snackbar>
      )}
    </form>
  );
};

export default AddPromotionForm;