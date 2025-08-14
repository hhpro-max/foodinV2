import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPhone, FaKey, FaArrowLeft } from 'react-icons/fa';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from '../contexts/AuthContext';
import { debounce } from '../utils/debounce';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { login, sendOtpCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSendOtp = async () => {
    if (!phone) {
      return;
    }

    setLoading(true);
    const result = await sendOtpCode(phone);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      return;
    }

    setLoading(true);
    const result = await login(phone, otp);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleResendOtp = () => {
    if (countdown === 0) {
      handleSendOtp();
    }
  };

  const debouncedSendOtp = debounce(handleSendOtp, 500);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <button 
              className="back-btn" 
              onClick={() => navigate('/')}
              style={{ display: step === 'phone' ? 'none' : 'flex' }}
            >
              <FaArrowLeft />
            </button>
            <h1>{step === 'phone' ? 'Welcome Back' : 'Enter OTP'}</h1>
            <p>
              {step === 'phone' 
                ? 'Enter your phone number to receive a verification code'
                : `We've sent a 6-digit code to ${phone}`
              }
            </p>
          </div>

          {step === 'phone' ? (
            <div className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-group">
                  <FaPhone className="input-icon" />
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={phone}
                    onChange={setPhone}
                    placeholder="Enter phone number"
                    className="phone-input"
                  />
                </div>
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={debouncedSendOtp}
                disabled={loading || !phone}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <div className="input-group">
                  <FaKey className="input-icon" />
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="form-control otp-input"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="resend-section">
                <p>
                  Didn't receive the code?{' '}
                  <button
                    className="resend-btn"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </div>
          )}

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button 
                className="link-btn"
                onClick={() => navigate('/register')}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 