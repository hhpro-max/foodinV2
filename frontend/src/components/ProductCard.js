import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaHeart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product }) => {
  const { addItemToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // You could show a toast or redirect to login
      return;
    }

    setAddingToCart(true);
    await addItemToCart(product.id, 1);
    setAddingToCart(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/${product.images[0].image_url}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={getImageUrl()} alt={product.name} />
          <div className="product-overlay">
            <button
              className="wishlist-btn"
              onClick={handleWishlist}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FaHeart className={isWishlisted ? 'wishlisted' : ''} />
            </button>
          </div>
          {product.original_price && product.original_price > product.price && (
            <div className="discount-badge">
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
            </div>
          )}
        </div>

        <div className="product-content">
          <div className="product-header">
            <h3 className="product-name">{product.name}</h3>
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

          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              {product.tags.slice(0, 2).map(tag => (
                <span 
                  key={tag.id} 
                  className="tag"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="tag-more">+{product.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              <FaShoppingCart />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;