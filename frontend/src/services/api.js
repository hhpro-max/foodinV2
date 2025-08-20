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
    console.log('Request interceptor - Token check:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPrefix: token ? token.substring(0, 10) + '...' : null
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request interceptor - Final config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response interceptor - Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    // Let callers handle 401/unauthorized cases (e.g. inactive users)
    return Promise.reject(error);
  }
);

// Product APIs
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  const data = response.data;
  
  // The backend already returns { data: { products, pagination } }
  return {
    products: data?.data?.products || [],
    pagination: data?.data?.pagination || {
      page: 1,
      limit: 20,
      total: 0
    }
  };
};

export const createProduct = async (formData) => {
  // formData must be a FormData instance with fields matching backend expectations
  const response = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};


export const updateProduct = async (productId, formData) => {
  // formData must be a FormData instance with fields matching backend expectations
  const response = await api.put(`/products/${productId}`, formData, {
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

export const updateProductStock = async (productId, stockData) => {
  const response = await api.patch(`/products/${productId}/stock`, stockData);
  return response.data;
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
  const response = await api.post(`/products/${productId}/approve`, approvalData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const rejectProduct = async (productId, rejectionData) => {
  const response = await api.post(`/products/${productId}/reject`, rejectionData);
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

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
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

// Admin User APIs
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get('/users/roles');
  return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await api.patch(`/users/${userId}/${isActive ? 'activate' : 'deactivate'}`);
  return response.data;
};

export const assignUserRole = async (userId, roleId) => {
  const response = await api.post(`/users/${userId}/roles`, { roleId });
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

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getAddressById = async (addressId) => {
  const response = await api.get(`/addresses/${addressId}`);
  return response.data;
};

export const downloadInvoicePDF = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

export const markInvoiceAsPaid = async (id) => {
  const response = await api.patch(`/invoices/${id}/pay`);
  return response.data;
};

export const getMyInvoices = async () => {
  console.log('Making GET request to /invoices/my-invoices');
  console.log('API config:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers
  });
  const response = await api.get('/invoices/my-invoices');
  console.log('API Response received:', response);
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

export const getDeliveryInformationByInvoiceId = async (invoiceId) => {
  const response = await api.get(`/delivery-informations/invoice/${invoiceId}`);
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

export const confirmDeliveryWithCode = async (confirmationData) => {
  const response = await api.post('/delivery-confirmations/confirm', confirmationData);
  return response.data;
};

export default api;