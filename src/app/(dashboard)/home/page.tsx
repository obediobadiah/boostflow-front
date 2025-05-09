'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSend, FiLink, FiTrendingUp, FiDollarSign, FiShoppingBag, FiBarChart2, FiPlus, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAppSelector } from '@/redux/store';
import { dashboardService } from '@/lib/api/dashboard.service';
import type { PromotionStats, ProductStats, PaginatedResponse, PromotionAggregateStats, MonthlyProductStats } from '@/lib/api/dashboard.service';
import { Pagination } from '@/components/ui/pagination';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts';

// Get current month and year for data display
const getCurrentMonthYear = () => {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current month and year
  const currentMonthYear = getCurrentMonthYear();
  
  // Parse month and year from the string
  const parseMonthYear = (monthYearStr: string): { month: number, year: number } => {
    const [monthName, yearStr] = monthYearStr.split(' ');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      month: months.indexOf(monthName) + 1,
      year: parseInt(yearStr)
    };
  };
  
  // Month navigation state - initialize with current month/year
  const [currentProductMonth, setCurrentProductMonth] = useState(currentMonthYear);
  
  // Real monthly product stats
  const [monthlyProductStats, setMonthlyProductStats] = useState<MonthlyProductStats | null>(null);
  const [realProductData, setRealProductData] = useState<any[]>([]);
  
  const [currentPromotionMonth, setCurrentPromotionMonth] = useState(currentMonthYear);
  
  // Get available months (last 6 months)
  const getAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      months.push(`${monthName} ${year}`);
    }
    
    return months;
  };
  
  const availableMonths = getAvailableMonths();
  
  // Navigate to the previous/next month
  const navigateProductMonth = (direction: 'prev' | 'next') => {
    const currentIndex = availableMonths.indexOf(currentProductMonth);
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentProductMonth(availableMonths[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableMonths.length - 1) {
      setCurrentProductMonth(availableMonths[currentIndex + 1]);
    }
  };
  
  const navigatePromotionMonth = (direction: 'prev' | 'next') => {
    const currentIndex = availableMonths.indexOf(currentPromotionMonth);
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentPromotionMonth(availableMonths[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableMonths.length - 1) {
      setCurrentPromotionMonth(availableMonths[currentIndex + 1]);
    }
  };

  // Product stats
  const [productStats, setProductStats] = useState<{
    totalProducts: number;
    change: string;
  } | null>(null);

  // Promotion stats
  const [promotionStats, setPromotionStats] = useState<PromotionAggregateStats | null>(null);

  const [promotions, setPromotions] = useState<PromotionStats[]>([]);
  const [promotionPage, setPromotionPage] = useState(1);
  const [promotionTotalPages, setPromotionTotalPages] = useState(1);
  const [promotionTotal, setPromotionTotal] = useState(0);
  const promotionLimit = 5;

  const [products, setProducts] = useState<ProductStats[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const productLimit = 5;

  const { user } = useAppSelector((state) => state.auth);

  // Near the beginning of the component, add a state variable for promotion data
  const [monthlyPromotionData, setMonthlyPromotionData] = useState<Record<string, any[]>>({});

  // Handle authentication errors
  const handleAuthError = async (error: any) => {
    console.error('Authentication error:', error);

    // Try to refresh the token
    const tokenRefreshed = await dashboardService.refreshAuthToken();

    // If token refresh failed, redirect to login
    if (!tokenRefreshed) {
      setError('Your session has expired. Please log in again.');
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }

    return tokenRefreshed;
  };

  // Load monthly product stats
  const fetchMonthlyProductStats = async (month: number, year: number) => {
    setIsLoading(true);
    try {
      // Fetch product stats directly from our new endpoint
      const response = await dashboardService.getMonthlyProductStats(year, month);
      if (response && response.success) {
        // Use the real data directly from the response
        setRealProductData(response.data.weeklyData);
        
        // Set monthly stats for other displays
        setMonthlyProductStats({
          totalProducts: productStats?.totalProducts || 0,
          totalViews: response.data.summary.totalViews,
          weeklyViews: response.data.weeklyData.map((item: any) => ({
            week: item.name.replace('Week ', ''),
            count: item.views
          })),
          estimatedRevenue: response.data.summary.estimatedRevenue,
          change: {
            products: response.data.summary.productsPercentChange + '%',
            views: response.data.summary.viewsPercentChange + '%'
          }
        });
      } else {
        // If API call fails, use empty array instead of sample data
        setRealProductData([]);
      }
    } catch (error) {
      console.error('Error fetching monthly product stats:', error);
      setRealProductData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load monthly promotion stats
  const fetchMonthlyPromotionStats = async (month: number, year: number) => {
    try {
      // Fetch promotion stats directly from our new endpoint
      const response = await dashboardService.getMonthlyPromotionStats(year, month);
      
      if (response && response.success) {
        // Use the real promotion data from the API
        setMonthlyPromotionData({
          ...monthlyPromotionData,
          [currentPromotionMonth]: response.data.weeklyData
        });
      } else {
        // If API call fails, set empty array for this month
        setMonthlyPromotionData({
          ...monthlyPromotionData,
          [currentPromotionMonth]: []
        });
      }
    } catch (error) {
      console.error('Error fetching monthly promotion stats:', error);
      // Set empty array in case of error
      setMonthlyPromotionData({
        ...monthlyPromotionData,
        [currentPromotionMonth]: []
      });
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all stats in parallel
        const [productStatsData, promotionStatsData] = await Promise.all([
          dashboardService.getProductStatistics(),
          dashboardService.getPromotionStatistics(),
        ]);

        // Set data to state
        setProductStats(productStatsData);
        setPromotionStats(promotionStatsData);

        // Get current month and year for fetching monthly stats
        const { month, year } = parseMonthYear(currentProductMonth);
        await fetchMonthlyProductStats(month, year);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401) {
          const refreshed = await handleAuthError(error);
          if (refreshed) {
            // Try fetching again with the new token
            fetchDashboardData();
            return;
          }
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Monitor month changes for product stats
  useEffect(() => {
    const { month, year } = parseMonthYear(currentProductMonth);
    fetchMonthlyProductStats(month, year);
  }, [currentProductMonth]);

  // Monitor month changes for promotion stats
  useEffect(() => {
    const { month, year } = parseMonthYear(currentPromotionMonth);
    fetchMonthlyPromotionStats(month, year);
  }, [currentPromotionMonth]);

  // Fetch products with pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await dashboardService.getActiveProducts(productPage, productLimit);
        if (response?.data) {
          setProducts(response.data);
          setProductTotalPages(response.totalPages || 1);
          setProductTotal(response.total || 0);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401) {
          await handleAuthError(error);
        }
      }
    };

    fetchProducts();
  }, [productPage, router, user]);

  // Fetch promotions with pagination
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await dashboardService.getActivePromotions(promotionPage, promotionLimit);
        if (response?.data) {
          setPromotions(response.data);
          setPromotionTotalPages(response.totalPages || 1);
          setPromotionTotal(response.total || 0);
        }
      } catch (error: any) {
        console.error('Error fetching promotions:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401) {
          await handleAuthError(error);
        }
      }
    };

    fetchPromotions();
  }, [promotionPage, router, user]);

  // Generate stats based on fetched data
  const stats = [
    {
      id: 'total-products',
      title: 'Total Products',
      value: productStats ? productStats.totalProducts.toString() : '0',
      icon: <FiSend className="h-5 w-5" />,
      change: productStats?.change || '0',
      color: 'bg-blue-500'
    },
    {
      id: 'total-promotions',
      title: 'Total Promotions',
      value: promotionStats ? promotionStats.totalPromotions.toString() : '0',
      icon: <FiLink className="h-5 w-5" />,
      change: promotionStats?.change?.promotions || '0',
      color: 'bg-green-500'
    },
    {
      id: 'earnings',
      title: 'Earnings',
      value: promotionStats ? `$${promotionStats.earnings}` : '$0',
      icon: <FiDollarSign className="h-5 w-5" />,
      change: promotionStats?.change?.earnings || '0',
      color: 'bg-purple-500'
    },
    {
      id: 'conversions',
      title: 'Conversions',
      value: promotionStats ? promotionStats.conversions.toString() : '0',
      icon: <FiShoppingBag className="h-5 w-5" />,
      change: promotionStats?.change?.conversions || '0',
      color: 'bg-orange-500'
    },
  ];

  // Handle page changes
  const handleProductPageChange = (page: number) => {
    setProductPage(page);
  };

  const handlePromotionPageChange = (page: number) => {
    setPromotionPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">{error}</p>
          {error.includes('session') && (
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Go to Login
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-3 lg:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Home Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome back, {user?.name}! Here's how your promotions are performing</p>
      </div>

      {/* Stats Grid - Shown to all users */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-lg bg-white p-4 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
              <div className="mt-1 flex items-center text-xs font-medium text-green-600">
                {stat.change}
                <span className="ml-1">from last period</span>
              </div>
            </div>
            <div className={`${stat.color} p-2 rounded-full text-white`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row - Shown to all users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">Products Overview</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigateProductMonth('prev')}
                className="p-1 rounded-full hover:bg-gray-100"
                disabled={availableMonths.indexOf(currentProductMonth) === 0}
              >
                <FiChevronLeft className={availableMonths.indexOf(currentProductMonth) === 0 ? "text-gray-300" : "text-gray-600"} />
              </button>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
                {currentProductMonth}
              </div>
              <button 
                onClick={() => navigateProductMonth('next')}
                className="p-1 rounded-full hover:bg-gray-100"
                disabled={availableMonths.indexOf(currentProductMonth) === availableMonths.length - 1}
              >
                <FiChevronRight className={availableMonths.indexOf(currentProductMonth) === availableMonths.length - 1 ? "text-gray-300" : "text-gray-600"} />
              </button>
            </div>
          </div>
          <div className="h-64 w-full rounded-md bg-gray-50 p-3">
            <div className="text-xs text-gray-600 mb-1">Product Performance</div>
            {/* Render the chart with real data only */}
            <ResponsiveContainer width="100%" height="85%">
              <BarChart 
                data={realProductData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}`, '']}
                />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="views" fill="#10b981" stroke="#10b981" fillOpacity={0.2} name="Views" />
                <Bar dataKey="revenue" fill="#0ea5e9" stroke="#0ea5e9" fillOpacity={0.2} name="Est. Revenue ($)" />
                <Bar dataKey="productsCreated" fill="#6366f1" stroke="#6366f1" fillOpacity={0.2} name="New Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">Promotions Overview</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigatePromotionMonth('prev')}
                className="p-1 rounded-full hover:bg-gray-100"
                disabled={availableMonths.indexOf(currentPromotionMonth) === 0}
              >
                <FiChevronLeft className={availableMonths.indexOf(currentPromotionMonth) === 0 ? "text-gray-300" : "text-gray-600"} />
              </button>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
                {currentPromotionMonth}
              </div>
              <button 
                onClick={() => navigatePromotionMonth('next')}
                className="p-1 rounded-full hover:bg-gray-100"
                disabled={availableMonths.indexOf(currentPromotionMonth) === availableMonths.length - 1}
              >
                <FiChevronRight className={availableMonths.indexOf(currentPromotionMonth) === availableMonths.length - 1 ? "text-gray-300" : "text-gray-600"} />
              </button>
            </div>
          </div>
          <div className="h-64 w-full rounded-md bg-gray-50 p-3">
            <div className="text-xs text-gray-600 mb-1">Promotion Performance</div>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart
                data={monthlyPromotionData[currentPromotionMonth] || []}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}`, '']}
                />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Area type="monotone" dataKey="clicks" fill="#10b981" stroke="#10b981" fillOpacity={0.2} name="Clicks" />
                <Area type="monotone" dataKey="conversions" fill="#0ea5e9" stroke="#0ea5e9" fillOpacity={0.2} name="Conversions" />
                <Area type="monotone" dataKey="earnings" fill="#6366f1" stroke="#6366f1" fillOpacity={0.2} name="Earnings ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Products and Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Products Table */}
        <div className="rounded-lg bg-white p-4 shadow-sm mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-gray-900">
                {user?.role === 'admin' ? 'All Active Products' : 'Active Products'}
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-orange-700"
            >
              <FiPlus className="mr-1 h-3 w-3" />
              {user?.role === 'business' ? 'Add New Product' : 'Find Products to Promote'}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Product Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Price</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Commission</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Owner</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products && products.length > 0 ? (
                  products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900 font-medium">{product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}</td>
                      <td className="px-3 py-2 text-gray-600">{product.price}</td>
                      <td className="px-3 py-2 text-gray-600">{product.category}</td>
                      <td className="px-3 py-2 text-gray-600">{product.commissionRate}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {product.ownerName}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      <p className="text-sm">No active products found</p>
                      <Link
                        href="/products"
                        className="mt-1 inline-block text-orange-600 hover:text-orange-900 text-xs font-medium"
                      >
                        Browse to see all products
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {products && products.length > 0 && (
              <Pagination
                currentPage={productPage}
                totalPages={productTotalPages}
                onPageChange={handleProductPageChange}
                totalItems={productTotal}
                itemsPerPage={productLimit}
              />
            )}
          </div>
        </div>

        {/* Active Promotions Table */}
        <div className="rounded-lg bg-white p-4 shadow-sm mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-gray-900">
                {user?.role === 'admin' ? 'All Active Promotions' : 'Your Active Promotions'}
              </h2>
            </div>
            <Link
              href="/promotions"
              className="inline-flex items-center justify-center rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-orange-700"
            >
              <FiPlus className="mr-1 h-3 w-3" />
              View All Promotions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Promotion Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Commission</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Clicks</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Promoter</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promotions && promotions.length > 0 ? (
                  promotions.map((promotion: any) => (
                    <tr key={promotion.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900 font-medium">{promotion.name.length > 30 ? `${promotion.name.substring(0, 30)}...` : promotion.name}</td>
                      <td className="px-3 py-2 text-gray-600">{promotion.commission}</td>
                      <td className="px-3 py-2 text-gray-600">{promotion.clicks}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {promotion.promoterName || 'Unknown'}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{promotion.conversions}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      <p className="text-sm">No active promotions found</p>
                      <Link
                        href="/products"
                        className="mt-1 inline-block text-orange-600 hover:text-orange-900 text-xs font-medium"
                      >
                        Browse products to promote
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {promotions && promotions.length > 0 && (
              <Pagination
                currentPage={promotionPage}
                totalPages={promotionTotalPages}
                onPageChange={handlePromotionPageChange}
                totalItems={promotionTotal}
                itemsPerPage={promotionLimit}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 