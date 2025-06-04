import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';

interface ImageUploaderProps {
  initialImages?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  initialImages = [], 
  onChange,
  maxImages = 5
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    setUploadProgress(Array(e.target.files.length).fill(0));
    
    const files = Array.from(e.target.files);
    const newImageUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload the image
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Upload error:', error);
          continue;
        }
        
        const result = await response.json();
        if (result.success && result.url) {
          newImageUrls.push(result.url);
          
          // Update progress
          const newProgress = [...uploadProgress];
          newProgress[i] = 100;
          setUploadProgress(newProgress);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    // Combine with existing images but respect maxImages limit
    const updatedImages = [...images, ...newImageUrls].slice(0, maxImages);
    
    setImages(updatedImages);
    onChange(updatedImages);
    setIsUploading(false);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative">
            <div className="w-24 h-24 border rounded-md overflow-hidden">
              <Image 
                src={url} 
                alt={`Image ${index + 1}`} 
                width={96} 
                height={96} 
                className="object-cover w-full h-full"
              />
            </div>
            <button 
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              &times;
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div 
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-gray-500">+</span>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || images.length >= maxImages}
      >
        {isUploading ? 'Uploading...' : 'Upload Images'}
      </Button>
    </div>
  );
};

export default ImageUploader; 