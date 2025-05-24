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

export interface Earnings {
  id: number;
  userId: number;
  promotionId: number;
  amount: number;
  type: 'commission' | 'bonus' | 'referral';
  status: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
  description?: string;
  metadata?: {
    commissionType?: 'percentage' | 'fixed';
    commissionRate?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EarningsResponse {
  success: boolean;
  data: {
    earnings: Earnings[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EarningsStats {
  success: boolean;
  data: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    cancelledEarnings: number;
    monthlyEarnings: {
      month: string;
      amount: number;
    }[];
  };
}

class EarningsService {
  // Get user's earnings with pagination
  async getUserEarnings(page = 1, limit = 10): Promise<EarningsResponse> {
    const response = await apiClient.get('/earnings/user', {
      params: { page, limit }
    });
    return response.data;
  }

  // Get earnings statistics
  async getEarningsStats(): Promise<EarningsStats> {
    const response = await apiClient.get('/earnings/stats');
    return response.data;
  }

  // Get earnings by date range
  async getEarningsByDateRange(startDate: string, endDate: string): Promise<EarningsResponse> {
    const response = await apiClient.get('/earnings/range', {
      params: { startDate, endDate }
    });
    return response.data;
  }
}

export const earningsService = new EarningsService(); 