'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/store';
import { getCurrentUser } from '@/redux/slices/authSlice';
import { authService } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function processAuth() {
      try {
        // Get token from URL params
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        
        // Handle error case
        if (error) {
          console.error('Auth error from callback:', error);
          setStatus('error');
          setErrorMessage(error === 'BackendAuthFailed' 
            ? 'Authentication failed on the server. Please try again.' 
            : 'Authentication failed. Please try again.');
          return;
        }
        
        // Handle missing token
        if (!token) {
          console.error('No authentication token received');
          setStatus('error');
          setErrorMessage('No authentication token received');
          return;
        }
        
        // Process the token
        await authService.processSocialAuthCallback(token);
        
        // Get user data
        await dispatch(getCurrentUser()).unwrap();
        
        // Show success state briefly before redirect
        setStatus('success');
        
        // Redirect to home page after a short delay to show success message
        setTimeout(() => {
          router.push('/home');
        }, 1500);
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setErrorMessage('Authentication failed. Please try again.');
      }
    }
    
    processAuth();
  }, [dispatch, router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md text-center p-8 bg-white rounded-lg shadow-md">
        {status === 'loading' && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Processing your login...
            </h2>
            <div className="mt-6">
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-orange-600 animate-spin mx-auto"></div>
            </div>
            <p className="mt-4 text-gray-600">Please wait while we authenticate your account.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
              Login successful!
            </h2>
            <p className="mt-2 text-gray-600">Redirecting you to the dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
              Authentication Failed
            </h2>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
} 