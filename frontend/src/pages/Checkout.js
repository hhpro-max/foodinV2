import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCreditCard, FaMoneyBillWave, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/api';

const Checkout = () => {
  const { cart, loading, getCartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('placepay');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری صفحه پرداخت...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <FaArrowLeft />
          <h2>سبد خرید شما خالی است</h2>
          <p>برای ادامه به صفحه اصلی بروید</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    
    try {
      const orderPayload = {
        payment_method: selectedPayment,
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price || item.unitPrice
        }))
      };

      console.log('Sending order payload:', orderPayload);
      const response = await createOrder(orderPayload);
      console.log('Order creation response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      console.log('Response full object:', JSON.stringify(response, null, 2));
      
      // The backend returns the order object directly, not wrapped in HTTP response
      // So we check if the response has order properties (id, status, etc.)
      if (response && response.id && response.status) {
        setOrderCreated(true);
        setOrderData(response);
        
        // Show success message
        toast.success('سفارش با موفقیت ایجاد شد!');
        
        // Redirect to invoices page immediately
        navigate('/panel/invoices');
      } else {
        console.error('Order creation failed - invalid response:', response);
        throw new Error(response?.error || response?.message || 'Creating order failed');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error full object:', JSON.stringify(error, null, 2));
      
      // Handle specific error for missing addresses
      if (error.message?.includes('Buyer or seller address not found') ||
          error.response?.data?.message?.includes('Buyer or seller address not found')) {
        toast.error('برای ایجاد سفارش، ابتدا باید آدرس خود را ثبت کنید');
        
        // Show confirmation dialog to redirect to addresses page
        const shouldRedirect = window.confirm(
          'شما هنوز آدرسی ثبت نکرده‌اید. برای ادامه به صفحه آدرس‌ها بروید؟'
        );
        
        if (shouldRedirect) {
          navigate('/addresses');
        }
      } else {
        toast.error(error.message || 'خطا در ایجاد سفارش');
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const cartTotal = getCartTotal();
  const itemCount = cart.items.length;

  if (orderCreated) {
    return (
      <div className="container">
        <div className="success-container">
          <div className="success-card">
            <FaCheckCircle className="success-icon" />
            <h2>سفارش با موفقیت ایجاد شد!</h2>
            <p>در حال انتقال به صفحه فاکتورها...</p>
            <div className="order-info">
              {orderData && (
                <>
                  <p><strong>شماره سفارش:</strong> {orderData.order?.id || orderData.id}</p>
                  <p><strong>مبلغ کل:</strong> {cartTotal.toFixed(2)} تومان</p>
                  <p><strong>روش پرداخت:</strong> {selectedPayment === 'placepay' ? 'پرداخت در محل' : 'پرداخت آنلاین'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate('/cart')}>
            <FaArrowLeft /> بازگشت به سبد خرید
          </button>
          <h1>تکمیل سفارش</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            <div className="payment-methods">
              <h3>روش پرداخت</h3>
              <div className="payment-options">
                <div 
                  className={`payment-option ${selectedPayment === 'online' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('online')}
                >
                  <div className="payment-icon">
                    <FaCreditCard />
                  </div>
                  <div className="payment-info">
                    <h4>پرداخت آنلاین</h4>
                    <p>در حال حاضر این روش در دسترس نیست</p>
                    <span className="status-badge unavailable">غیرفعال</span>
                  </div>
                </div>

                <div 
                  className={`payment-option ${selectedPayment === 'placepay' ? 'selected' : ''}`}
                  onClick={() => setSelectedPayment('placepay')}
                >
                  <div className="payment-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div className="payment-info">
                    <h4>پرداخت در محل</h4>
                    <p>پرداخت هنگام دریافت سفارش</p>
                    <span className="status-badge available">فعال</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-summary">
              <h3>خلاصه سفارش</h3>
              <div className="order-items">
                {cart.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-info">
                      <h4>{item.product?.name || item.name}</h4>
                      <p>تعداد: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${(Number(item.unit_price || item.price || item.unitPrice) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <div className="more-items">
                    و {cart.items.length - 3} مورد دیگر...
                  </div>
                )}
              </div>
              
              <div className="summary-totals">
                <div className="summary-row">
                  <span>جمع کل ({itemCount} مورد)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>هزینه ارسال</span>
                  <span>رایگان</span>
                </div>
                
                <div className="summary-row total">
                  <span>مجموع قابل پرداخت</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="create-order-card">
              <h3>تکمیل سفارش</h3>
              <div className="selected-payment">
                <p>روش پرداخت انتخاب شده:</p>
                <span className="payment-method">
                  {selectedPayment === 'placepay' ? 'پلاس پی' : 'پرداخت آنلاین'}
                </span>
              </div>
              
              <div className="order-total">
                <p>مبلغ کل:</p>
                <span className="total-amount">${cartTotal.toFixed(2)}</span>
              </div>

              <button 
                className={`btn btn-primary btn-block ${isCreatingOrder ? 'loading' : ''}`}
                onClick={handleCreateOrder}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? (
                  <>
                    <div className="spinner"></div>
                    در حال ایجاد سفارش...
                  </>
                ) : (
                  'ایجاد سفارش'
                )}
              </button>
              
              <p className="note">
                با کلیک روی دکمه "ایجاد سفارش"، شما شرایط و قوانین را می‌پذیرید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;