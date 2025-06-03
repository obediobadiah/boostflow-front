'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';

export const SocialAuthButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl: '/auth/callback' });
      // Note: No need to handle success here as the redirect will happen automatically
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="h-5 w-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin" />
        ) : (
          <FcGoogle className="h-5 w-5" />
        )}
        <span>{isLoading ? 'Signing in...' : 'Google'}</span>
      </button>
    </div>
  );
}; 