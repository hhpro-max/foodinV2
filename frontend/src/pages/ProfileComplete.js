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
  if (!form.role) return 'Please select a role';
    if (!form.first_name || !form.last_name) return 'First and last name are required';
    if (form.user_type === 'natural') {
      if (!form.national_id) return 'National ID is required';
  if (!/^\d{10}$/.test(form.national_id)) return 'National ID must be 10 digits';
    }
    if (form.user_type === 'legal' && form.economic_code && !/^\d{8,12}$/.test(form.economic_code)) return 'Economic code must be numeric (8-12 digits)';
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
      toast.success('Profile completed and activated');

      // If backend returns updated user, update AuthContext
      const updatedUser = resp?.data?.user || resp?.user || null;
      if (updatedUser) updateUser(updatedUser);

      // Call chooseRole to assign buyer/seller role
      try {
        await chooseRole(form.role);
        toast.success('Role selected');
      } catch (roleErr) {
        // Non-fatal: show message but continue
        console.error('Failed to choose role:', roleErr);
        toast.error(roleErr.response?.data?.message || 'Failed to select role');
      }

      navigate('/');
    } catch (err) {
      // Map server-side validation messages to fields when possible
      const msg = err.response?.data?.message || err.message || 'Failed to complete profile';
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
      <h2>Complete your profile</h2>
      <form className="profile-complete-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Role</label>
          <div className="role-options">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={form.role === 'buyer'}
                onChange={handleChange}
              />
              Buyer
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="seller"
                checked={form.role === 'seller'}
                onChange={handleChange}
              />
              Seller
            </label>
          </div>
          {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}
        </div>
        <div className="form-group">
          <label>User Type</label>
          <select name="user_type" value={form.user_type} onChange={handleChange}>
            <option value="natural">Natural Person</option>
            <option value="legal">Legal Entity</option>
          </select>
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        {form.user_type === 'natural' ? (
          <div className="form-group">
            <label>National ID</label>
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
            {loading ? 'Submitting...' : 'Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileComplete;
