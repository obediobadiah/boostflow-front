'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiFilter } from 'react-icons/fi';
import { earningsService, type Earnings, type EarningsStats } from '@/lib/api/earnings.service';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<EarningsStats['data'] | null>(null);
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsResponse, earningsResponse] = await Promise.all([
          earningsService.getEarningsStats(),
          earningsService.getUserEarnings(currentPage)
        ]);
        setStats(statsResponse.data);
        setEarnings(earningsResponse.data.earnings);
        setTotalPages(earningsResponse.data.totalPages);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Track your earnings and promotion performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white border-gray-200 text-gray-900">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="week" className="text-gray-900 hover:bg-gray-200">Last 7 Days</SelectItem>
              <SelectItem value="month" className="text-gray-900 hover:bg-gray-200">This Month</SelectItem>
              <SelectItem value="year" className="text-gray-900 hover:bg-gray-200">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            <FiDollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats?.totalEarnings.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-emerald-600 mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Earnings</CardTitle>
            <FiTrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats?.pendingEarnings.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-blue-600 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Earnings</CardTitle>
            <FiCalendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats?.paidEarnings.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-purple-600 mt-1">Successfully paid</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cancelled Earnings</CardTitle>
            <FiFilter className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats?.cancelledEarnings.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-red-600 mt-1">Cancelled earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card className="mb-8 bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Monthly Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.monthlyEarnings || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  fill="url(#earningsGradient)"
                  name="Earnings ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings Table */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => (
                  <tr key={earning.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">
                      {format(new Date(earning.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-900">${earning.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-900 capitalize">{earning.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        earning.status === 'paid' 
                          ? 'bg-emerald-50 text-emerald-700'
                          : earning.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {earning.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{earning.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 