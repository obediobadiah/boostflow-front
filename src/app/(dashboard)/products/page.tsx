'use client';

import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiDollarSign, FiPackage, FiTag, FiX, FiSliders, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productService, authService } from '@/lib/api';
import { toast } from 'react-hot-toast';

// ProductCard component inside the file scope
function ProductCard({ product }: { product: any }) {
  const defaultImage = 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col group border border-gray-200 hover:border-orange-300">
        <div className="relative h-48 overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0] || defaultImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${product.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
            {product.active ? 'Active' : 'Inactive'}
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
              {product.name}
            </CardTitle>
            <div className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md whitespace-nowrap">
              ${parseFloat(product.price).toFixed(2)}
            </div>
          </div>
          <CardDescription className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <FiPackage className="h-3 w-3" />
            <span className="capitalize">{product.category}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-2 pb-3 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
          <div className="flex items-center text-sm gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-flex">
            <FiTag className="h-3 w-3" />
            <span className="font-medium">
              {product.commissionType === 'percentage'
                ? `${product.commissionRate}% commission`
                : `$${product.commissionRate} commission`}
            </span>
          </div>
        </CardContent>

        <div className="p-4 pt-2 mt-auto border-t border-gray-100">
          <div className="w-full flex items-center">
            <span className="text-sm font-medium text-orange-600 group-hover:text-orange-700 flex items-center transition-colors duration-200">
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Main page component
export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [dateRange, setDateRange] = useState<string>('all');
  const [commissionRange, setCommissionRange] = useState<[number, number]>([0, 100]);
  const [commissionType, setCommissionType] = useState<string>('all');
  const [fixedCommissionRange, setFixedCommissionRange] = useState<[number, number]>([0, 100]);
  const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    async function fetchUserAndProducts() {
      try {
        setLoading(true);

        // Fetch current user info first
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);

        // Then fetch products
        const response = await productService.getAllProducts();
        setProducts(response.products || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    // Hide inactive products for non-owners and non-admins
    const isAdmin = currentUser?.role === 'admin';
    const isOwner = product.ownerId === currentUser?.id ||
      product.createdBy?.id === currentUser?.id;

    // If product is inactive and user is not admin or owner, don't show it
    if (!product.active && !isAdmin && !isOwner) {
      return false;
    }

    const matchesSearch = searchTerm === '' ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

    // Additional filters
    const price = parseFloat(product.price);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    // Commission filter logic
    let matchesCommission = true;
    if (product.commissionType === 'percentage') {
      const commission = parseFloat(product.commissionRate);
      matchesCommission = commission >= commissionRange[0] && commission <= commissionRange[1];
    } else if (product.commissionType === 'fixed') {
      const fixedCommission = parseFloat(product.commissionRate);
      matchesCommission = fixedCommission >= fixedCommissionRange[0] && fixedCommission <= fixedCommissionRange[1];
    }

    const matchesCommissionType = commissionType === 'all' ||
      (commissionType === 'percentage' && product.commissionType === 'percentage') ||
      (commissionType === 'fixed' && product.commissionType === 'fixed');

    // Date filter
    let matchesDate = true;
    if (dateRange !== 'all') {
      const productDate = new Date(product.createdAt);
      const now = new Date();

      if (dateRange === 'recent') {
        // Last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = productDate >= thirtyDaysAgo;
      } else if (dateRange === 'this-month') {
        // This month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesDate = productDate >= startOfMonth;
      } else if (dateRange === 'last-month') {
        // Last month
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        matchesDate = productDate >= startOfLastMonth && productDate <= endOfLastMonth;
      } else if (dateRange === 'custom' && dateFilter[0] && dateFilter[1]) {
        // Custom date range
        dateFilter[1].setHours(23, 59, 59, 999); // Set to end of day
        matchesDate = productDate >= dateFilter[0] && productDate <= dateFilter[1];
      }
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesCommission && matchesCommissionType && matchesDate;
  });

  const resetFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 1000]);
    setDateRange('all');
    setCommissionRange([0, 100]);
    setFixedCommissionRange([0, 100]);
    setCommissionType('all');
    setDateFilter([null, null]);
  };

  // Check if user can create products (business or admin only)
  const canCreateProducts = currentUser && (currentUser.role === 'business' || currentUser.role === 'admin');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setFilterSheetOpen(true)}
                >
                  <FiFilter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                {canCreateProducts && (
                  <Link href="/products/new">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add New Product
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="px-4 pt-2">
              <TabsList>
                <TabsTrigger value="all">All Products ( {filteredProducts.length || 0} ) </TabsTrigger>
                <TabsTrigger value="active">Active ( {filteredProducts.filter(product => product.active).length || 0} ) </TabsTrigger>
                <TabsTrigger value="inactive">Deactivated ( {filteredProducts.filter(product => !product.active).length || 0} ) </TabsTrigger>
              </TabsList>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <TabsContent value="all" className="p-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No products found</p>
                      <Link href="/products/new" className="text-orange-600 hover:underline mt-2 inline-block">
                        Create your first product 
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="active" className="p-4">
                  {filteredProducts.filter(product => product.active).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active products found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts
                        .filter(product => product.active)
                        .map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="inactive" className="p-4">
                  {filteredProducts.filter(product => {
                    // Admin can see all inactive products
                    if (currentUser?.role === 'admin') return !product.active;
                    // Non-admin users can only see their own inactive products
                    return !product.active && product.ownerId === currentUser?.id;
                  }).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {currentUser?.role === 'admin' 
                          ? 'No deactivated products found'
                          : 'No deactivated products found in your account'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts
                        .filter(product => {
                          // Admin can see all inactive products
                          if (currentUser?.role === 'admin') return !product.active;
                          // Non-admin users can only see their own inactive products
                          return !product.active && product.ownerId === currentUser?.id;
                        })
                        .map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>

        {/* Desktop Filter Panel - Right Side */}
        <div className="hidden lg:block w-1/4 bg-white rounded-lg shadow h-fit sticky top-6">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filter Products</h2>
              <button
                className="text-gray-400 hover:text-red-500 text-sm"
                onClick={resetFilters}
              >
                Reset All
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center">
                <FiDollarSign className="mr-2" />
                Price Range
              </h3>
              <div className="px-2">
                <div className="flex justify-between mb-2 text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center">
                <FiPackage className="mr-2" />
                Category
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded-md border text-sm ${selectedCategory === '' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setSelectedCategory('')}
                >
                  <span>All</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${selectedCategory === 'digital' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setSelectedCategory('digital')}
                >
                  <span>Digital</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${selectedCategory === 'physical' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setSelectedCategory('physical')}
                >
                  <span>Physical</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${selectedCategory === 'service' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setSelectedCategory('service')}
                >
                  <span>Service</span>
                </button>
              </div>
            </div>

            {/* Commission Type */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center">
                <FiTag className="mr-2" />
                Commission Type
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`p-2 rounded-md border text-sm ${commissionType === 'all' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setCommissionType('all')}
                >
                  <span>All</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${commissionType === 'percentage' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setCommissionType('percentage')}
                >
                  <span>%</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${commissionType === 'fixed' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setCommissionType('fixed')}
                >
                  <span>Fixed</span>
                </button>
              </div>
            </div>

            {/* Percentage Commission Range */}
            <div className={`space-y-3 ${commissionType === 'fixed' ? 'opacity-50' : ''}`}>
              <h3 className="text-sm font-medium flex items-center">
                <FiSliders className="mr-2" />
                Percentage Commission (%)
              </h3>
              <div className="px-2">
                <div className="flex justify-between mb-2 text-sm">
                  <span>{commissionRange[0]}%</span>
                  <span>{commissionRange[1]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={commissionRange[1]}
                  onChange={(e) => setCommissionRange([commissionRange[0], parseInt(e.target.value)])}
                  className="w-full"
                  disabled={commissionType === 'fixed'}
                />
              </div>
            </div>

            {/* Fixed Commission Range */}
            <div className={`space-y-3 ${commissionType === 'percentage' ? 'opacity-50' : ''}`}>
              <h3 className="text-sm font-medium flex items-center">
                <FiDollarSign className="mr-2" />
                Fixed Commission Amount ($)
              </h3>
              <div className="px-2">
                <div className="flex justify-between mb-2 text-sm">
                  <span>${fixedCommissionRange[0]}</span>
                  <span>${fixedCommissionRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={fixedCommissionRange[1]}
                  onChange={(e) => setFixedCommissionRange([fixedCommissionRange[0], parseInt(e.target.value)])}
                  className="w-full"
                  disabled={commissionType === 'percentage'}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center">
                <FiCalendar className="mr-2" />
                Date Added
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded-md border text-sm ${dateRange === 'all' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setDateRange('all')}
                >
                  <span>All Time</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${dateRange === 'recent' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setDateRange('recent')}
                >
                  <span>Last 30 days</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${dateRange === 'this-month' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setDateRange('this-month')}
                >
                  <span>This Month</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${dateRange === 'last-month' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                  onClick={() => setDateRange('last-month')}
                >
                  <span>Last Month</span>
                </button>
                <button
                  className={`p-2 rounded-md border text-sm ${dateRange === 'custom' ? 'bg-orange-50 border-orange-300' : 'bg-white'} col-span-2`}
                  onClick={() => setDateRange('custom')}
                >
                  <span>Custom Range</span>
                </button>
              </div>

              {dateRange === 'custom' && (
                <div className="mt-2 space-y-3 bg-gray-50 p-3 rounded-md">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Start Date:</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        setDateFilter([date, dateFilter[1]]);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">End Date:</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        setDateFilter([dateFilter[0], date]);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
              onClick={() => resetFilters()}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer - Only shown on smaller screens */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden lg:hidden">
          <div className="fixed inset-y-0 right-0 bg-white w-[90vw] max-w-[450px] flex flex-col shadow-xl animate-slide-in-right">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Filter Products</h2>
                <div className="flex items-center gap-4">
                  <button
                    className="text-gray-400 hover:text-red-500 text-sm"
                    onClick={resetFilters}
                  >
                    Reset All
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setFilterSheetOpen(false)}
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <FiDollarSign className="mr-2" />
                  Price Range
                </h3>
                <div className="px-2">
                  <div className="flex justify-between mb-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <FiPackage className="mr-2" />
                  Category
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`p-3 rounded-md border ${selectedCategory === '' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setSelectedCategory('')}
                  >
                    <span>All</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${selectedCategory === 'digital' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setSelectedCategory('digital')}
                  >
                    <span>Digital</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${selectedCategory === 'physical' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setSelectedCategory('physical')}
                  >
                    <span>Physical</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${selectedCategory === 'service' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setSelectedCategory('service')}
                  >
                    <span>Service</span>
                  </button>
                </div>
              </div>

              {/* Commission Type */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <FiTag className="mr-2" />
                  Commission Type
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`p-3 rounded-md border ${commissionType === 'all' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setCommissionType('all')}
                  >
                    <span>All</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${commissionType === 'percentage' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setCommissionType('percentage')}
                  >
                    <span>Percentage</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${commissionType === 'fixed' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setCommissionType('fixed')}
                  >
                    <span>Fixed</span>
                  </button>
                </div>
              </div>

              {/* Percentage Commission Range */}
              <div className={`space-y-3 ${commissionType === 'fixed' ? 'opacity-50' : ''}`}>
                <h3 className="text-lg font-medium flex items-center">
                  <FiSliders className="mr-2" />
                  Percentage Commission (%)
                </h3>
                <div className="px-2">
                  <div className="flex justify-between mb-2">
                    <span>{commissionRange[0]}%</span>
                    <span>{commissionRange[1]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={commissionRange[1]}
                    onChange={(e) => setCommissionRange([commissionRange[0], parseInt(e.target.value)])}
                    className="w-full"
                    disabled={commissionType === 'fixed'}
                  />
                </div>
              </div>

              {/* Fixed Commission Range */}
              <div className={`space-y-3 ${commissionType === 'percentage' ? 'opacity-50' : ''}`}>
                <h3 className="text-lg font-medium flex items-center">
                  <FiDollarSign className="mr-2" />
                  Fixed Commission Amount ($)
                </h3>
                <div className="px-2">
                  <div className="flex justify-between mb-2">
                    <span>${fixedCommissionRange[0]}</span>
                    <span>${fixedCommissionRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={fixedCommissionRange[1]}
                    onChange={(e) => setFixedCommissionRange([fixedCommissionRange[0], parseInt(e.target.value)])}
                    className="w-full"
                    disabled={commissionType === 'percentage'}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <FiCalendar className="mr-2" />
                  Date Added
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`p-3 rounded-md border ${dateRange === 'all' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setDateRange('all')}
                  >
                    <span>All Time</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${dateRange === 'recent' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setDateRange('recent')}
                  >
                    <span>Recent (30 days)</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${dateRange === 'this-month' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setDateRange('this-month')}
                  >
                    <span>This Month</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${dateRange === 'last-month' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}
                    onClick={() => setDateRange('last-month')}
                  >
                    <span>Last Month</span>
                  </button>
                  <button
                    className={`p-3 rounded-md border ${dateRange === 'custom' ? 'bg-orange-50 border-orange-300' : 'bg-white'} col-span-2`}
                    onClick={() => setDateRange('custom')}
                  >
                    <span>Custom Range</span>
                  </button>
                </div>

                {dateRange === 'custom' && (
                  <div className="mt-2 space-y-3 bg-gray-50 p-3 rounded-md">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Start Date:</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setDateFilter([date, dateFilter[1]]);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">End Date:</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setDateFilter([dateFilter[0], date]);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => resetFilters()}
              >
                Reset Filters
              </Button>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => setFilterSheetOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 