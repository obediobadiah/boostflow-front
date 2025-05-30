'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

type SocialProvider = 'google';

export function SocialAuthButtons() {
  const [isLoading, setIsLoading] = useState<SocialProvider | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(provider);
    try {
      // Get API URL from env or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Prepare redirect URL
      const redirectUrl = `${apiUrl}/auth/${provider}`;
      
      // Redirect to the social auth endpoint
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
      toast.error(`Failed to connect to ${provider}. Please try again.`);
      setIsLoading(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading !== null}
          className="flex items-center justify-center w-full rounded-md bg-white border border-gray-300 py-3 px-4 shadow-sm hover:shadow-md focus:outline-none transition-all disabled:opacity-70"
          aria-label="Sign in with Google"
        >
          {isLoading === 'google' ? (
            <div className="flex items-center justify-center h-full w-full">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="mr-3">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
} 