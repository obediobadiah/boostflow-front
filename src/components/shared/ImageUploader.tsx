import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    
    // For the purpose of this demo, we'll just create fake image URLs
    // In a real application, you would upload these to a server/cloud storage
    const newImages = Array.from(e.target.files).map(file => {
      const id = Math.random().toString(36).substring(2, 9);
      // Create a fake URL - in a real app, this would be the URL from your server/cloud
      return `https://example.com/image-${id}.jpg`;
    });
    
    // Combine with existing images but respect maxImages limit
    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    
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
              {/* In a real app, this would show the actual image */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                Image {index + 1}
              </div>
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