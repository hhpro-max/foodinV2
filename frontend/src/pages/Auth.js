import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as authService from '../services/auth.service';

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
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
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
      toast.error('Please enter a valid Iranian phone number');
      return;
    }

    try {
      setLoading(true);
      await authService.sendOtp(formatIranianPhoneNumber(phone));
      setIsOtpSent(true);
      setCountdown(120); // 2 minutes countdown
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.verifyOtp(formatIranianPhoneNumber(phone), otp);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
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
        <div className="auth-logo">
          <img src="/logo192.png" alt="Foodin Logo" className="auth-logo-img" />
        </div>
        <h2>Welcome to Foodin</h2>
        <p className="auth-subtitle">
          {isOtpSent 
            ? `Enter the OTP sent to ${phone}`
            : 'Enter your phone number to continue'
          }
        </p>

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
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
              <small className="input-hint">Enter your Iranian mobile number</small>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                className="form-control otp-input"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 6) {
                    setOtp(value);
                  }
                }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={loading}
                autoComplete="one-time-code"
              />
              <div className="countdown-timer">
                {countdown > 0 ? (
                  <span>Resend code in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                ) : (
                  <button 
                    type="button" 
                    className="btn-link"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-block"
              onClick={() => {
                setIsOtpSent(false);
                setOtp('');
                setCountdown(0);
              }}
              disabled={loading}
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
