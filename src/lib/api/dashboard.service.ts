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

export interface PromotionAggregateStats {
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

export interface MonthlyProductStats {
  totalProducts: number;
  totalViews: number;
  weeklyViews: {
    week: string;
    count: number;
  }[];
  estimatedRevenue: number;
  change: {
    products: string;
    views: string;
  };
}

export interface ProductStatResponse {
  success: boolean;
  data: {
    weeklyData: Array<{
      name: string;
      views: number;
      clicks: number;
      revenue: number;
      productsCreated: number;
    }>;
    summary: {
      totalViews: number;
      totalNewProducts: number;
      prevMonthViews: number;
      prevMonthProducts: number;
      viewsPercentChange: string;
      productsPercentChange: string;
      estimatedRevenue: number;
    };
  };
}

export interface PromotionStatResponse {
  success: boolean;
  data: {
    weeklyData: Array<{
      name: string;
      promotions: number;
      earnings: number;
    }>;
    summary: {
      totalPromotions: number;
      totalEstimatedEarnings: number;
      prevMonthPromotions: number;
      prevMonthEarnings: number;
      promotionsPercentChange: string;
      earningsPercentChange: string;
    };
  };
}

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
  // Get product statistics (summary stats only)
  async getProductStatistics(): Promise<{
    totalProducts: number;
    change: string;
  }> {
    const response = await apiClient.get('dashboard/statistics/products');
    return response.data;
  }

  // Get promotion statistics (summary stats only)
  async getPromotionStatistics(): Promise<PromotionAggregateStats> {
    const response = await apiClient.get('dashboard/statistics/promotions');
    return response.data;
  }

  // Fetch active products with pagination
  async getActiveProducts(page = 1, limit = 5): Promise<PaginatedResponse<ProductStats>> {
    const response = await apiClient.get('dashboard/products/active', {
      params: { page, limit }
    });
    return response.data;
  }

  // Fetch active promotions with pagination
  async getActivePromotions(page = 1, limit = 5): Promise<PaginatedResponse<PromotionStats>> {
    const response = await apiClient.get('dashboard/promotions/active', {
      params: { page, limit }
    });
    return response.data;
  }

  // Add function to refresh the auth token if needed
  async refreshAuthToken(): Promise<boolean> {
    try {
      const response = await apiClient.get('auth/refresh');
      if (response.data && response.data.token) {
        // Save the new token
        localStorage.setItem('token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing auth token:', error);
      return false;
    }
  }

  // Track a product view
  async trackProductView(productId: number): Promise<void> {
    await apiClient.post('/dashboard/products/track-view', { productId });
  }

  // Get monthly product stats
  async getMonthlyProductStats(year: number, month: number) {
    try {
      const response = await apiClient.get(`/dashboard/products/stats/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return null;
    }
  }

  // Get monthly promotion stats
  async getMonthlyPromotionStats(year: number, month: number) {
    try {
      const response = await apiClient.get(`/dashboard/promotions/stats/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion stats:', error);
      return null;
    }
  }

  // Get monthly product statistics (legacy method for compatibility)
  async getMonthlyProductStatistics(month: number, year: number): Promise<MonthlyProductStats> {
    try {
      const response = await this.getMonthlyProductStats(year, month);
      // Transform to old format for compatibility
      return {
        totalProducts: 0, // This will be filled by other call
        totalViews: response.data.summary.totalViews,
        weeklyViews: response.data.weeklyData.map((week: any) => ({
          week: week.name.replace('Week ', ''),
          count: week.views
        })),
        estimatedRevenue: response.data.summary.estimatedRevenue,
        change: {
          products: '0%',
          views: response.data.summary.viewsPercentChange + '%'
        }
      };
    } catch (error) {
      console.error('Error in getMonthlyProductStatistics:', error);
      // Return default data in case of error
      return {
        totalProducts: 0,
        totalViews: 0,
        weeklyViews: [],
        estimatedRevenue: 0,
        change: {
          products: '0%',
          views: '0%'
        }
      };
    }
  }

  async getPromotionStatsByMonth(year: number, month: number): Promise<PromotionStatResponse> {
    try {
      const response = await apiClient.get(`/statistics/promotions/month/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion stats by month:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService(); 