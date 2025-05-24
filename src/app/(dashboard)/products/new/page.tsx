'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiDollarSign, FiSave, FiUpload, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { productService, authService } from '@/lib/api';
import Cookies from 'js-cookie';

// Function to generate image URL instead of storing base64
const generateImageUrl = async (imageData: string): Promise<string> => {
  try {
    // Create a FormData object
    const formData = new FormData();
    const blob = await fetch(imageData).then(r => r.blob());
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
    console.log('Upload response:', data); // Debug the response
    
    // Return the URL as-is without modifying it
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Fallback to a placeholder image if upload fails
    return 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Image';
  }
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    images: [] as string[]
  });

  // Check user role on component mount
  useEffect(() => {
    async function checkUserPermission() {
      try {
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
        
        // Check if user has permission to create products
        if (!userData || (userData.role !== 'business' && userData.role !== 'admin')) {
          toast.error('Only business and admin users can create products');
          router.push('/products');
        }
        
        setAuthChecked(true);
      } catch (err) {
        console.error('Authentication error:', err);
        toast.error('You need to be logged in to create products');
        router.push('/login');
      }
    }

    checkUserPermission();
  }, [router]);

  // Debug: Log when images change
  useEffect(() => { 
    console.log('Images in form state:', form.images);
    
    // Check if any images start with /uploads and try to validate them
    form.images.forEach((url, index) => {
      if (url.startsWith('/uploads')) {
        const fullUrl = `${window.location.origin}${url}`;
        console.log(`Testing image ${index} accessibility:`, fullUrl);
        
        // Create a test image to see if it loads
        const img = new Image();
        img.onload = () => console.log(`Image ${index} loaded successfully:`, fullUrl);
        img.onerror = () => console.error(`Image ${index} failed to load:`, fullUrl);
        img.src = fullUrl;
      }
    });
  }, [form.images]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Input validation
    if (name === 'name' && value.length > 100) {
      toast.error('Product name cannot exceed 100 characters');
      return;
    }
    
    if ((name === 'price' || name === 'commissionRate') && value && Number(value) < 0) {
      toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} cannot be negative`);
      return;
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
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

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          // Resize logic
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
          
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to jpeg with reduced quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          try {
            const imageUrl = await generateImageUrl(dataUrl);
            resolve(imageUrl);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File): Promise<boolean> => {
    // Validate image type
    if (!file.type.startsWith('image/')) {
      toast.error(`File "${file.name}" is not an image`);
      return false;
    }
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File "${file.name}" is too large (max 5MB)`);
      return false;
    }
    
    try {
      console.log('Processing image:', file.name);
      const imageUrl = await processImage(file);
      console.log('Image processed successfully, URL:', imageUrl);
      setForm(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      return true;
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(`Failed to process image "${file.name}"`);
      return false;
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await handleImageUpload(file);
      }
    } else if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'string' && e.dataTransfer.items[i].type === 'text/plain') {
          e.dataTransfer.items[i].getAsString((url) => {
            if (isValidUrl(url) && (url.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
              setForm(prev => ({
                ...prev,
                images: [...prev.images, url]
              }));
            } else {
              toast.error('Please drop a valid image URL');
            }
          });
        }
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    for (const file of files) {
      await handleImageUpload(file);
    }
    
    // Reset the input
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure user has permission to create products
    if (!currentUser || (currentUser.role !== 'business' && currentUser.role !== 'admin')) {
      toast.error('Only business and admin users can create products');
      return;
    }
    
    // Validate all fields
    const validationErrors = [];
    
    if (!form.name) validationErrors.push('Product name is required');
    if (!form.description) validationErrors.push('Description is required');
    if (!form.price) validationErrors.push('Price is required');
    if (!form.category) validationErrors.push('Category is required');
    if (!form.commissionRate) validationErrors.push('Commission rate is required');
    
    if (form.name && (form.name.length < 3 || form.name.length > 100)) {
      validationErrors.push('Product name must be between 3 and 100 characters');
    }
    
    if (form.price && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)) {
      validationErrors.push('Price must be a positive number');
    }
    
    if (form.commissionRate && (isNaN(parseFloat(form.commissionRate)) || parseFloat(form.commissionRate) < 0)) {
      validationErrors.push('Commission rate must be a positive number');
    }
    
    if (form.images.length === 0) {
      validationErrors.push('Please add at least one product image');
    }
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload all images first
      const uploadedImageUrls = await Promise.all(
        form.images.map(async (imageData) => {
          if (imageData.startsWith('data:')) {
            // This is a base64 image, need to upload it
            return await generateImageUrl(imageData);
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
      
      const response = await productService.createProduct(payload);
      toast.success('Product created successfully');
      router.push('/products');
    } catch (error: any) {
      console.error('API error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.message || String(err));
        });
      } else {
        toast.error('Failed to create product: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if auth check is not complete
  if (!authChecked) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
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
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
            } transition-colors duration-200`}
            onDragEnter={(e) => {e.preventDefault(); e.stopPropagation(); setIsDragging(true);}}
            onDragOver={(e) => {e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true);}}
            onDragLeave={(e) => {e.preventDefault(); e.stopPropagation(); setIsDragging(false);}}
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
                  Support for JPG, PNG, GIF up to 5MB each
                </p>
              </div>
            </div>
          </div>
          
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {form.images. map((url, index) => {
                console.log('Image URL:', url); // Debug log to see the URL
                return (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Product image ${index + 1}`} 
                    className="w-full h-24 object-cover rounded border"
                    onError={(e) => {
                      console.error('Image failed to load:', url);
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
              )})}
            </div>
          )}
          
          {form.images.length === 0 && (
            <p className="text-sm text-gray-500 italic mt-2">No images added yet. Please add at least one image.</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Creating...' : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 