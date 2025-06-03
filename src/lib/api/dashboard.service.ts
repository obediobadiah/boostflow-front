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
  earnings: number | string;
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
    const response = await apiClient.get('/dashboard/statistics/products');
    return response.data;
  }
  
  async getPromotionStatistics(): Promise<PromotionAggregateStats> {
    const response = await apiClient.get('/dashboard/statistics/promotions');
    return response.data;
  }
  
  async getActiveProducts(page = 1, limit = 5): Promise<PaginatedResponse<ProductStats>> {
    const response = await apiClient.get('/dashboard/products/active', {
      params: { page, limit }
    });
    return response.data;
  }
  
  async getActivePromotions(page = 1, limit = 5): Promise<PaginatedResponse<PromotionStats>> {
    const response = await apiClient.get('/dashboard/promotions/active', {
      params: { page, limit }
    });
    return response.data;
  }
  
  // Get dashboard overview data
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data;
  }

  // Track a product view
  async trackProductView(productId: number): Promise<void> {
    await apiClient.post('/dashboard/products/track-view', { productId });
  }

  // Get monthly product stats
  async getMonthlyProductStats(year: number, month: number) {
    try {
      console.log(`Fetching product stats for ${month}/${year}`);
      const response = await apiClient.get(`/dashboard/products/stats/${year}/${month}`);
      console.log('Product stats response:', response.data);
      
      // Transform the API response to match the expected format
      if (response.data && response.data.data) {
        // Convert the array to the expected format with name and views properties
        const weeklyData = response.data.data.map((item: any) => ({
          name: `Week ${item.week}`,
          views: item.views,
          revenue: 0, // Default value since not provided by API
          productsCreated: 0 // Default value since not provided by API
        }));
        
        // Calculate totals for summary
        const totalViews = weeklyData.reduce((sum: number, item: any) => sum + item.views, 0);
        
        return {
          success: true,
          data: {
            weeklyData: weeklyData,
            summary: {
              totalViews: totalViews,
              estimatedRevenue: 0, // Default value
              productsPercentChange: '0',
              viewsPercentChange: '0'
            }
          }
        };
      }
      
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error in getMonthlyProductStats:', error);
      // Return a placeholder success response with empty data for development
      return {
        success: true,
        data: {
          weeklyData: [
            { name: 'Week 1', views: 0, revenue: 0, productsCreated: 0 },
            { name: 'Week 2', views: 0, revenue: 0, productsCreated: 0 },
            { name: 'Week 3', views: 0, revenue: 0, productsCreated: 0 },
            { name: 'Week 4', views: 0, revenue: 0, productsCreated: 0 }
          ],
          summary: {
            totalViews: 0,
            estimatedRevenue: 0,
            productsPercentChange: '0',
            viewsPercentChange: '0'
          }
        }
      };
    }
  }

  // Get monthly promotion stats
  async getMonthlyPromotionStats(year: number, month: number) {
    try {
      console.log(`Fetching promotion stats for ${month}/${year}`);
      const response = await apiClient.get(`/dashboard/promotions/stats/${year}/${month}`);
      console.log('Promotion stats response:', response.data);
      
      // Transform the API response to match the expected format
      if (response.data) {
        // If we have a similar format as product stats
        if (response.data.data && Array.isArray(response.data.data)) {
          const weeklyData = response.data.data.map((item: any) => ({
            name: `Week ${item.week}`,
            promotions: item.promotions || 0,
            earnings: item.earnings || 0
          }));
          
          return {
            success: true,
            data: {
              weeklyData: weeklyData
            }
          };
        }
        
        // If we already have a different format with a 'success' property, pass it through
        if (response.data.success) {
          return response.data;
        }
      }
      
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error in getMonthlyPromotionStats:', error);
      // Return a placeholder success response with empty data for development
      return {
        success: true,
        data: {
          weeklyData: [
            { name: 'Week 1', promotions: 0, earnings: 0 },
            { name: 'Week 2', promotions: 0, earnings: 0 },
            { name: 'Week 3', promotions: 0, earnings: 0 },
            { name: 'Week 4', promotions: 0, earnings: 0 }
          ]
        }
      };
    }
  }
  
  // Add method for refreshing auth token
  async refreshAuthToken(): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/refresh-token');
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