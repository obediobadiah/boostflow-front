import axios from 'axios';

// Create API client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    let token = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');

      // If not in localStorage, try to get from cookie
      if (!token) {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
    }

    // If token exists, attach to headers
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Types
export interface PromotionStats {
  id: number;
  name: string;
  commission: string;
  clicks: number;
  conversions: number;
}

export interface ProductStats {
  id: number;
  name: string;
  price: string;
  category: string;
  commissionRate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlatformStatistics {
  platformCount: {
    facebook: number;
    instagram: number;
    twitter: number;
    tiktok: number;
    youtube: number;
    linkedin: number;
    pinterest: number;
    other: number;
  };
  totalAccounts: number;
  totalFollowers: number;
  mostPopularPlatform: string;
}

class StatisticsService {
  // Get product statistics
  async getProductStatistics() {
    const response = await apiClient.get('/api/dashboard/statistics/products');
    return response.data;
  }
  
  // Get promotion statistics
  async getPromotionStatistics() {
    const response = await apiClient.get('/api/dashboard/statistics/promotions');
    return response.data;
  }

  // Fetch active products with pagination
  async getActiveProducts(page = 1, limit = 5): Promise<PaginatedResponse<ProductStats>> {
    const response = await apiClient.get('/api/dashboard/products/active', {
      params: { page, limit }
    });
    return response.data;
  }
  
  // Fetch active promotions with pagination
  async getActivePromotions(page = 1, limit = 5): Promise<PaginatedResponse<PromotionStats>> {
    const response = await apiClient.get('/api/dashboard/promotions/active', {
      params: { page, limit }
    });
    return response.data;
  }
  
  // Get monthly product statistics
  async getMonthlyProductStatistics(year?: number, month?: number) {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    
    const response = await apiClient.get('/api/dashboard/statistics/products/monthly', { params });
    return response.data;
  }
  
  // Get monthly promotion statistics
  async getMonthlyPromotionStatistics(year?: number, month?: number) {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    
    const response = await apiClient.get('/api/dashboard/statistics/promotions/monthly', { params });
    return response.data;
  }
}

export const statisticsService = new StatisticsService(); 