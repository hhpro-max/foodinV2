import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleCartClick = () => {
    // Keep SPA navigation and close mobile menu when clicked
    if (!isAuthenticated) {
      navigate('/auth');
      setIsMenuOpen(false);
      return;
    }
    navigate('/cart');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">فودین</span>
          <span className="brand-tagline">تازه‌جات و مواد غذایی تحویل داده شده</span>
        </Link>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation menu */}
        <ul className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              خانه
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/categories" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              دسته‌بندی‌ها
            </Link>
          </li>
          
          {/* Cart is visible for all users; unauthenticated users are redirected to /auth */}
          <li className="nav-item">
            <button className="nav-link cart-link" onClick={handleCartClick}>
              <FaShoppingCart />
              <span className="cart-count">{getCartItemCount()}</span>
              <span className="cart-text">سبد خرید</span>
            </button>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/panel" className="nav-link panel-link" onClick={() => setIsMenuOpen(false)}>
                  پنل
                </Link>
              </li>
              <li className="nav-item user-menu-container">
                <button className="nav-link user-menu-btn" onClick={toggleUserMenu}>
                  <FaUser />
                  <span className="user-name">{user?.profile?.first_name || 'User'}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="user-menu">
                    <Link to="/profile" className="user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                      <FaUser /> پروفایل
                    </Link>
                    <Link to="/addresses" className="user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                      آدرس‌ها
                    </Link>
                    <button className="user-menu-item logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt /> خروج
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/auth" className="nav-link login-btn" onClick={() => setIsMenuOpen(false)}>
                ورود/ثبت‌نام
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;