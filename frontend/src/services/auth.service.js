import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const sendOtp = async (phone) => {
  try {
    await axios.post(`${API_URL}/auth/send-otp`, { phone });
    return true;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
