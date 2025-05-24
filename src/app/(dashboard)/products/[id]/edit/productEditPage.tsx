'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiDollarSign, FiSave, FiUpload, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import api, { productService, authService } from '@/lib/api';

export default function EditProductPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Properly unwrap params with React.use(), using type guard to check if it's a Promise
  const id = (!('then' in params)) ? params.id : React.use(params).id;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    commissionRate: '',
    commissionType: 'percentage',
    affiliateLink: '',
    sourcePlatform: '',
    active: true,
    images: [] as string[]
  });
  const [isDragging, setIsDragging] = useState(false);

  // First fetch current user to check permissions
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        // Get current user info using authService instead of direct fetch
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
        setAuthChecked(true);
      } catch (err) {
        console.error('Error fetching user info:', err);
        toast.error('You need to be logged in to edit products');
        router.push('/login');
      }
    }

    fetchUserInfo();
  }, [router]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!authChecked) return; // Don't fetch until auth is checked

        const product = await productService.getProductById(id);
        if (product) {
          // Check if current user is the owner of this product
          const isUserOwner = 
            currentUser.id === product.ownerId || 
            currentUser.id === product.createdBy?.id ||
            currentUser.role === 'admin';

          if (!isUserOwner) {
            toast.error('You do not have permission to edit this product');
            router.push(`/products/${id}`);
            return;
          }

          setIsOwner(isUserOwner);
          setForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            commissionRate: product.commissionRate.toString(),
            commissionType: product.commissionType,
            affiliateLink: product.affiliateLink || '',
            sourcePlatform: product.sourcePlatform || '',
            active: product.active,
            images: product.images || []
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    if (authChecked) {
      fetchProduct();
    }
  }, [id, router, authChecked, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Process dropped items
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface for handling files
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        
        // Check if the item is an image
        if (item.kind === 'file' && item.type.match(/^image\//)) {
          const file = item.getAsFile();
          if (file) {
            try {
              // In a real implementation, you would upload this file to your server/storage
              // For now, we'll convert it to a data URL
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result) {
                  const dataUrl = event.target.result.toString();
                  setForm(prev => ({
                    ...prev,
                    images: [...prev.images, dataUrl]
                  }));
                }
              };
              reader.readAsDataURL(file);
            } catch (error) {
              console.error('Error processing dropped image:', error);
              toast.error('Failed to process image');
            }
          }
        } else if (item.kind === 'string' && item.type === 'text/uri-list') {
          // Handle dropped URLs
          item.getAsString((url) => {
            if (isValidUrl(url)) {
              setForm(prev => ({
                ...prev,
                images: [...prev.images, url]
              }));
            } else {
              toast.error('Dropped URL is not valid');
            }
          });
        }
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process selected files
    for (const file of Array.from(files)) {
      if (file.type.match(/^image\//)) {
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            if (event.target?.result) {
              const dataUrl = event.target.result.toString();
              try {
                // Create a FormData object for upload
                const formData = new FormData();
                const blob = await fetch(dataUrl).then(r => r.blob());
                formData.append('image', blob, 'product-image.jpg');

                // Upload to your backend
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                });

                if (!response.ok) {
                  throw new Error('Failed to upload image');
                }

                const data = await response.json();
                setForm(prev => ({
                  ...prev,
                  images: [...prev.images, data.url]
                }));
              } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image');
                // Fallback to using data URL directly if upload fails
                setForm(prev => ({
                  ...prev,
                  images: [...prev.images, dataUrl]
                }));
              }
            }
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error('Failed to process image');
        }
      } else {
        toast.error(`File "${file.name}" is not an image`);
      }
    }
    
    // Reset the input
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    const validationErrors = [];
    
    if (!form.name) validationErrors.push('Product name is required');
    if (!form.description) validationErrors.push('Description is required');
    if (!form.price) validationErrors.push('Price is required');
    if (!form.category) validationErrors.push('Category is required');
    if (!form.commissionRate) validationErrors.push('Commission rate is required');
    
    if (form.name && (form.name.length < 3 || form.name.length > 100)) {
      validationErrors.push('Product name must be between 3 and 100 characters');
    }
    
    if (form.images.length === 0) {
      validationErrors.push('Please add at least one product image');
    }
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    setSaving(true);
    
    try {
      // Upload all images that are still in data URL format
      const uploadedImageUrls = await Promise.all(
        form.images.map(async (imageData) => {
          if (imageData.startsWith('data:')) {
            // This is a base64 image, need to upload it
            try {
              // Create a FormData object
              const formData = new FormData();
              const blob = await fetch(imageData).then(r => r.blob());
              formData.append('image', blob, 'product-image.jpg');
        
              // Upload to backend
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              });
        
              if (!response.ok) {
                throw new Error('Failed to upload image');
              }
        
              const data = await response.json();
              return data.url;
            } catch (error) {
              console.error('Error uploading image:', error);
              // Fallback to a placeholder if upload fails
              return 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';
            }
          }
          // This is already a URL, use it as is
          return imageData;
        })
      );
      
      const payload = {
        ...form,
        price: parseFloat(form.price),
        commissionRate: parseFloat(form.commissionRate),
        images: uploadedImageUrls
      };
      
      await productService.updateProduct(id, payload);
      toast.success('Product updated successfully');
      router.push(`/products/${id}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href={`/products/${id}`}>
            <Button variant="outline" size="sm">
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name * <span className="text-xs text-gray-500">({form.name.length}/100 characters)</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={100}
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Product name"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Product description"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active (Available for promotion)
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Category</option>
                  <option value="digital">Digital Product</option>
                  <option value="physical">Physical Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Rate *
                </label>
                <input
                  id="commissionRate"
                  name="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.commissionRate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Commission rate"
                />
              </div>
              
              <div>
                <label htmlFor="commissionType" className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Type *
                </label>
                <select
                  id="commissionType"
                  name="commissionType"
                  required
                  value={form.commissionType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700 mb-1">
                Affiliate Link (Optional)
              </label>
              <input
                id="affiliateLink"
                name="affiliateLink"
                type="url"
                value={form.affiliateLink}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Affiliate link URL"
              />
            </div>
            
            <div>
              <label htmlFor="sourcePlatform" className="block text-sm font-medium text-gray-700 mb-1">
                Source Platform (Optional)
              </label>
              <input
                id="sourcePlatform"
                name="sourcePlatform"
                type="text"
                value={form.sourcePlatform}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. Amazon, Shopify, etc."
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images *
          </label>
          
          {/* Drag and drop area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
            } transition-colors duration-200`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-orange-100 p-3">
                <FiUpload className="h-7 w-7 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Drag and drop images here, or
                </p>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center space-x-2">
                    <FiUpload className="h-4 w-4" />
                    <span>Browse files</span>
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Support for JPG, PNG, GIF up to 10MB each
                </p>
              </div>
            </div>
          </div>
          
          {/* Images preview */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {form.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Product image ${index + 1}`} 
                    className="w-full h-24 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/e2e8f0/64748b?text=Image+Error';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {form.images.length === 0 && (
            <p className="text-sm text-gray-500 italic mt-2">No images added yet. Please add at least one image.</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {saving ? 'Saving...' : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 