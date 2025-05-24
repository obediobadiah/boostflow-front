'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { getCurrentUser } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function DebugAuthPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, token, error } = useAppSelector((state) => state.auth);

  const handleRefreshUser = async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
      toast.success('User data refreshed');
    } catch (error) {
      toast.error(`Failed to refresh: ${error}`);
    }
  };

  // Get localStorage token on client side
  const getLocalToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Get cookie token
  const getCookieToken = () => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_token') return value;
      }
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Info</h1>
        
        <div className="grid gap-6 mb-6">
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="font-semibold text-lg mb-2">Auth Status:</h2>
            <p><span className="font-medium">Is Authenticated:</span> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><span className="font-medium">Is Loading:</span> {isLoading ? '⏳ Yes' : '✓ No'}</p>
            <p><span className="font-medium">Has Error:</span> {error ? `❌ ${error}` : '✓ No errors'}</p>
          </div>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="font-semibold text-lg mb-2">User Data:</h2>
            {user ? (
              <div>
                <p><span className="font-medium">ID:</span> {user.id}</p>
                <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Role:</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">{user.role}</span></p>
                <pre className="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-red-500">No user data available</p>
            )}
          </div>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="font-semibold text-lg mb-2">Auth Tokens:</h2>
            <p><span className="font-medium">localStorage Token:</span> {getLocalToken() ? '✅ Present' : '❌ Missing'}</p>
            <p><span className="font-medium">Cookie Token:</span> {getCookieToken() ? '✅ Present' : '❌ Missing'}</p>
            <p><span className="font-medium">Redux Token:</span> {token ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={handleRefreshUser} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh User Data'}
          </Button>
          {user?.role === 'admin' && (
            <Button asChild>
              <a href="/users">Go to Users Page</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 