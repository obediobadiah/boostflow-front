import axios from 'axios';

// Create API client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
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

interface AuthResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone?: string;
    company?: string;
    website?: string;
    bio?: string;
  };
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    phone?: string, 
    company?: string, 
    website?: string, 
    bio?: string, 
    role?: string
  ): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', { 
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
  }

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  }

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  async refreshToken(): Promise<boolean> {
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

export const authService = new AuthService(); 