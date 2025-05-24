import axios from 'axios';

// Types
export interface PromotionStats {
  id: number;
  name: string;
  commission: string;
  clicks: number;
  conversions: number;
  price?: string;
  category?: string;
}

export interface ProductStats {
  id: number;
  name: string;
  price: string;
  category: string;
  commissionRate: string;
  description?: string;
  active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardData {
  user: any;
  stats: {
    products?: any;
    promotions?: any;
  };
  recentProducts?: any;
  recentPromotions?: any;
}

// Add missing interface definitions
export interface PromotionAggregateStats {
  totalPromotions: number;
  clicksGenerated?: number;
  earnings: number;
  conversions: number;
  change?: {
    promotions?: string;
    earnings?: string;
    conversions?: string;
  };
}

export interface MonthlyProductStats {
  totalProducts: number;
  totalViews?: number;
  weeklyViews?: Array<{
    week: string;
    count: number;
  }>;
  estimatedRevenue?: number;
  change?: {
    products: string;
    views: string;
  };
}

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
    // Get token from localStorage
    let token = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
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

class DashboardService {
  // Add the missing method implementations
  async getProductStatistics(): Promise<{totalProducts: number, change: string}> {
    const response = await apiClient.get('/api/dashboard/statistics/products');
    return response.data;
  }
  
  async getPromotionStatistics(): Promise<PromotionAggregateStats> {
    const response = await apiClient.get('/api/dashboard/statistics/promotions');
    return response.data;
  }
  
  async getActiveProducts(page = 1, limit = 5): Promise<PaginatedResponse<ProductStats>> {
    const response = await apiClient.get('/api/dashboard/products/active', {
      params: { page, limit }
    });
    return response.data;
  }
  
  async getActivePromotions(page = 1, limit = 5): Promise<PaginatedResponse<PromotionStats>> {
    const response = await apiClient.get('/api/dashboard/promotions/active', {
      params: { page, limit }
    });
    return response.data;
  }
  
  // Get dashboard overview data
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/api/dashboard');
    return response.data;
  }

  // Track a product view
  async trackProductView(productId: number): Promise<void> {
    await apiClient.post('/api/dashboard/products/track-view', { productId });
  }

  // Get monthly product stats
  async getMonthlyProductStats(year: number, month: number) {
    const response = await apiClient.get(`/api/dashboard/products/stats/${year}/${month}`);
    return response.data;
  }

  // Get monthly promotion stats
  async getMonthlyPromotionStats(year: number, month: number) {
    const response = await apiClient.get(`/api/dashboard/promotions/stats/${year}/${month}`);
    return response.data;
  }
  
  // Add method for refreshing auth token
  async refreshAuthToken(): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/auth/refresh-token');
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
}

export const dashboardService = new DashboardService(); 