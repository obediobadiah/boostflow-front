'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSend, FiLink, FiTrendingUp, FiDollarSign, FiShoppingBag, FiBarChart2, FiPlus } from 'react-icons/fi';
import { useAppSelector } from '@/redux/store';
import { statisticsService } from '@/lib/api/statistics.service';
import type { DashboardStats, PromotionStats, PlatformStatistics, ProductStats, PaginatedResponse } from '@/lib/api/statistics.service';
import { Pagination } from '@/components/ui/pagination';

export default function HomePage() {
  const [period, setPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
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
  
  const [platformStats, setPlatformStats] = useState<PlatformStatistics | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard stats and platform stats
        const [statsData, platformData] = await Promise.all([
          statisticsService.getDashboardStats(),
          statisticsService.getPlatformStatistics()
        ]);

        setDashboardStats(statsData);
        setPlatformStats(platformData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch promotions with pagination
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await statisticsService.getActivePromotions(promotionPage, promotionLimit);
        setPromotions(response.data);
        setPromotionTotalPages(response.totalPages);
        setPromotionTotal(response.total);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    };

    fetchPromotions();
  }, [promotionPage]);

  // Fetch products with pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await statisticsService.getActiveProducts(productPage, productLimit);
        setProducts(response.data);
        setProductTotalPages(response.totalPages);
        setProductTotal(response.total);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [productPage]);

  // Generate stats based on fetched data
  const stats = dashboardStats ? [
    {
      title: 'Total Products',
      value: dashboardStats.totalPromotions.toString(),
      icon: <FiSend className="h-5 w-5" />,
      change: dashboardStats.change.promotions,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Promotions',
      value: dashboardStats.clicksGenerated.toLocaleString(),
      icon: <FiLink className="h-5 w-5" />,
      change: dashboardStats.change.clicks,
      color: 'bg-green-500'
    },
    {
      title: 'Earnings',
      value: `$${dashboardStats.earnings}`,
      icon: <FiDollarSign className="h-5 w-5" />,
      change: dashboardStats.change.earnings,
      color: 'bg-purple-500'
    },
    {
      title: 'Conversions',
      value: dashboardStats.conversions.toString(),
      icon: <FiShoppingBag className="h-5 w-5" />,
      change: dashboardStats.change.conversions,
      color: 'bg-orange-500'
    },
  ] : [];

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

  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Home Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's how your promotions are performing</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-6 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              <div className="mt-2 flex items-center text-sm font-medium text-green-600">
                {stat.change}
                <span className="ml-1">from last period</span>
              </div>
            </div>
            <div className={`${stat.color} p-3 rounded-full text-white`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Products Overview</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPeriod('weekly')}
                className={`rounded-md px-3 py-1 text-sm ${period === 'weekly'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`rounded-md px-3 py-1 text-sm ${period === 'monthly'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-64 w-full rounded-md bg-gray-100 flex items-center justify-center">
            <FiBarChart2 className="h-16 w-16 text-gray-400" />
            <span className="ml-2 text-gray-500">Chart would appear here</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Promotions Overview</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPeriod('weekly')}
                className={`rounded-md px-3 py-1 text-sm ${period === 'weekly'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`rounded-md px-3 py-1 text-sm ${period === 'monthly'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-64 w-full rounded-md bg-gray-100 flex items-center justify-center">
            <FiTrendingUp className="h-16 w-16 text-gray-400" />
            <span className="ml-2 text-gray-500">Chart would appear here</span>
          </div>
        </div>
      </div>

      {/* Active Products and Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Products Table */}
        <div className="rounded-lg bg-white p-6 shadow-sm mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Products</h2>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <FiPlus className="mr-1 h-4 w-4" />
              Find Products to Promote
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left font-medium text-gray-700">Product Name</th>
                  <th className="py-3 text-left font-medium text-gray-700">Price</th>
                  <th className="py-3 text-left font-medium text-gray-700">Category</th>
                  <th className="py-3 text-left font-medium text-gray-700">Commission</th>
                  <th className="py-3 text-right font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200">
                      <td className="py-3 text-sm text-gray-900">{product.name}</td>
                      <td className="py-3 text-sm text-gray-900">{product.price}</td>
                      <td className="py-3 text-sm text-gray-900">{product.category}</td>
                      <td className="py-3 text-sm text-gray-900">{product.commissionRate}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <p>No active products found</p>
                      <Link
                        href="/products"
                        className="mt-2 inline-block text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Browse products to promote
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {products.length > 0 && (
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
        <div className="rounded-lg bg-white p-6 shadow-sm mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Promotions</h2>
            <Link
              href="/promotions"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <FiPlus className="mr-1 h-4 w-4" />
              View All Promotions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left font-medium text-gray-700">Promotion Name</th>
                  <th className="py-3 text-left font-medium text-gray-700">Commission</th>
                  <th className="py-3 text-left font-medium text-gray-700">Clicks</th>
                  <th className="py-3 text-left font-medium text-gray-700">Conversions</th>
                  <th className="py-3 text-right font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.length > 0 ? (
                  promotions.map((promotion) => (
                    <tr key={promotion.id} className="border-b border-gray-200">
                      <td className="py-3 text-sm text-gray-900">{promotion.name}</td>
                      <td className="py-3 text-sm text-gray-900">{promotion.commission}</td>
                      <td className="py-3 text-sm text-gray-900">{promotion.clicks}</td>
                      <td className="py-3 text-sm text-gray-900">{promotion.conversions}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/promotions/${promotion.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <p>No active promotions found</p>
                      <Link
                        href="/products"
                        className="mt-2 inline-block text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Browse products to promote
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {promotions.length > 0 && (
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