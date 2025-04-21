import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/lib/api';
import Cookies from 'js-cookie';

// Define user type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define auth state type
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper functions for token storage
const saveToken = (token: string) => {
  localStorage.setItem('token', token);
  // Set cookie with path=/ so it's available for middleware
  Cookies.set('auth_token', token, { path: '/', expires: 1 }); // Expires in 1 day
};

const removeToken = () => {
  localStorage.removeItem('token');
  // Remove the cookie with the same parameters that were used to set it
  Cookies.remove('auth_token', { path: '/' });
};

// Get token from storage
const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from localStorage first
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure cookie is also set for middleware
    Cookies.set('auth_token', token, { path: '/', expires: 1 });
    return token;
  }
  
  // Check if token exists in cookies
  const cookieToken = Cookies.get('auth_token');
  if (cookieToken) {
    // Sync localStorage if cookie exists
    localStorage.setItem('token', cookieToken);
    return cookieToken;
  }
  
  return null;
};

// Initial state
const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  isLoading: false,
  error: null
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        saveToken(data.token);
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to login');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }: { name: string; email: string; password: string; role?: string }, { rejectWithValue }) => {
    try {
      const data = await authService.register(name, email, password, role);
      if (data.token) {
        saveToken(data.token);
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get current user');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Call the API service, but we don't wait for a response
      authService.logout();
      
      // Clean up tokens from localStorage and cookies
      removeToken();
      
      // Reset state completely
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        
        // Only clear auth state if it's not just a missing token error
        // This prevents resetting during initial page loads when there's no token yet
        const errorMessage = action.error?.message || '';
        const payloadMessage = typeof action.payload === 'string' ? action.payload : '';
        
        const isMissingTokenError = 
          errorMessage.includes('No auth token') || 
          payloadMessage.includes('No auth token');
        
        if (!isMissingTokenError) {
          state.isAuthenticated = false;
          state.user = null;
        }
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 