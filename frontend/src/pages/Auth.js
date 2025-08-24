import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../styles/auth.css';
import * as authService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const validateIranianPhoneNumber = (phone) => {
  const iranianPhoneRegex = /^(\+98|0098|98|0)?9\d{9}$/;
  return iranianPhoneRegex.test(phone);
};

const formatIranianPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If number starts with 98 or 0098, remove it
  if (cleaned.startsWith('98')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0098')) {
    cleaned = cleaned.substring(4);
  }
  
  // If it doesn't start with 0, add it
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
};

const Auth = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const formattedPhone = formatIranianPhoneNumber(phone);
    
    if (!validateIranianPhoneNumber(formattedPhone)) {
      toast.error('لطفا یک شماره تلفن معتبر ایرانی وارد کنید');
      return;
    }

    try {
      setLoading(true);
      await authService.sendOtp(formatIranianPhoneNumber(phone));
      setIsOtpSent(true);
  setOtpDigits(['', '', '', '', '', '']);
      setCountdown(120); // 2 minutes countdown
      toast.success('کد OTP با موفقیت ارسال شد!');
    } catch (error) {
      toast.error(error.message || 'ارسال OTP با خطا مواجه شد');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const combined = otpDigits.join('');
    if (!combined || combined.length !== 6 || !/^\d+$/.test(combined)) {
      toast.error('لطفا یک کد OTP 6 رقمی معتبر وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const result = await login(formatIranianPhoneNumber(phone), combined);
      if (result.success) {
        const loggedUser = result.user;
        if (loggedUser && loggedUser.isActive === false) {
          navigate('/profile/complete');
        } else {
          navigate('/');
        }
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'کد OTP نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits, +, and space
    if (/^[\d\s+]*$/.test(value) || value === '') {
      setPhone(value);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp({ preventDefault: () => {} });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-side">
          <h2>سفارش‌دهی سریع B2B</h2>
          <p>مواد اولیه را از فروشندگان تأیید شده سفارش دهید. قیمت‌های عمده، تحویل مطمئن و سفارش‌دهی آسان.</p>
          <ul>
            <li>تأمین‌کنندگان معتبر</li>
            <li>قیمت‌گذاری شفاف</li>
            <li>تحویل سریع</li>
          </ul>
        </div>

        <div className="auth-main">
          <div className="auth-logo">
            <img src="/logo192.png" alt="Foodin Logo" className="auth-logo-img" />
            <div>
              <h3 style={{margin:0}}>Foodin</h3>
              <small style={{color:'var(--gray-500)'}}>تازه‌جات و مواد غذایی تحویل داده شده</small>
            </div>
          </div>

          <h2>به فودین خوش آمدید</h2>
          <p className="auth-subtitle">
            {isOtpSent 
              ? `کد OTP ارسال شده به ${phone} را وارد کنید`
              : 'شماره تلفن خود را برای ادامه وارد کنید'
            }
          </p>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">شماره تلفن</label>
                <div className="phone-input-container">
                  <span className="country-code">+98</span>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control phone-input"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="9XX XXX XXXX"
                    required
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
                <small className="input-hint">شماره موبایل ایرانی خود را وارد کنید</small>
              </div>
              <div className="actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'در حال ارسال...' : 'ارسال کد OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">کد تأیید</label>
                <div className="otp-boxes">
                  {otpDigits.map((d, i) => (
                    <div className="otp-digit" key={i}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(-1);
                          const next = [...otpDigits];
                          next[i] = val;
                          setOtpDigits(next);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                            const prev = [...otpDigits];
                            prev[i - 1] = '';
                            setOtpDigits(prev);
                          }
                          if (/^[0-9]$/.test(e.key) && i < 5) {
                            setTimeout(() => {
                              const nextEl = document.querySelectorAll('.otp-digit input')[i + 1];
                              if (nextEl) nextEl.focus();
                            }, 10);
                          }
                        }}
                        required
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
                <div className="countdown-timer">
                  {countdown > 0 ? (
                    <span>ارسال مجدد کد در {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                  ) : (
                    <button 
                      type="button" 
                      className="btn-link"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>
              </div>
              <div className="actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'در حال تأیید...' : 'تأیید کد OTP'}
                </button>
                <button 
                  type="button" 
                  className="btn-outline"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp('');
                    setOtpDigits(['', '', '', '', '', '']);
                    setCountdown(0);
                  }}
                  disabled={loading}
                >
                  تغییر شماره تلفن
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
