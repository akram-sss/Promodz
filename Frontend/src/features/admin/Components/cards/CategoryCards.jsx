import React from 'react';
import './CategoryCards.css';

import PropTypes from 'prop-types';

const CategoryCards = ({ categories = [],totalPromotions }) => {
    console.log( "categories", categories);
  // Safely calculate totals with default empty array
  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + (cat?.subcategories?.length || 0), 
    0
  );
  const activeCategories = categories.filter(cat => cat?.total > 0).length;

  return (
    <div className="promotion-categories-container">
      {/* Header Section */}
      <div className="categories-header">
        <h1>Promotion Categories Analytics</h1>
        <p>Overview of promotions across all product categories</p>
      </div>

      {/* Summary Cards - Only show if we have categories */}
      {categories.length > 0 && (
        <div className="summary-grid">
          <div className="summary-card purple-gradient">
            <h3>Total Categories</h3>
            <p>{categories.length}</p>
            <span>All main categories</span>
          </div>
          <div className="summary-card purple-light">
            <h3>Active Categories</h3>
            <p>{activeCategories}</p>
            <span>With promotions</span>
          </div>
          <div className="summary-card purple-dark">
            <h3>Total Subcategories</h3>
            <p>{totalSubcategories}</p>
            <span>All subcategories</span>
          </div>
          <div className="summary-card purple-gradient">
            <h3>Total Promotions</h3>
            <p>{totalPromotions}</p>
            <span>Across all categories</span>
          </div>
        </div>
      )}

      {/* Main Categories Section */}
      <div className="section">
        <h2 className="section-title">Main Categories</h2>
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((category, i) => (
              <div 
                key={i} 
                className={`category-card ${category?.total > 0 ? 'has-promotions' : ''}`}
              >
                <h3>{category?.category || 'Unnamed Category'}</h3>
                <p className="count">{category?.total || 0}</p>
                <p className="label">promotions</p>
                {category?.total > 0 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${((category.total || 0) / totalPromotions) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">No categories available</p>
        )}
      </div>

      {/* Subcategories Section */}
      <div className="section">
        <h2 className="section-title">Subcategories Breakdown</h2>
        {categories.length > 0 ? (
          <div className="subcategories-container">
            {categories.map(category => (
              <div key={category?.category || `category-${Math.random()}`} className="subcategory-group">
                <h3 className="subcategory-header">
                  {category?.category || 'Unnamed Category'} 
                  <span>({category?.total || 0} promotions)</span>
                </h3>
                <div className="subcategories-grid">
                  {(category?.subcategories || []).map((subcat, i) => (
                    <div 
                      key={i} 
                      className={`subcategory-card ${subcat?.count > 0 ? 'has-promotions' : ''}`}
                    >
                      <h4>{subcat?.name || 'Unnamed Subcategory'}</h4>
                      <p className="count">{subcat?.count || 0}</p>
                      <p className="label">promotions</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">No subcategories available</p>
        )}
      </div>
    </div>
  );
};

// Prop validation
CategoryCards.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      total: PropTypes.number,
      subcategories: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          count: PropTypes.number
        })
      )
    })
  )
};

// Default props
CategoryCards.defaultProps = {
  categories: []
};

export default CategoryCards;
