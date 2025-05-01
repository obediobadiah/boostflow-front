import axios from 'axios';
import { productService, promotionService } from '../api';

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
export interface DashboardStats {
  totalPromotions: number;
  clicksGenerated: number;
  earnings: number;
  conversions: number;
  change: {
    promotions: string;
    clicks: string;
    earnings: string;
    conversions: string;
  };
}

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
  // Fetch dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/statistics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return mock data as fallback
      return {
        totalPromotions: 18,
        clicksGenerated: 1254,
        earnings: 842,
        conversions: 32,
        change: {
          promotions: '+5',
          clicks: '+12%',
          earnings: '+28%',
          conversions: '+4'
        }
      };
    }
  }


  // the total number of Products

  // Fetch active promotions with pagination
  async getActivePromotions(page = 1, limit = 5): Promise<PaginatedResponse<PromotionStats>> {
    try {
      const response = await productService.getAllProductsStatistique({
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  }

  // Fetch active products with pagination
  async getActiveProducts(page = 1, limit = 5): Promise<PaginatedResponse<ProductStats>> {
    try {
      const response = await promotionService.getMyPromotionsStatistics({
        params: {page, limit}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active products:', error);
      throw error;
    }
  }

  // Fetch platform statistics
  async getPlatformStatistics(): Promise<PlatformStatistics> {
    try {
      const response = await apiClient.get('/statistics/platforms');
      return response.data;
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      
      // Return mock data as fallback
      return {
        platformCount: {
          facebook: 12,
          instagram: 24,
          twitter: 8,
          tiktok: 3,
          youtube: 5,
          linkedin: 7,
          pinterest: 2,
          other: 1
        },
        totalAccounts: 62,
        totalFollowers: 24680,
        mostPopularPlatform: 'instagram'
      };
    }
  }
}

export const statisticsService = new StatisticsService(); 