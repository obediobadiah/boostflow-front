'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiTrash2, FiDollarSign, FiPackage, FiTag, FiCalendar, FiBarChart2, FiToggleLeft, FiToggleRight, FiShare2, FiEye, FiUser, FiCopy as FiDuplicate } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok, FaYoutube, FaLinkedinIn, FaPinterestP } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { productService, promotionService } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // Safely access the id parameter
  const productId = params?.id;

  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useState(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [isPromoter, setIsPromoter] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const socialMediaPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: <FaFacebookF className="h-5 w-5" />, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="h-5 w-5" />, color: '#E4405F' },
    { id: 'twitter', name: 'Twitter', icon: <FaTwitter className="h-5 w-5" />, color: '#1DA1F2' },
    { id: 'tiktok', name: 'TikTok', icon: <FaTiktok className="h-5 w-5" />, color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedinIn className="h-5 w-5" />, color: '#0A66C2' },
    { id: 'youtube', name: 'YouTube', icon: <FaYoutube className="h-5 w-5" />, color: '#FF0000' },
    { id: 'pinterest', name: 'Pinterest', icon: <FaPinterestP className="h-5 w-5" />, color: '#E60023' },
  ];

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        // Get authentication token
        const token = localStorage.getItem('token');

        if (!token) {
          setIsPromoter(false);
          setIsAdmin(false);
          return;
        }

        // Fetch current user data with auth token
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
          }
          setIsPromoter(false);
          setIsAdmin(false);
          return;
        }

        const userData = await response.json();
        setCurrentUser(userData);

        // Set user roles based on response
        const userIsAdmin = userData.role === 'admin';
        setIsAdmin(userIsAdmin);
        setIsPromoter(userData.role === 'promoter' || userIsAdmin);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    }

    fetchUserInfo();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await productService.getProductById(productId);
        const productData = response.product || response;
        setProduct(productData);

        // Check if current user is the owner of this product
        if (currentUser && productData) {
          const isDirectOwner = currentUser.id === productData.ownerId;
          const isCreator = productData.createdBy && currentUser.id === productData.createdBy.id;
          const hasAdminAccess = currentUser.role === 'admin';

          setIsOwner(isDirectOwner || isCreator || hasAdminAccess);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
        toast.error('Could not load product details');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, currentUser]);

  const handleDeleteProduct = async () => {
    try {
      setProcessingAction(true);
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      router.push('/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    } finally {
      setProcessingAction(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      setProcessingAction(true);
      const newStatus = !product.active;

      // Create payload with all required fields
      const payload = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        commissionRate: product.commissionRate,
        commissionType: product.commissionType,
        images: product.images,
        active: newStatus
      };

      await productService.updateProduct(productId, payload);
      setProduct({ ...product, active: newStatus });
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating product status:', err);
      toast.error('Failed to update product status');
    } finally {
      setProcessingAction(false);
      setStatusDialogOpen(false);
    }
  };

  // Handle promotion creation
  const handlePromoteProduct = async () => {
    try {
      if (!product) {
        toast.error('Product not found');
        return;
      }
      
      if (selectedPlatforms.length === 0) {
        toast.error('Please select at least one social media platform');
        return;
      }

      setIsCreatingPromotion(true);

      // Create the content to be copied to clipboard
      const title = product.name;
      const description = product.description;
      const price = `$${parseFloat(product.price).toFixed(2)}`;
      const link = product.affiliateLink || window.location.href;
      
      // Format text content
      const textToCopy = `${title}\n\n${description}\n\nPrice: ${price}\n\n${link}`;
      
      // Copy text to clipboard
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Product details copied to clipboard!');
      
      // Open social media windows for each selected platform
      selectedPlatforms.forEach(platformId => {
        const platform = socialMediaPlatforms.find(p => p.id === platformId);
        if (platform) {
          openSocialMediaPostWindow(platformId);
        }
      });

      // Create the promotion in the database
      const response = await promotionService.createPromotion({
        productId: parseInt(productId, 10),
        affiliateLink: product.affiliateLink,
        description: product.description,
        customImages: product.images,
        autoPostToSocial: true,
        commissionRate: product.commissionRate,
        commissionType: product.commissionType,
        platforms: selectedPlatforms
      });

      console.log('Promotion created successfully:', response);
      toast.success('Product promoted successfully!');
      
      // Don't close the modal, let the user manually copy the image
      // setShowPromoteModal(false);
      
      // Only redirect after successful promotion creation and user confirmation
      // router.push('/promotions');
    } catch (error: any) {
      console.error('Error creating promotion:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'You are already promoting this product');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to create promotion');
      }
    } finally {
      setIsCreatingPromotion(false);
    }
  };

  const openSocialMediaPostWindow = (platformId: string) => {
    let url = '';
    
    switch (platformId) {
      case 'facebook':
        url = 'https://www.facebook.com/';
        break;
      case 'twitter':
        url = 'https://twitter.com/compose/tweet';
        break;
      case 'linkedin':
        url = 'https://www.linkedin.com/feed/';
        break;
      case 'pinterest':
        url = 'https://pinterest.com/';
        break;
      case 'instagram':
        url = 'https://www.instagram.com/';
        break;
      case 'tiktok':
        url = 'https://www.tiktok.com/upload';
        break;
      case 'youtube':
        url = 'https://studio.youtube.com/';
        break;
      default:
        url = '';
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=600');
    }
  };

  const handlePromotionClick = () => {
    setSelectedPlatforms([]);
    setShowPromoteModal(true);
  };

  const togglePlatformSelection = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId) 
        : [...prev, platformId]
    );
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  // Handle navigation between product images
  const navigateImage = (direction: 'next' | 'prev') => {
    if (!product?.images?.length) return;

    if (direction === 'next') {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleDuplicateProduct = async () => {
    if (!product) return;

    try {
      setDuplicating(true);

      const response = await productService.duplicateProduct(productId);
      toast.success('Product duplicated successfully');

      // Extract the new product ID from the response
      let newProductId = null;

      if (response.product?.id) {
        newProductId = response.product.id;
      } else if (response.id) {
        newProductId = response.id;
      } else if (typeof response === 'object') {
        for (const key in response) {
          if (response[key] && response[key].id) {
            newProductId = response[key].id;
            break;
          }
        }
      }

      if (newProductId) {
        router.push(`/products/${newProductId}`);
      } else {
        router.push('/products');
      }
    } catch (err: any) {
      console.error('Error duplicating product:', err);

      let errorMessage = 'Failed to duplicate product';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setDuplicating(false);
      setDuplicateDialogOpen(false);
    }
  };

  // Add a helper function to go to promotions page
  const goToPromotionsPage = () => {
    setShowPromoteModal(false);
    router.push('/promotions');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error || 'Product not found'}
        </h1>
        <Link href="/products" className="text-orange-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const commissionDisplay = product.commissionType === 'percentage'
    ? `${product.commissionRate}%`
    : `$${parseFloat(product.commissionRate).toFixed(2)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link href="/products">
              <Button variant="outline" size="sm" className="h-9 px-3 py-0 text-sm">
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>


          {(isOwner || isAdmin) && (
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/products/${productId}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 py-0 text-sm"
                >
                  <FiEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {(isOwner || isAdmin) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusDialogOpen(true)}
                    className={`h-9 px-3 py-0 text-sm ${product?.active ? "text-yellow-600 border-yellow-600 hover:bg-yellow-50" : "text-green-600 border-green-600 hover:bg-green-50"}`}
                  >
                    {product?.active ? (
                      <>
                        <FiToggleRight className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <FiToggleLeft className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 h-9 px-3 py-0 text-sm"
                onClick={() => setDuplicateDialogOpen(true)}
              >
                <FiDuplicate className="h-4 w-4 mr-2" />
                Duplicate
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50 h-9 px-3 py-0 text-sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="py-6 flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Images */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-medium">Product Images</h2>
            {product.images && product.images.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => openImageViewer(0)}>
                <FiEye className="h-4 w-4 mr-2" />
                View All
              </Button>
            )}
          </div>

          <div className="p-4">
            {product.images && product.images.length > 0 ? (
              <div>
                <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 cursor-pointer" onClick={() => openImageViewer(0)}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';
                    }}
                  />
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    {product.images.slice(1).map((image: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => openImageViewer(index + 1)}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - image ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No images available
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* {(isPromoter || isAdmin) && ( */}
          {product?.active ? (
            <>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 flex items-center justify-center gap-2 rounded-lg shadow-md"
                onClick={handlePromotionClick}
                disabled={isCreatingPromotion}
              >
                <FiShare2 className="h-5 w-5" />
                {isCreatingPromotion ? 'Creating Promotion...' : 'Promote This Product'}
              </Button>
            </>
          ) : (
            <>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 flex items-center justify-center gap-2 rounded-lg shadow-md"
                onClick={handlePromotionClick}
                disabled={true}
              >
                <FiShare2 className="h-5 w-5" />
                {isCreatingPromotion ? 'Creating Promotion...' : 'Promote This Product'}
              </Button>
              <p className='text-sm text-red-600'>You cannot promote an Inactive Product.</p>
            </>
          )}
          {/* )} */}

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Product Details</h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiDollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="text-lg font-bold">${parseFloat(product.price).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiUser className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Product Owner</h3>
                  <p className="text-sm">{product.owner?.name || product.createdBy?.name || "Unknown owner"}</p>
                  {(product.owner?.email || product.createdBy?.email) && (
                    <p className="text-xs text-gray-500">{product.owner?.email || product.createdBy?.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiToggleRight className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="flex items-center">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiTag className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Commission</h3>
                  <p className="text-lg font-medium text-orange-600">{commissionDisplay}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiPackage className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="capitalize">{product.category}</p>
                </div>
              </div>

              {product.affiliateLink && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Affiliate Link</h3>
                  <a
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline break-all text-sm"
                  >
                    {product.affiliateLink}
                  </a>
                </div>
              )}

              {product.sourcePlatform && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Source Platform</h3>
                  <p className="text-sm">{product.sourcePlatform}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Sales Information</h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiBarChart2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sales Count</h3>
                  <p className="text-lg font-bold">{product.salesCount || 0}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiCalendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Added On</h3>
                  <p>{formatDate(product.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <FiCalendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p>{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-medium">Description</h2>
        </div>

        <div className="p-4">
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={processingAction}
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={processingAction}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingAction ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a copy of "{product?.name}" with all the same details.
              The new product will be named "{product?.name} (Copy)".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={duplicating}
              onClick={() => setDuplicateDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicateProduct}
              disabled={duplicating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {duplicating ? 'Duplicating...' : 'Duplicate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {product?.active
                ? 'Are you sure you want to deactivate this product?'
                : 'Are you sure you want to activate this product?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {product?.active
                ? 'Deactivating will hide this product from promoters and the marketplace.'
                : 'Activating will make this product visible to promoters and the marketplace.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={processingAction}
              className={product?.active ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
            >
              {processingAction
                ? (product?.active ? 'Deactivating...' : 'Activating...')
                : (product?.active ? 'Deactivate' : 'Activate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Dialog */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Product Images</DialogTitle>
            <DialogDescription>
              {`Image ${currentImageIndex + 1} of ${product?.images?.length || 0}`}
            </DialogDescription>
          </DialogHeader>

          <div className="relative overflow-hidden rounded-md bg-black/5 h-[60vh]">
            {product?.images?.length > 0 && (
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.name} - image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';
                }}
              />
            )}

            {product?.images?.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                  onClick={() => navigateImage('prev')}
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                  onClick={() => navigateImage('next')}
                >
                  <FiArrowLeft className="h-5 w-5 rotate-180" />
                </button>
              </>
            )}
          </div>

          {product?.images?.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              {product.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className={`aspect-square rounded-md overflow-hidden cursor-pointer ${currentImageIndex === index ? 'ring-2 ring-orange-500' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} - thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setImageViewerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote on Social Media Dialog */}
      <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Promote on Social Media</DialogTitle>
            <DialogDescription>
              Select the social media platforms where you want to share this product.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-3">
            {socialMediaPlatforms.map((platform) => (
              <div 
                key={platform.id}
                className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-all ${
                  selectedPlatforms.includes(platform.id) 
                    ? 'border-2 border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePlatformSelection(platform.id)}
              >
                <div className="flex-shrink-0">
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-full" 
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    <div className="text-center" style={{ color: platform.color }}>
                      {platform.icon}
                    </div>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">{platform.name}</div>
                    <Checkbox 
                      checked={selectedPlatforms.includes(platform.id)} 
                      onCheckedChange={() => togglePlatformSelection(platform.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isCreatingPromotion ? (
            <div className="mt-4 text-sm text-gray-500">
              <p>We're creating your promotion...</p>
            </div>
          ) : product && product.images && product.images.length > 0 && !isCreatingPromotion ? (
            <div className="mt-4 border rounded-md p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-3">Right-click on any image and select "Copy Image" to copy it</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {product.images.map((image:any, index:any) => (
                  <div key={index} className="relative border rounded overflow-hidden aspect-square">
                    <img 
                      src={image} 
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">Promotion Steps:</h4>
            <div className="text-sm text-gray-700">
              {isCreatingPromotion ? (
                <p>Please wait while we create your promotion...</p>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="font-medium">Step 1: Create Promotion</p>
                    <p className="text-sm text-gray-500 ml-5">Click "Promote Now" to copy product details to clipboard and create your promotion</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium">Step 2: Share Images (Choose one option)</p>
                    <ul className="list-disc list-inside ml-5 text-sm text-gray-500 space-y-1">
                      <li>Option 1: Right-click on each image → select "Copy Image" → paste into social media</li>
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium">Step 3: Paste & Post</p>
                    <p className="text-sm text-gray-500 ml-5">Paste the copied text and images into your social media posts</p>
                  </div>
                  
                </>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 sm:justify-between">
            {!isCreatingPromotion ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPromoteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePromoteProduct}
                  disabled={selectedPlatforms.length === 0}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Promote Now
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={goToPromotionsPage}
                className="ml-auto"
              >
                Go to Promotions Page
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 