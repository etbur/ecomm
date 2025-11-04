const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Products API
export const productsApi = {
  getAll: () => makeRequest('/products'),
  create: (productData) => makeRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
};

// Ratings API
export const ratingsApi = {
  submit: (productId, rating) => makeRequest('/ratings', {
    method: 'POST',
    body: JSON.stringify({ productId, rating }),
  }),
  checkSequentialRating: (productId) => makeRequest('/ratings/check-sequential', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  getMyRatings: () => makeRequest('/ratings/my'),
};

// User API
export const userApi = {
  getBalance: () => makeRequest('/user/balance'),
  deposit: (amount, method, address, notes) => makeRequest('/user/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, method, address, notes }),
  }),
  getDeposits: () => makeRequest('/user/deposits'),
  getMe: () => makeRequest('/auth/me'),
};

// Parent-Child Relationship API
export const relationshipApi = {
  createParentChild: (parentUserId, childUserId) => makeRequest('/users/create-parent-child', {
    method: 'POST',
    body: JSON.stringify({ parentUserId, childUserId }),
  }),
  getRelationships: () => makeRequest('/users/parent-child-relationships'),
};

// Daily Session API
export const sessionApi = {
  start: (parentUserId) => makeRequest('/daily-session/start', {
    method: 'POST',
    body: JSON.stringify({ parentUserId }),
  }),
  completeTask: (productId) => makeRequest('/daily-session/complete-task', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  checkSequentialRating: (productId) => makeRequest('/daily-session/check-sequential', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  getMySessions: (days = 7) => makeRequest(`/daily-session/my-sessions?days=${days}`),
  getStats: (days = 30) => makeRequest(`/daily-session/stats?days=${days}`),
};

// Transactions API
export const transactionsApi = {
  getMy: (type = '', limit = 50) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit);
    return makeRequest(`/transactions/my?${params.toString()}`);
  },
};

// Auth API
export const authApi = {
  login: (credentials) => makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  signup: (userData) => makeRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getMe: () => makeRequest('/auth/me'),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.message.includes('401') || error.message.includes('403')) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('cryptoHubUser');
    localStorage.removeItem('userId');
    window.location.href = '/';
    return 'Session expired. Please log in again.';
  }
  
  return error.message || 'An error occurred. Please try again.';
};