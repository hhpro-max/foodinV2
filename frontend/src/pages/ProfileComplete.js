import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { completeProfile, getUserProfile, chooseRole } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/profile-complete.css';

const ProfileComplete = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    user_type: 'natural',
  role: 'buyer',
    first_name: '',
    last_name: '',
    email: '',
    national_id: '',
    economic_code: '',
    company_name: '',
  });
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getUserProfile();
        const existing = resp?.data?.user || resp?.user || null;
        if (existing) {
          setForm((f) => ({ ...f, ...existing }));
        }
      } catch (err) {
        // ignore
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
  if (!form.role) return 'لطفا نقش خود را انتخاب کنید';
  if (!form.first_name || !form.last_name) return 'نام و نام خانوادگی الزامی است';
    if (form.user_type === 'natural') {
      if (!form.national_id) return 'کد ملی الزامی است';
      if (!/^\d{10}$/.test(form.national_id)) return 'کد ملی باید 10 رقم باشد';
    }
    if (form.user_type === 'legal' && form.economic_code && !/^\d{8,12}$/.test(form.economic_code)) return 'کد اقتصادی باید عددی باشد (8-12 رقم)';
    return null;
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validationError = validate();
      if (validationError) {
        toast.error(validationError);
        setLoading(false);
        return;
      }

  setFieldErrors({});
  const resp = await completeProfile(form);
      toast.success('پروفایل تکمیل و فعال شد');

      // If backend returns updated user, update AuthContext
      const updatedUser = resp?.data?.user || resp?.user || null;
      if (updatedUser) updateUser(updatedUser);

      // Call chooseRole to assign buyer/seller role
      try {
        await chooseRole(form.role);
        toast.success('نقش انتخاب شد');
      } catch (roleErr) {
        // Non-fatal: show message but continue
        console.error('Failed to choose role:', roleErr);
        toast.error(roleErr.response?.data?.message || 'انتخاب نقش با خطا مواجه شد');
      }

      navigate('/');
    } catch (err) {
      // Map server-side validation messages to fields when possible
      const msg = err.response?.data?.message || err.message || 'تکمیل پروفایل با خطا مواجه شد';
      // heuristics: split on comma and try to detect field names
      const parts = String(msg).split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
      const errors = {};
      parts.forEach(p => {
        const lower = p.toLowerCase();
        if (lower.includes('national')) errors.national_id = p;
        else if (lower.includes('economic')) errors.economic_code = p;
        else if (lower.includes('company')) errors.company_name = p;
        else if (lower.includes('first name') || lower.includes('first_name')) errors.first_name = p;
        else if (lower.includes('last name') || lower.includes('last_name')) errors.last_name = p;
        else if (lower.includes('email')) errors.email = p;
      });

      if (Object.keys(errors).length) {
        setFieldErrors(errors);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-complete-container">
      <h2>پروفایل خود را تکمیل کنید</h2>
      <form className="profile-complete-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>نقش</label>
          <div className="role-options">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={form.role === 'buyer'}
                onChange={handleChange}
              />
              خریدار
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="seller"
                checked={form.role === 'seller'}
                onChange={handleChange}
              />
              فروشنده
            </label>
          </div>
          {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}
        </div>
        <div className="form-group">
          <label>نوع کاربر</label>
          <select name="user_type" value={form.user_type} onChange={handleChange}>
            <option value="natural">شخص حقیقی</option>
            <option value="legal">شخص حقوقی</option>
          </select>
        </div>

        <div className="form-group">
          <label>نام</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>نام خانوادگی</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>ایمیل</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        {form.user_type === 'natural' ? (
          <div className="form-group">
            <label>کد ملی</label>
            <input name="national_id" value={form.national_id} onChange={handleChange} />
          </div>
        ) : (
          <div className="form-group">
            <label>Economic Code</label>
            <input name="economic_code" value={form.economic_code} onChange={handleChange} />
            <label>Company Name</label>
            <input name="company_name" value={form.company_name} onChange={handleChange} />
          </div>
        )}

        <div className="actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'در حال ارسال...' : 'تکمیل پروفایل'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileComplete;
