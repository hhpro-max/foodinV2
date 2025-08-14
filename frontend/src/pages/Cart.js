import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, loading, updateItemQuantity, removeItemFromCart, clearUserCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-cart">
          <FaShoppingBag />
          <h2>Please login to view your cart</h2>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <FaShoppingBag />
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));
    await updateItemQuantity(productId, newQuantity);
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    await removeItemFromCart(productId);
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearUserCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const cartTotal = getCartTotal();
  const itemCount = cart.items.length;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Continue Shopping
          </button>
          <h1>Shopping Cart ({itemCount} items)</h1>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.product?.images?.[0] ? (
                    <img 
                      src={`http://localhost:3000/${item.product.images[0].image_url}`} 
                      alt={item.product.name}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <FaShoppingBag />
                    </div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.product?.name || 'Product Name'}</h3>
                  <p className="item-category">{item.product?.category?.name || 'Category'}</p>
                  <div className="item-tags">
                    {item.product?.tags?.map(tag => (
                      <span key={tag.id} className="tag" style={{ backgroundColor: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="item-price">
                  <span className="price">${item.unit_price?.toFixed(2) || '0.00'}</span>
                </div>

                <div className="item-quantity">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                      disabled={updatingItems.has(item.product_id)}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                      disabled={updatingItems.has(item.product_id)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <span className="total-price">
                    ${((item.unit_price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="item-actions">
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.product_id)}
                    disabled={updatingItems.has(item.product_id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>Free</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <div className="summary-actions">
                <button 
                  className="btn btn-primary btn-block"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                
                <button 
                  className="btn btn-outline btn-block"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 