import axios from 'axios';
import Cookies from 'js-cookie';

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

interface SocialAuthData {
  provider: string;
  providerAccountId?: string;
  email?: string;
  name?: string;
  image?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', { email, password });
    this.setToken(response.data.token);
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
    this.setToken(response.data.token);
    return response.data;
  }

  async socialLogin(data: SocialAuthData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/social-login', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async processSocialAuthCallback(token: string): Promise<void> {
    // Store the token securely
    this.setToken(token);
    
    // You could also verify the token with your backend here
    // or fetch additional user data if needed
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Store in localStorage for JavaScript access
      localStorage.setItem('token', token);
      
      // Also store in HTTP-only cookie for better security
      Cookies.set('auth_token', token, { 
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      });
    }
  }

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  }

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
      // Clear tokens
      localStorage.removeItem('token');
      Cookies.remove('auth_token');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear tokens even if API call fails
      localStorage.removeItem('token');
      Cookies.remove('auth_token');
    }
  }
  
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/auth/refresh-token');
      if (response.data && response.data.token) {
        this.setToken(response.data.token);
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