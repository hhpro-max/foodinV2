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
    // Let callers handle 401/unauthorized cases (e.g. inactive users)
    return Promise.reject(error);
  }
);

// Product APIs
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const createProduct = async (formData) => {
  // formData must be a FormData instance with fields matching backend expectations
  const response = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  // Normalize response shapes so callers receive the actual product object.
  // Backend may return: { status, data: { product } } or { product } or the product directly.
  const data = response.data;
  const product = data?.data?.product ?? data?.product ?? data;
  return product;
};

// Admin product APIs
export const getPendingProducts = async (params = {}) => {
  const response = await api.get('/products/admin/pending', { params });
  return response.data;
};

export const getAllProductsAdmin = async (params = {}) => {
  const response = await api.get('/products/admin/all', { params });
  return response.data;
};

// Seller product APIs (returns products for the authenticated seller)
export const getSellerProducts = async (params = {}) => {
  const response = await api.get('/products/seller/my-products', { params });
  // normalize response shapes
  return response.data;
};

export const approveProduct = async (productId, approvalData) => {
  const response = await api.patch(`/products/${productId}/approve`, approvalData);
  return response.data;
};

export const rejectProduct = async (productId, rejectionData) => {
  const response = await api.patch(`/products/${productId}/reject`, rejectionData);
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

export const getUserPermissions = async () => {
  const response = await api.get('/users/permissions');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const completeProfile = async (profileData) => {
  const response = await api.post('/users/profile/complete', profileData);
  return response.data;
};

// Role selection API
export const chooseRole = async (role) => {
  const response = await api.post('/users/choose-role', { role });
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
  const response = await api.patch(`/addresses/${id}/set-primary`);
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

export const markInvoiceAsPaid = async (id) => {
  const response = await api.patch(`/invoices/${id}/pay`);
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

export const sendNotification = async (payload) => {
  const response = await api.post('/notifications/send', payload);
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