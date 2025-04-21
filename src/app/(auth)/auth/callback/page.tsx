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
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    console.log('Auth callback initiated:', { token: !!token, error });
    
    // Handle error from OAuth provider
    if (error) {
      console.error('OAuth error:', error);
      setStatus('error');
      setErrorMessage(error);
      return;
    }
    
    if (!token) {
      console.error('No token received');
      setStatus('error');
      setErrorMessage('No authentication token received. Please try again.');
      return;
    }
    
    const processAuth = async () => {
      try {
        console.log('Processing social auth with token:', token.substring(0, 10) + '...');
        
        // Process the token directly without dispatching
        const authResult = authService.processSocialAuthCallback(token);
        console.log('Token saved to localStorage and cookies');
        
        // Add a small delay to ensure token is properly set before fetching user data
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Now get the user data
        console.log('Dispatching getCurrentUser()');
        const result = await dispatch(getCurrentUser()).unwrap();
        console.log('User data retrieved successfully:', result);
        
        setStatus('success');
        
        // Redirect after short delay to show success message
        setTimeout(() => {
          console.log('Redirecting to home');
          // Make sure we're redirecting to the right place
          router.push('/home');
        }, 1000);
      } catch (error: any) {
        console.error('Error during social authentication:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        setStatus('error');
        setErrorMessage('Failed to complete authentication. Please try again.');
      }
    };
    
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
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary-600 animate-spin mx-auto"></div>
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
              className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
} 