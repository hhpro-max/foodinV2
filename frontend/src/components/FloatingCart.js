import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FloatingCart = () => {
  const { getCartItemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate('/cart');
  };

  return (
    <button className="floating-cart" onClick={handleClick} aria-label="Open cart">
      <FaShoppingCart />
      <span className="floating-cart-count">{getCartItemCount()}</span>
    </button>
  );
};

export default FloatingCart;
