'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiAlertCircle } from 'react-icons/fi';
import { useAppDispatch } from '@/redux/store';
import { getCurrentUser } from '@/redux/slices/authSlice';
import { authService } from '@/lib/api';
import Cookies from 'js-cookie';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to sign in with credentials:', { email });
      
      // First try to authenticate with NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      console.log('Sign in result:', result);

      if (result?.error) {
        setError(result.error);
        console.error('Login error:', result.error);
        return;
      }
      
      // Successfully authenticated with NextAuth, now get the user data from backend
      try {
        // Get our backend token
        const loginResponse = await authService.login(email, password);
        console.log('Backend login response:', loginResponse);
        
        // Store token in cookies for middleware
        Cookies.set('auth_token', loginResponse.token, { 
          expires: rememberMe ? 7 : 1, // 7 days if remember me, 1 day otherwise
          path: '/',
          sameSite: 'strict'
        });
        
        // Get current user data
        await dispatch(getCurrentUser()).unwrap();
        
        console.log('Login successful, redirecting to /home');
        toast.success('Login successful!');
        
        // Use router.replace instead of push to avoid history issues
        router.replace('/home');
      } catch (backendError) {
        console.error('Backend login error:', backendError);
        setError('Authentication failed with the backend.');
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
            Password
          </label>
          <div className="text-sm">
            <a href="#" className="font-semibold text-orange-600 hover:text-orange-500">
              Forgot password?
            </a>
          </div>
        </div>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 py-2">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}; 