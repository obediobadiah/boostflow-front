'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { getCurrentUser } from '@/redux/slices/authSlice';
import { PageLayout } from '@/components/layout/page-layout';
import { FiBarChart2, FiGlobe, FiSend, FiTarget } from 'react-icons/fi';

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    // First, try to get current user if we're not sure of the auth state
    if (!isLoading && !isAuthenticated && !user) {
      // Check if token exists before dispatching action
      const hasToken = 
        typeof window !== 'undefined' && 
        (localStorage.getItem('token') || document.cookie.includes('auth_token='));
      
      if (hasToken) {
        dispatch(getCurrentUser());
      }
    }
  }, [dispatch, isAuthenticated, isLoading, user]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Use replace instead of push for cleaner navigation history
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  // If still loading auth state, show minimal loading
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  // Only show landing page if not authenticated
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 py-20 text-white">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center">
            <div>
              {/* <div className="flex items-center mb-8">
                <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-16 w-auto mr-4" />
                <h2 className="text-3xl font-bold">BoostFlow</h2>
              </div> */}
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Boost Your Product Sales with Automated Social Media Promotion
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                BoostFlow helps businesses promote products, automatically post on social media, and track commissions all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-6 text-base">
                  Get Started Free
                </Link>
                <Link href="/login" className="btn bg-transparent border border-white hover:bg-white/10 py-3 px-6 text-base">
                  Log In
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="space-y-4">
                  <div className="h-8 w-full rounded bg-white/20"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded bg-white/20"></div>
                    <div className="h-24 rounded bg-white/20"></div>
                  </div>
                  <div className="h-32 w-full rounded bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Promote</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              BoostFlow combines powerful tools to help businesses and marketers succeed with social media promotion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FiGlobe className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Media Integration</h3>
              <p className="text-gray-600">
                Connect to multiple platforms and post your content with a single click.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FiSend className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Posting</h3>
              <p className="text-gray-600">
                Schedule and automate your posts to maximize engagement and reach.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FiTarget className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Commission Tracking</h3>
              <p className="text-gray-600">
                Monitor sales and track commissions with detailed analytics and reports.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FiBarChart2 className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
              <p className="text-gray-600">
                Gain insights with detailed performance metrics and engagement data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-8 md:p-12 rounded-2xl text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Business?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of businesses and marketers who are growing their reach and increasing sales with BoostFlow.
            </p>
            <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-8 text-base font-medium">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
} 