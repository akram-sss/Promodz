import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from '@mui/material';
import { 
 Link as LinkIcon
} from 'lucide-react';

const ImageContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
});

const ProductImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

const NavigationButton = styled(IconButton)({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255,255,255,0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});

const ThumbnailContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '8px',
});

const Thumbnail = styled('img')(({ active }) => ({
  width: '50px',
  height: '50px',
  objectFit: 'cover',
  borderRadius: '4px',
  cursor: 'pointer',
  border: active ? '2px solid #9766ff' : '1px solid #ddd',
  opacity: active ? 1 : 0.7,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 1,
  },
}));

const DetailItem = ({ label, value, color = 'black' }) => (
  <Typography variant="subtitle1" gutterBottom sx={{ color }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

const formatArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return 'N/A';
  return arr.join(', ');
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Manually Deleted':
      return '#ff9800';
    case 'Ended':
      return '#00b20fff';
    default:
      return '#9766ff';
  }
};


const DeletedProductRowPopup = ({ selectedProduct, onClose }) => {
  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const handleLinkClick = (e) => {
      e.stopPropagation();
      window.open(selectedProduct.link, '_blank');
    };
  
  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <Box sx={{ 
      p: 3, 
      position: 'relative',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      bgcolor: 'background.paper',
      borderRadius: '12px',
      boxShadow: 24,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 'bold', 
        color: '#9766ff',
        mb: 3,
        textAlign: 'center'
      }}>
        {selectedProduct.status === 'Manually Deleted' ? 'Deleted Promotion Details' : 'Ended Promotion Details'}
      </Typography>
      
      <Box sx={{ 
        overflowY: 'auto',
        flex: 1,
        px: 1,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#9766ff',
          borderRadius: '10px',
        },
      }}>
        {/* Image Carousel */}
        {selectedProduct.images?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <ImageContainer>
              <ProductImage 
                src={selectedProduct.images[currentImageIndex]} 
                alt={`${selectedProduct.name} ${currentImageIndex + 1}`} 
              />
              
              {selectedProduct.images.length > 1 && (
                <>
                  <NavigationButton 
                    onClick={handlePrev} 
                    sx={{ left: '8px' }}
                    aria-label="previous image"
                  >
                    <ChevronLeft size={24} />
                  </NavigationButton>
                  <NavigationButton 
                    onClick={handleNext} 
                    sx={{ right: '8px' }}
                    aria-label="next image"
                  >
                    <ChevronRight size={24} />
                  </NavigationButton>
                </>
              )}
            </ImageContainer>
            
            {selectedProduct.images.length > 1 && (
              <ThumbnailContainer>
                {selectedProduct.images.map((img, index) => (
                  <Thumbnail
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    active={index === currentImageIndex}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </ThumbnailContainer>
            )}
          </Box>
        )}
        
        {/* Product Details */}
        <Box sx={{ 
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          p: 2,
          mb: 2
        }}>
          {selectedProduct && (
            <>
              <DetailItem label="Product" value={selectedProduct.name} />
              <DetailItem label="Company" value={selectedProduct.company} />
              <DetailItem label="Category" value={formatArray(selectedProduct.category)} />
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
              <DetailItem
                label="Price"
                value={typeof selectedProduct.price === 'number' ? `$${selectedProduct.price.toFixed(2)}` : 'N/A'}
              />
              <DetailItem
                label="Discount"
                value={`${selectedProduct.discount ?? 0}%`}
                color="red"
              />
            </>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography component="span" sx={{ 
              fontWeight: 'bold', 
              mr: 1,
              color: 'black'
            }}>
              Likes: {selectedProduct.Likes}
            </Typography>
            <FavoriteIcon sx={{ color: '#9766ff', ml: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography component="span" sx={{ 
              fontWeight: 'bold', 
              mr: 1,
              color: 'black'
            }}>
              Clicks: {selectedProduct.Clicks}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ 
          backgroundColor: '#f5f5ff',
          borderRadius: '8px',
          p: 2,
          mb: 2
        }}>
          <DetailItem 
            label="Promotion Period" 
            value={`${formatDate(selectedProduct.startDate)} to ${formatDate(selectedProduct.endDate)}`} 
          />
          <DetailItem 
            label="Status" 
            value={selectedProduct.status || 'N/A'} 
            color={getStatusColor(selectedProduct.status)} 
          />

          
          <DetailItem 
            label="Deleted On" 
            value={formatDate(selectedProduct.deletedAt)} 
          />
        </Box>
      </Box>
      
      {/* Fixed Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        pt: 2,
        gap: 2,
        flexShrink: 0
      }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{
            backgroundColor: '#9766ff',
            '&:hover': {
              backgroundColor: '#7c4dff',
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default DeletedProductRowPopup;