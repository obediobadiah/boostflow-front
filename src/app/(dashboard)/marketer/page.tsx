'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSend, FiLink, FiTrendingUp, FiDollarSign, FiShoppingBag, FiBarChart2, FiPlus } from 'react-icons/fi';
import { useAppSelector } from '@/redux/store';

export default function MarketerDashboard() {
  const [period, setPeriod] = useState('weekly');
  const { user } = useAppSelector((state) => state.auth);

  // Mock data
  const stats = [
    { title: 'Total Promotions', value: '18', icon: <FiSend className="h-5 w-5" />, change: '+5', color: 'bg-blue-500' },
    { title: 'Clicks Generated', value: '1,254', icon: <FiLink className="h-5 w-5" />, change: '+12%', color: 'bg-green-500' },
    { title: 'Earnings', value: '$842', icon: <FiDollarSign className="h-5 w-5" />, change: '+28%', color: 'bg-purple-500' },
    { title: 'Conversions', value: '32', icon: <FiShoppingBag className="h-5 w-5" />, change: '+4', color: 'bg-orange-500' },
  ];

  const promotions = [
    { id: 1, name: 'Premium Fitness Course', commission: '$12.50 per sale', clicks: 124, conversions: 8 },
    { id: 2, name: 'Digital Marketing eBook', commission: '$5.00 per sale', clicks: 213, conversions: 15 },
    { id: 3, name: 'Photography Masterclass', commission: '$25.00 per sale', clicks: 76, conversions: 4 },
  ];

  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's how your promotions are performing</p>
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
            <h2 className="text-lg font-medium text-gray-900">Earnings Overview</h2>
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
            <h2 className="text-lg font-medium text-gray-900">Click-through Rate</h2>
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
            <FiTrendingUp className="h-16 w-16 text-gray-400" />
            <span className="ml-2 text-gray-500">Chart would appear here</span>
          </div>
        </div>
      </div>

      {/* Active Promotions */}
      <div className="rounded-lg bg-white p-6 shadow-sm mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Active Promotions</h2>
          <Link 
            href="/marketer/products" 
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
                <th className="py-3 text-left font-medium text-gray-700">Commission</th>
                <th className="py-3 text-left font-medium text-gray-700">Clicks</th>
                <th className="py-3 text-left font-medium text-gray-700">Conversions</th>
                <th className="py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="border-b border-gray-200">
                  <td className="py-3 text-sm text-gray-900">{promotion.name}</td>
                  <td className="py-3 text-sm text-gray-900">{promotion.commission}</td>
                  <td className="py-3 text-sm text-gray-900">{promotion.clicks}</td>
                  <td className="py-3 text-sm text-gray-900">{promotion.conversions}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/marketer/promotions/${promotion.id}`}
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