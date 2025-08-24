import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>فودین</h3>
            <p>تازه‌جات و مواد غذایی درب منزل شما. محصولات باکیفیت، قیمت‌های رقابتی و خدمات عالی.</p>
            <div className="social-links">
              <a href="#" className="social-link"><FaFacebook /></a>
              <a href="#" className="social-link"><FaTwitter /></a>
              <a href="#" className="social-link"><FaInstagram /></a>
              <a href="#" className="social-link"><FaLinkedin /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>لینک‌های سریع</h4>
            <ul className="footer-links">
              <li><Link to="/">خانه</Link></li>
              <li><Link to="/categories">دسته‌بندی‌ها</Link></li>
              <li><Link to="/products">محصولات</Link></li>
              <li><Link to="/about">درباره ما</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>خدمات مشتریان</h4>
            <ul className="footer-links">
              <li><Link to="/contact">تماس با ما</Link></li>
              <li><Link to="/help">مرکز کمک</Link></li>
              <li><Link to="/shipping">اطلاعات ارسال</Link></li>
              <li><Link to="/returns">مرجوعی</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>اطلاعات تماس</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone />
                <span>+98 21 123-45678</span>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <span>support@foodin.com</span>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt />
                <span>خیابان فودین، شهر مواد غذایی، کد پستی 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 فودین. تمامی حقوق محفوظ است.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">سیاست حریم خصوصی</Link>
              <Link to="/terms">شرایط استفاده</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 