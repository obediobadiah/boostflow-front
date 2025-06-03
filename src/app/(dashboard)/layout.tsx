'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { getCurrentUser } from '@/redux/slices/authSlice';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  
  // Use NextAuth session
  const { data: session, status } = useSession();
  const isSessionLoading = status === 'loading';
  const isSessionAuthenticated = status === 'authenticated';

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    // Use NextAuth session status to determine authentication
    if (!isSessionLoading) {
      if (isSessionAuthenticated && session?.user) {
        // We have a valid NextAuth session, try to get additional user data if needed
        if (!user) {
          dispatch(getCurrentUser());
        }
      } else {
        // No valid NextAuth session, redirect to login
        console.log('Redirecting to login: No valid session');
        router.push('/login');
      }
    }
  }, [session, status, isSessionLoading, dispatch, router, user]);

  // If still loading, show a loading state
  if (isSessionLoading || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Loading...</h1>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, redirect (though this should be handled by the middleware)
  if (!isSessionLoading && !isSessionAuthenticated) {
    console.log('Not authenticated, should redirect');
    router.push('/login');
    return null;
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