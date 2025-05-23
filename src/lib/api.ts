import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check both localStorage and cookies for token
      const localStorageToken = localStorage.getItem('token');
      const cookieToken = Cookies.get('auth_token');
      
      // Use the token that exists
      const token = localStorageToken || cookieToken;
      
      // If token exists, use it
      if (token) {
        // Make sure Authorization header is properly formatted with 'Bearer ' prefix
        config.headers.Authorization = `Bearer ${token}`;
        
        // If token is missing from cookies, restore it (sync tokens)
        if (!cookieToken && localStorageToken) {
          Cookies.set('auth_token', localStorageToken, { path: '/', expires: 1 });
        } 
        // If token is in cookie but not localStorage, restore localStorage from cookie
        else if (cookieToken && !localStorageToken) {
          localStorage.setItem('token', cookieToken);
        }
      }
      // Log when no token is available
      else {
        console.warn('⚠️ No auth token available for request:', config.url);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling expired tokens
api.interceptors.response.use(
  (response) => {
    // Return the response directly without any logging
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // If we get a 401 Unauthorized error, clear token
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        Cookies.remove('auth_token', { path: '/' });
        
        // Optional: Redirect to login page
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      // Log the error for debugging
      console.error('Login error:', error.response?.data || error.message);
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  },
  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
    company?: string,
    website?: string,
    bio?: string,
    role: string = 'business'
  ) => {
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      phone,
      company,
      website,
      bio,
      role
    });
    return response.data;
  },
  logout: () => {
    // The function in authSlice handles both localStorage and cookies removal
    // This function is just for any API-related cleanup
    return { success: true };
  },
  getCurrentUser: async () => {
    // Check if there's an auth token before making the request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || Cookies.get('auth_token');
      
      if (!token) {
        // Return a rejected promise to trigger the rejected case in redux
        return Promise.reject({ response: { status: 401, data: { message: 'No auth token' } } });
      }
    }
    
    try {
      // Access the endpoint with the correct URL structure
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      throw error;
    }
  },
  // Process token from social auth redirect
  processSocialAuthCallback: (token: string) => {
    if (typeof window !== 'undefined') {
      try {
        // First clean up any existing tokens to avoid conflicts
        localStorage.removeItem('token');
        Cookies.remove('auth_token', { path: '/' });
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Also set it in cookies for the middleware
        Cookies.set('auth_token', token, { path: '/', expires: 1 });
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error saving auth tokens:', error);
      }
    }
    return { success: true, token };
  }
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
  // Admin functions for user management
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Product services
export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getAllProductsStatistique: async (p0: { params: { page: number; limit: number; }; }) => {
    try {
      const response = await api.get('/products', { 
        params: p0.params 
      });
      
      // If the response already has the expected structure, return it directly
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      
      // Get page and limit from params or use defaults
      const page = p0?.params?.page || 1;
      const limit = p0?.params?.limit || 10;
      
      // Safely handle the response data
      const responseData = response?.data || [];
      
      // Handle array responses
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          total: responseData.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(responseData.length / limit) || 1
        };
      }
      
      // Handle object responses with products property
      const products = responseData?.products || [];
      
      return {
        data: Array.isArray(products) ? products : [],
        total: Array.isArray(products) ? products.length : 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((Array.isArray(products) ? products.length : 0) / limit) || 1
      };
    } catch (error) {
      console.error('Error fetching products statistics:', error);
      // Return empty structure to avoid crashes
      return {
        data: [],
        total: 0,
        page: p0?.params?.page || 1,
        limit: p0?.params?.limit || 10,
        totalPages: 0
      };
    }
  },
  
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      throw error;
    }
  },
  createProduct: async (productData: any) => {
    // Ensure price and commissionRate are numbers
    const data = {
      ...productData,
      price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
      commissionRate: typeof productData.commissionRate === 'string' ? 
        parseFloat(productData.commissionRate) : productData.commissionRate
    };
    
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error: any) {
      console.error('Product creation error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  duplicateProduct: async (id: string) => {
    try {
      // Get the original product first to check if it exists
      const product = await api.get(`/products/${id}`);
      
      // Then attempt to duplicate it
      const response = await api.post(`/products/${id}/duplicate`);
      return response.data;
    } catch (error: any) {
      console.error('Error duplicating product:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack?.substring(0, 500) // Limit stack trace length
      });
      
      // Log validation errors specifically
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      
      throw error;
    }
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Promotion services
export const promotionService = {
  getMyPromotions: async () => {
    const response = await api.get('/promotions');
    return response.data;
  },

  getMyPromotionsStatistics: async (p0: { params: { page: number; limit: number; }; }) => {
    try {
      const response = await api.get('/promotions', { 
        params: p0.params 
      });
      
      // If the response already has the expected structure, return it directly
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      
      // Get page and limit from params or use defaults
      const page = p0?.params?.page || 1;
      const limit = p0?.params?.limit || 10;
      
      // Safely handle the response data
      const responseData = response?.data || [];
      
      // Handle array responses
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          total: responseData.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(responseData.length / limit) || 1
        };
      }
      
      // Handle object responses with promotions property
      const promotions = responseData?.promotions || [];
      
      return {
        data: Array.isArray(promotions) ? promotions : [],
        total: Array.isArray(promotions) ? promotions.length : 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((Array.isArray(promotions) ? promotions.length : 0) / limit) || 1
      };
    } catch (error) {
      console.error('Error fetching promotions statistics:', error);
      // Return empty structure to avoid crashes
      return {
        data: [],
        total: 0,
        page: p0?.params?.page || 1,
        limit: p0?.params?.limit || 10,
        totalPages: 0
      };
    }
  },
  getPromotionById: async (id: string) => {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },
  createPromotion: async (promotionData: any) => {
    const response = await api.post('/promotions', promotionData);
    return response.data;
  },
  addSocialMediaPost: async (promotionId: string, postData: any) => {
    const response = await api.post(`/promotions/${promotionId}/social-media-post`, postData);
    return response.data;
  },
  deletePromotion: async (id: string) => {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  }
};

export default api; 