import axios from 'axios';
import Cookies from 'js-cookie';

// Function to normalize API URL
const normalizeApiUrl = () => {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  // Remove trailing slash if present
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // If the URL already ends with /api, remove it to avoid duplication
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  
  // Ensure we have a valid URL
  try {
    new URL(baseUrl);
  } catch (e) {
    baseUrl = 'http://localhost:5001';
  }
  
  return baseUrl;
};

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: normalizeApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('token');
      const cookieToken = Cookies.get('auth_token');
      
      const token = localStorageToken || cookieToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        if (!cookieToken && localStorageToken) {
          Cookies.set('auth_token', localStorageToken, { path: '/', expires: 1 });
        } 
        else if (cookieToken && !localStorageToken) {
          localStorage.setItem('token', cookieToken);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized error, clear token
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        Cookies.remove('auth_token', { path: '/' });
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
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
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      company,
      website,
      bio,
      role
    };
    
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  logout: () => {
    return { success: true };
  },
  getCurrentUser: async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || Cookies.get('auth_token');
      
      if (!token) {
        return Promise.reject({ response: { status: 401, data: { message: 'No auth token' } } });
      }
    }
    
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  processSocialAuthCallback: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      Cookies.remove('auth_token', { path: '/' });
      
      localStorage.setItem('token', token);
      Cookies.set('auth_token', token, { path: '/', expires: 1 });
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return { success: true, token };
  }
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/api/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/api/users/${id}/role`, { role });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  }
};

// Product services
export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  getAllProductsStatistique: async (p0: { params: { page: number; limit: number; }; }) => {
    try {
      const response = await api.get('/api/products', { 
        params: p0.params 
      });
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      
      const page = p0?.params?.page || 1;
      const limit = p0?.params?.limit || 10;
      const responseData = response?.data || [];
      
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          total: responseData.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(responseData.length / limit) || 1
        };
      }
      
      const products = responseData?.products || [];
      
      return {
        data: Array.isArray(products) ? products : [],
        total: Array.isArray(products) ? products.length : 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((Array.isArray(products) ? products.length : 0) / limit) || 1
      };
    } catch (error) {
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
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  createProduct: async (productData: any) => {
    const data = {
      ...productData,
      price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
      commissionRate: typeof productData.commissionRate === 'string' ? 
        parseFloat(productData.commissionRate) : productData.commissionRate
    };
    
    const response = await api.post('/api/products', data);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },
  duplicateProduct: async (id: string) => {
    const response = await api.post(`/api/products/${id}/duplicate`);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  }
};

// Promotion services
export const promotionService = {
  getMyPromotions: async () => {
    const response = await api.get('/api/promotions');
    return response.data;
  },

  getMyPromotionsStatistics: async (p0: { params: { page: number; limit: number; }; }) => {
    try {
      const response = await api.get('/api/promotions', { 
        params: p0.params 
      });
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      
      const page = p0?.params?.page || 1;
      const limit = p0?.params?.limit || 10;
      const responseData = response?.data || [];
      
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          total: responseData.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(responseData.length / limit) || 1
        };
      }
      
      const promotions = responseData?.promotions || [];
      
      return {
        data: Array.isArray(promotions) ? promotions : [],
        total: Array.isArray(promotions) ? promotions.length : 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((Array.isArray(promotions) ? promotions.length : 0) / limit) || 1
      };
    } catch (error) {
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
    const response = await api.get(`/api/promotions/${id}`);
    return response.data;
  },
  createPromotion: async (promotionData: any) => {
    const response = await api.post('/api/promotions', promotionData);
    return response.data;
  },
  addSocialMediaPost: async (promotionId: string, postData: any) => {
    const response = await api.post(`/api/promotions/${promotionId}/social-media-post`, postData);
    return response.data;
  },
  deletePromotion: async (id: string) => {
    const response = await api.delete(`/api/promotions/${id}`);
    return response.data;
  }
};

export default api; 