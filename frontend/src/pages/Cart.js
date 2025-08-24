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
          <h2>لطفا برای مشاهده سبد خرید وارد شوید</h2>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            ورود
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
          <p>در حال بارگذاری سبد خرید...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <FaShoppingBag />
          <h2>سبد خرید شما خالی است</h2>
          <p>برای شروع، چند محصول اضافه کنید!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            ادامه خرید
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
            <FaArrowLeft /> ادامه خرید
          </button>
          <h1>سبد خرید ({itemCount} مورد)</h1>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => {
              const price = item.unit_price ?? item.price ?? item.unitPrice ?? 0;
              const productName = item.product?.name || item.name || 'Product Name';
              const productCategory = item.product?.category?.name || item.category?.name || item.category || 'Category';
              const tags = item.product?.tags || item.tags || [];
              const imagePath = item.product?.images?.[0]?.url || item.product?.images?.[0]?.image_url || item.image_url || item.images?.[0]?.image_url || null;

              return (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {imagePath ? (
                      <img src={`http://localhost:3000${imagePath}`} alt={productName} />
                    ) : (
                      <div className="image-placeholder">
                        <FaShoppingBag />
                      </div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3>{productName}</h3>
                    <p className="item-category">{productCategory}</p>
                    <div className="item-tags">
                      {tags.map(tag => (
                        <span key={tag.id || tag.name} className="tag" style={{ backgroundColor: tag.color }}>
                          {tag.name || tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="item-price">
                    <span className="price">${Number(price).toFixed(2)}</span>
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
                    <span className="total-price">${(Number(price) * item.quantity).toFixed(2)}</span>
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
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>خلاصه سفارش</h3>
              
              <div className="summary-row">
                <span>جمع کل ({itemCount} مورد)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>هزینه ارسال</span>
                <span>Free</span>
              </div>
              
              <div className="summary-row total">
                <span>مجموع</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <div className="summary-actions">
                <button 
                  className="btn btn-primary btn-block"
                  onClick={handleCheckout}
                >
                  ادامه به پرداخت
                </button>
                
                <button 
                  className="btn btn-outline btn-block"
                  onClick={handleClearCart}
                >
                  خالی کردن سبد خرید
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