'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { getCurrentUser } from '@/redux/slices/authSlice';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import Cookies from 'js-cookie';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Try to load current user if we don't have one yet
    if (!isLoading) {
      // Always try to fetch user data if we're authenticated but don't have user data
      if (isAuthenticated && !user) {
        dispatch(getCurrentUser());
      }
      // Try to fetch if we have a token but aren't authenticated yet
      else if (!isAuthenticated) {
        const hasToken = localStorage.getItem('token') || Cookies.get('auth_token');
        if (hasToken) {
          dispatch(getCurrentUser());
        } else {
          // If no token, redirect to login without making API call
          router.push('/login');
        }
      }
    }

    // Redirect to login if not authenticated after loading
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, dispatch, router, user]);

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Loading...</h1>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  // If authenticated, render the dashboard layout
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <Sidebar />
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-600">
              © {new Date().getFullYear()} BoostFlow. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}