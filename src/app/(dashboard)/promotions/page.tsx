'use client';

import { useState, useEffect, useCallback } from 'react';
import NewPromotion from '@/components/promotion/NewPromotion';
import { Button } from '@/components/ui/button';
import { promotionService } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Filter, ArrowUpDown, Copy, ExternalLink, XCircle, X, ShoppingBag, Check, Link } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// This would be from your API
interface Promotion {
  id: number;
  trackingCode: string;
  affiliateLink: string;
  clicks: number;
  conversions: number;
  earnings: string | number;
  createdAt: string;
  status: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    category?: string;
    owner: {
      name: string;
      email: string;
    };
  };
  promoter: {
    name: string;
    email: string;
    role: string;
  };
}

// Helper function to safely format earnings
const formatEarnings = (earnings: string | number): string => {
  const numValue = typeof earnings === 'string' ? parseFloat(earnings) : earnings;
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length > 0) {
      // Extract unique categories for filter options
      const categories = [...new Set(promotions.map(p => p.product.category || 'Uncategorized'))];
      setProductCategories(['all', ...categories]);
      
      // Apply filters
      applyFilters();
    }
  }, [promotions, searchQuery, statusFilter, sortBy, categoryFilter]);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await promotionService.getMyPromotions();
      
      if (data && data.promotions) {
        setPromotions(data.promotions);
        setIsAdmin(data.isAdmin || false);
      } else {
        setPromotions([]);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = () => {
    let filtered = [...promotions];
    
    // Filter by search query (product name or tracking code)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.product.name.toLowerCase().includes(query) || 
        p.trackingCode.toLowerCase().includes(query)
      );
    }
    
    // Filter by status if statusFilter is not 'all'
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Filter by category if categoryFilter is not 'all'
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => (p.product.category || 'Uncategorized') === categoryFilter);
    }
    
    // Sort results
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'earnings_high':
        filtered.sort((a, b) => parseFloat(formatEarnings(b.earnings)) - parseFloat(formatEarnings(a.earnings)));
        break;
      case 'earnings_low':
        filtered.sort((a, b) => parseFloat(formatEarnings(a.earnings)) - parseFloat(formatEarnings(b.earnings)));
        break;
      case 'clicks_high':
        filtered.sort((a, b) => b.clicks - a.clicks);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.product.name.localeCompare(b.product.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.product.name.localeCompare(a.product.name));
        break;
    }
    
    setFilteredPromotions(filtered);
  };

  const openDetailsModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
  };

  const navigateToProduct = (productId: number) => {
    window.location.href = `/products/${productId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Affiliate Link Copied!', {
      // description: 'The link has been copied to your clipboard',
      // action: {
      //   label: 'Dismiss',
      //   onClick: () => console.log('Dismissed'),
      // },
      icon: <Check className="h-4 w-4" />,
      position: 'top-center',
      duration: 3000,
    });
  };

  const handleDeletePromotion = async (promotionId: number) => {
    try {
      setIsDeleting(true);
      await promotionService.deletePromotion(promotionId.toString());
      toast.success('Promotion deleted successfully');
      closeDetailsModal();
      fetchPromotions(); // Refresh the promotions list
    } catch (error: any) {
      console.error('Error deleting promotion:', error);
      toast.error(error.response?.data?.message || 'Failed to delete promotion');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderPromotionCard = (promotion: Promotion) => {
    return (
      <Card key={promotion.id} className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold">{promotion.product.name}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                ${promotion.product.price} • Owner: {promotion.product.owner.name}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(promotion.status || 'active')}>
              {promotion.status || 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Tracking Code</div>
              <div className="font-mono text-sm mt-1">{promotion.trackingCode}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Clicks</div>
              <div className="font-semibold mt-1">{promotion.clicks}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Earnings</div>
              <div className="font-semibold text-green-600 mt-1">${formatEarnings(promotion.earnings)}</div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="text-xs text-gray-500 mt-2">
              Promoted by: {promotion.promoter.name} ({promotion.promoter.role})
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex space-x-2 justify-end">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyLink(promotion.affiliateLink)}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy Link
          </Button> */}
          <Button
            variant="default"
            size="sm"
            onClick={() => openDetailsModal(promotion)}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Details
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Toaster component for notifications */}
      <Toaster richColors />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Your Promotions</h1>
        <Button
          onClick={() => window.location.href = '/products'}
          variant="default"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        >
          Create New Promotion
        </Button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products or tracking codes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {productCategories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="earnings_high">Highest Earnings</option>
              <option value="earnings_low">Lowest Earnings</option>
              <option value="clicks_high">Most Clicks</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
          
          {(searchQuery || categoryFilter !== 'all' || sortBy !== 'newest') && (
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setSortBy('newest');
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      ) : !filteredPromotions || filteredPromotions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'all' || sortBy !== 'newest'
              ? "No promotions match your current filters. Try adjusting your search criteria."
              : "You haven't created any promotions yet. Start promoting products to earn commissions."}
          </p>
          <Button onClick={() => window.location.href = '/products'} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Create Your First Promotion
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPromotions.map(renderPromotionCard)}
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{selectedPromotion.product.name}</h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={closeDetailsModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Promotion Status and Info */}
              <div className="flex flex-wrap justify-between mb-6">
                <Badge className={getStatusColor(selectedPromotion.status || 'active')}>
                  {selectedPromotion.status || 'Active'}
                </Badge>
                <p className="text-sm text-gray-500">Created: {formatDate(selectedPromotion.createdAt)}</p>
              </div>
              
              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Clicks</div>
                  <div className="text-2xl font-bold">{selectedPromotion.clicks}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Conversions</div>
                  <div className="text-2xl font-bold">{selectedPromotion.conversions}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Earnings</div>
                  <div className="text-2xl font-bold text-green-600">${formatEarnings(selectedPromotion.earnings)}</div>
                </div>
              </div>
              
              {/* Product and Tracking Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Product Description</h3>
                  <p className="text-gray-600 text-sm">{selectedPromotion.product.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Tracking Code</h3>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm block">{selectedPromotion.trackingCode}</code>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Affiliate Link</h3>
                  <div className="flex items-center">
                    <input 
                      className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm mr-2 overflow-hidden text-ellipsis" 
                      value={selectedPromotion.affiliateLink} 
                      readOnly 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(selectedPromotion.affiliateLink)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeDetailsModal}>
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Promotion'}
                </Button>
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={() => navigateToProduct(selectedPromotion.product.id)}
              >
                <ShoppingBag className="h-4 w-4 mr-2" /> Go to Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promotion
              and remove it from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPromotion && handleDeletePromotion(selectedPromotion.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 