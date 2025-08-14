import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaStar, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { getProduct } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItemToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    setAddingToCart(true);
    const result = await addItemToCart(id, quantity);
    setAddingToCart(false);

    if (result.success) {
      setQuantity(1);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-skeleton">
            <div className="product-images-skeleton">
              <Skeleton height={400} />
            </div>
            <div className="product-info-skeleton">
              <Skeleton height={40} width="70%" />
              <Skeleton height={20} width="50%" />
              <Skeleton height={30} width="30%" />
              <Skeleton height={100} count={3} />
              <Skeleton height={50} width="200px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="error-page">
          <h2>Product not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.map(img => ({
    original: `http://localhost:3000/${img.image_url}`,
    thumbnail: `http://localhost:3000/${img.image_url}`,
  })) || [];

  // Add placeholder image if no images
  if (images.length === 0) {
    images.push({
      original: 'https://via.placeholder.com/600x400?text=No+Image',
      thumbnail: 'https://via.placeholder.com/150x100?text=No+Image',
    });
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="product-detail-content">
          <div className="product-images">
            <ImageGallery
              items={images}
              showPlayButton={false}
              showFullscreenButton={true}
              showNav={true}
              showThumbnails={true}
              thumbnailPosition="bottom"
              slideInterval={3000}
              slideOnThumbnailOver={true}
              showIndex={true}
              startIndex={selectedImageIndex}
              onSlide={setSelectedImageIndex}
            />
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <div className="product-meta">
                <span className="category">{product.category?.name}</span>
                {product.rating && (
                  <div className="rating">
                    <FaStar />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">${product.price?.toFixed(2)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="original-price">${product.original_price.toFixed(2)}</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <h3>Tags</h3>
                <div className="tags">
                  {product.tags.map(tag => (
                    <span 
                      key={tag.id} 
                      className="tag"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary btn-large add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <FaShoppingCart />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            <div className="product-features">
              <div className="feature">
                <FaTruck />
                <div>
                  <h4>Free Delivery</h4>
                  <p>On orders over $50</p>
                </div>
              </div>
              <div className="feature">
                <FaShieldAlt />
                <div>
                  <h4>Quality Guarantee</h4>
                  <p>Fresh and high quality products</p>
                </div>
              </div>
              <div className="feature">
                <FaUndo />
                <div>
                  <h4>Easy Returns</h4>
                  <p>30-day return policy</p>
                </div>
              </div>
            </div>

            {product.seller && (
              <div className="seller-info">
                <h3>Seller Information</h3>
                <div className="seller-details">
                  <p><strong>Name:</strong> {product.seller.profile?.first_name} {product.seller.profile?.last_name}</p>
                  <p><strong>Phone:</strong> {product.seller.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 