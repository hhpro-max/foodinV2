import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Adjust this to match your backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product APIs
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Category APIs
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Auth APIs
export const sendOtp = async (phone) => {
  const response = await api.post('/auth/send-otp', { phone });
  return response.data;
};

export const verifyOtp = async (phone, otp) => {
  const response = await api.post('/auth/verify-otp', { phone, otp });
  return response.data;
};

// User APIs
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

// Cart APIs
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/add', { product_id: productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`/cart/items/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/items/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};

export const getCartSummary = async () => {
  const response = await api.get('/cart/summary');
  return response.data;
};

// Order APIs
export const createOrder = async (orderData) => {
  const response = await api.post('/orders/create', orderData);
  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Address APIs
export const getAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

export const createAddress = async (addressData) => {
  const response = await api.post('/addresses', addressData);
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/addresses/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

export const setDefaultAddress = async (id) => {
  const response = await api.put(`/addresses/${id}/default`);
  return response.data;
};

// Invoice APIs
export const getInvoices = async (params = {}) => {
  const response = await api.get('/invoices', { params });
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

// Notification APIs
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// Delivery APIs
export const getDeliveryInformation = async () => {
  const response = await api.get('/delivery-informations');
  return response.data;
};

export const createDeliveryInformation = async (deliveryData) => {
  const response = await api.post('/delivery-informations', deliveryData);
  return response.data;
};

export const confirmDelivery = async (orderId, confirmationData) => {
  const response = await api.post(`/delivery-confirmations/${orderId}`, confirmationData);
  return response.data;
};

export default api;