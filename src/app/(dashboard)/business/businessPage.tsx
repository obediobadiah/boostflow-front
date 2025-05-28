'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiTrendingUp, FiDollarSign, FiUsers, FiBarChart2, FiPlus } from 'react-icons/fi';
import { useAppSelector } from '@/redux/store';

export default function BusinessDashboard() {
  const [period, setPeriod] = useState('weekly');
  const { user } = useAppSelector((state) => state.auth);

  // Mock data - would come from API in real app
  const stats = [
    { title: 'Total Products', value: '12', icon: <FiPackage className="h-5 w-5" />, change: '+2', color: 'bg-blue-500' },
    { title: 'Active Promotions', value: '8', icon: <FiTrendingUp className="h-5 w-5" />, change: '+3', color: 'bg-green-500' },
    { title: 'Revenue', value: '$2,532', icon: <FiDollarSign className="h-5 w-5" />, change: '+15%', color: 'bg-purple-500' },
    { title: 'Marketers', value: '24', icon: <FiUsers className="h-5 w-5" />, change: '+5', color: 'bg-orange-500' },
  ];

  const recentProducts = [
    { id: 1, name: 'Premium Fitness Course', price: '$99.99', promoters: 8, sales: 32 },
    { id: 2, name: 'Digital Marketing eBook', price: '$24.99', promoters: 12, sales: 67 },
    { id: 3, name: 'Photography Masterclass', price: '$149.99', promoters: 5, sales: 18 },
  ];

  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName} {user?.lastName}! Here's an overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
            <h2 className="text-lg font-medium text-gray-900">Sales Overview</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setPeriod('weekly')} 
                className={`rounded-md px-3 py-1 text-sm ${
                  period === 'weekly' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setPeriod('monthly')} 
                className={`rounded-md px-3 py-1 text-sm ${
                  period === 'monthly' 
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
            <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
            <Link href="/business/products" className="text-indigo-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="h-64 w-full rounded-md bg-gray-100 flex items-center justify-center">
            <FiBarChart2 className="h-16 w-16 text-gray-400" />
            <span className="ml-2 text-gray-500">Chart would appear here</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="rounded-lg bg-white p-6 shadow-sm mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Products</h2>
          <Link 
            href="/business/products/new" 
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <FiPlus className="mr-1 h-4 w-4" />
            Add Product
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left font-medium text-gray-700">Product Name</th>
                <th className="py-3 text-left font-medium text-gray-700">Price</th>
                <th className="py-3 text-left font-medium text-gray-700">Promoters</th>
                <th className="py-3 text-left font-medium text-gray-700">Sales</th>
                <th className="py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200">
                  <td className="py-3 text-sm text-gray-900">{product.name}</td>
                  <td className="py-3 text-sm text-gray-900">{product.price}</td>
                  <td className="py-3 text-sm text-gray-900">{product.promoters}</td>
                  <td className="py-3 text-sm text-gray-900">{product.sales}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/business/products/${product.id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 