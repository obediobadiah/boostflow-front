'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL params
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    // Handle error case
    if (error) {
      console.error('Auth error from callback:', error);
      router.push('/login?error=' + encodeURIComponent(error));
      return;
    }
    
    // Handle missing token
    if (!token) {
      console.error('No authentication token received');
      router.push('/login?error=no_token');
      return;
    }

    // Store token in localStorage and redirect to dashboard
    localStorage.setItem('token', token);
    router.push('/home');
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Processing your login...
        </h2>
        <div className="mt-6">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-orange-600 animate-spin mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-600">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
} 