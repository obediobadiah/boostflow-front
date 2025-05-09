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
  // Get product statistics (summary stats only)
  async getProductStatistics(): Promise<{
    totalProducts: number;
    change: string;
  }> {
    try {
      // Try to fetch product statistics from the API
      const response = await apiClient.get('/statistics/products/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching product statistics:', error);
      
      // Fallback
      return {
        totalProducts: 0,
        change: '+0'
      };
    }
  }
  
  // Get promotion statistics (summary stats only)
  async getPromotionStatistics(): Promise<{
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
  }> {
    try {
      // Try to fetch promotion statistics from the API
      const response = await apiClient.get('/statistics/promotions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion statistics:', error);
      
      // Fallback
      return {
        totalPromotions: 0,
        clicksGenerated: 0,
        earnings: 0,
        conversions: 0,
        change: {
          promotions: '+0',
          clicks: '+0',
          earnings: '+0',
          conversions: '+0'
        }
      };
    }
  }

  // Fetch active products with pagination - now uses new endpoint
  async getActiveProducts(page = 1, limit = 5): Promise<PaginatedResponse<ProductStats>> {
    try {
      const response = await apiClient.get('/statistics/active-products', {
        params: { page, limit }
      });
      
      // Handle response from our new standardized endpoint
      if (response?.data?.data && response?.data?.pagination) {
        return {
          data: response.data.data,
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages
        };
      }
      
      // Handle legacy or unexpected response formats (fallback)
      return this.handleLegacyProductResponse(response, page, limit);
    } catch (error) {
      console.error('Error fetching active products:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }
  
  // Helper method for backwards compatibility
  private handleLegacyProductResponse(response: any, page: number, limit: number): PaginatedResponse<ProductStats> {
    // If response itself is the data array
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page,
        limit,
        totalPages: Math.ceil(response.length / limit)
      };
    }

    // If response has products property
    if (response?.products) {
      return {
        data: response.products,
        total: response.products.length,
        page,
        limit,
        totalPages: Math.ceil(response.products.length / limit)
      };
    }
    
    // Fallback: treat the entire response as data if it's not null
    const safeResponse = response || [];
    const dataArray = Array.isArray(safeResponse) ? safeResponse : [safeResponse];
    
    return {
      data: dataArray.filter(Boolean), // Filter out any null/undefined items
      total: dataArray.length,
      page,
      limit,
      totalPages: Math.ceil(dataArray.length / limit)
    };
  }

  // Fetch active promotions with pagination - now uses new endpoint
  async getActivePromotions(page = 1, limit = 5): Promise<PaginatedResponse<PromotionStats>> {
    try {
      const response = await apiClient.get('/statistics/active-promotions', {
        params: { page, limit }
      });
      
      // Handle response from our new standardized endpoint
      if (response?.data?.data && response?.data?.pagination) {
        return {
          data: response.data.data,
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages
        };
      }
      
      // Handle legacy or unexpected response formats (fallback)
      return this.handleLegacyPromotionResponse(response, page, limit);
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }
  
  // Helper method for backwards compatibility
  private handleLegacyPromotionResponse(response: any, page: number, limit: number): PaginatedResponse<PromotionStats> {
    // If response itself is the data array
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page,
        limit,
        totalPages: Math.ceil(response.length / limit)
      };
    }

    // If response has promotions property
    if (response?.promotions) {
      return {
        data: response.promotions,
        total: response.promotions.length,
        page,
        limit,
        totalPages: Math.ceil(response.promotions.length / limit)
      };
    }
    
    // Fallback: treat the entire response as data if it's not null
    const safeResponse = response || [];
    const dataArray = Array.isArray(safeResponse) ? safeResponse : [safeResponse];
    
    return {
      data: dataArray.filter(Boolean), // Filter out any null/undefined items
      total: dataArray.length,
      page,
      limit,
      totalPages: Math.ceil(dataArray.length / limit)
    };
  }

  // Fetch platform statistics - updated to handle new format
  async getPlatformStatistics(): Promise<PlatformStatistics> {
    try {
      const response = await apiClient.get('/statistics/platforms');
      
      // Handle new format with summary
      if (response?.data?.summary) {
        return response.data.summary;
      }
      
      // Handle old format
      return response.data;
    } catch (error) {
      console.error('Error fetching platform statistics:', error);

      // Return mock data as fallback
      return {
        platformCount: {
          facebook: 0,
          instagram: 0,
          twitter: 0,
          tiktok: 0,
          youtube: 0,
          linkedin: 0,
          pinterest: 0,
          other: 0
        },
        totalAccounts: 0,
        totalFollowers: 0,
        mostPopularPlatform: ''
      };
    }
  }
}

export const statisticsService = new StatisticsService(); 